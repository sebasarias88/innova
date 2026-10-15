/** Reads an env var, tolerating stray spaces or quotes pasted into the Vercel dashboard. */
function read(name: string, value: string | undefined): string {
  const clean = value?.trim().replace(/^["']|["']$/g, "").trim();
  if (!clean) throw new Error(`Missing environment variable: ${name}`);
  return clean;
}

// Server-only variables (no NEXT_PUBLIC_ prefix): every Supabase call runs on the
// server — Server Components, Server Actions and the proxy — so nothing reaches the browser.
export const supabaseUrl = () => {
  const url = read("SUPABASE_URL", process.env.SUPABASE_URL).replace(/\/+$/, "");
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
    // Never log the value itself: it could be a key pasted in the wrong field.
    throw new Error("SUPABASE_URL must look like https://<project-ref>.supabase.co (check the value in Vercel).");
  }
  return url;
};

export const supabasePublishableKey = () => {
  const key = read("SUPABASE_PUBLISHABLE_KEY", process.env.SUPABASE_PUBLISHABLE_KEY);
  if (key.startsWith("sb_secret_")) throw new Error("SUPABASE_PUBLISHABLE_KEY contains a secret key. Use the sb_publishable_ key.");
  return key;
};
