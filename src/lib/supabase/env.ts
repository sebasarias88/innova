function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

// Server-only variables (no NEXT_PUBLIC_ prefix): every Supabase call runs on the
// server — Server Components, Server Actions and the proxy — so nothing reaches the browser.
export const supabaseUrl = () => required("SUPABASE_URL", process.env.SUPABASE_URL);
export const supabasePublishableKey = () => required("SUPABASE_PUBLISHABLE_KEY", process.env.SUPABASE_PUBLISHABLE_KEY);
