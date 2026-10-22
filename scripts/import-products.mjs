#!/usr/bin/env node
/**
 * One-time import of the owners' product photos as DRAFT products.
 *
 *   node scripts/import-products.mjs                → shows what it would do (changes nothing)
 *   node scripts/import-products.mjs --apply        → creates the drafts and uploads the photos
 *   node scripts/import-products.mjs --apply --delete-demo
 *                                                   → also deletes the test products (SKU DEMO-* and TEST-PAY-*)
 *
 * Reads SUPABASE_URL and SUPABASE_SECRET_KEY from .env.local (never printed).
 * Photos come already optimized from scripts/import/images (WebP ≤150 KB + .thumb.webp).
 * Safe to run twice: products whose slug already exists are skipped.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const APPLY = process.argv.includes("--apply");
const DELETE_DEMO = process.argv.includes("--delete-demo");
const BUCKET = "media";

function loadEnv() {
  const env = {};
  const file = join(root, ".env.local");
  if (existsSync(file)) {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  }
  return { ...env, ...process.env };
}

const env = loadEnv();
if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local");
  process.exit(1);
}
const db = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

const manifest = JSON.parse(readFileSync(join(root, "scripts/import/products.json"), "utf8"));
const imagesDir = join(root, "scripts/import/images");
const thumbOf = (path) => path.replace(/\.[a-z0-9]+$/i, ".thumb.webp");

async function deleteDemo() {
  const { data: demo, error } = await db.from("products").select("id, name, sku, product_images(path)").or("sku.like.DEMO-%,sku.like.TEST-PAY-%");
  if (error) throw error;
  console.log(`\nProductos de prueba encontrados: ${demo.length}`);
  for (const p of demo) console.log(`  - ${p.sku} · ${p.name}`);
  if (!APPLY || !demo.length) return;
  const paths = demo.flatMap((p) => (p.product_images ?? []).flatMap((i) => [i.path, thumbOf(i.path)]));
  // Past orders keep a copy of name and price, so deleting products is safe.
  const { error: delError } = await db.from("products").delete().in("id", demo.map((p) => p.id));
  if (delError) throw delError;
  if (paths.length) await db.storage.from(BUCKET).remove(paths);
  console.log(`  ✔ Borrados ${demo.length} productos de prueba y ${paths.length} archivos.`);
}

async function importProducts() {
  const { data: categories, error } = await db.from("categories").select("id, slug");
  if (error) throw error;
  const categoryId = new Map(categories.map((c) => [c.slug, c.id]));

  console.log(`\nProductos a crear como BORRADOR: ${manifest.length}`);
  let created = 0;
  for (const item of manifest) {
    const cat = categoryId.get(item.category);
    if (!cat) {
      console.log(`  ✖ ${item.name}: no existe la categoría "${item.category}"`);
      continue;
    }
    const missing = item.images.filter((f) => !existsSync(join(imagesDir, f)) || !existsSync(join(imagesDir, thumbOf(f))));
    if (missing.length) {
      console.log(`  ✖ ${item.name}: faltan imágenes ${missing.join(", ")}`);
      continue;
    }
    const { data: existing } = await db.from("products").select("id").eq("slug", item.slug).maybeSingle();
    if (existing) {
      console.log(`  · ${item.name}: ya existe (/${item.slug}), se omite`);
      continue;
    }
    console.log(`  + ${item.name} → ${item.category} · ${item.images.length} foto(s)`);
    if (!APPLY) continue;

    const { data: product, error: insError } = await db
      .from("products")
      .insert({ name: item.name, slug: item.slug, category_id: cat, brand: item.brand ?? null, price: 0, is_published: false, is_available: true })
      .select("id")
      .single();
    if (insError) {
      console.log(`    ✖ no se pudo crear: ${insError.message}`);
      continue;
    }
    let order = 0;
    for (const file of item.images) {
      const path = `products/${product.id}/${randomUUID()}.webp`;
      const opts = { contentType: "image/webp", cacheControl: "31536000", upsert: false };
      const [a, b] = await Promise.all([
        db.storage.from(BUCKET).upload(path, readFileSync(join(imagesDir, file)), opts),
        db.storage.from(BUCKET).upload(thumbOf(path), readFileSync(join(imagesDir, thumbOf(file))), opts),
      ]);
      if (a.error || b.error) {
        console.log(`    ✖ ${file}: ${(a.error ?? b.error).message}`);
        continue;
      }
      const { error: imgError } = await db.from("product_images").insert({ product_id: product.id, path, alt: item.name, sort_order: order++ });
      if (imgError) console.log(`    ✖ ${file}: ${imgError.message}`);
    }
    created++;
  }
  if (APPLY) console.log(`\n✔ ${created} productos creados como borrador (no publicados, precio $0).`);
}

try {
  if (DELETE_DEMO) await deleteDemo();
  await importProducts();
  if (!APPLY) console.log("\nModo prueba: no se cambió nada. Agrega --apply para ejecutar.");
  else console.log("\nAbre el admin → Productos para completar precio, descripción y opciones, y publicarlos.");
} catch (e) {
  console.error("Error:", e.message ?? e);
  process.exit(1);
}
