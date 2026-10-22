"use client";

/**
 * Anonymous visit analytics (first-party, no cookies, no third parties).
 * Events are queued and sent in small batches with sendBeacon, so a visit
 * costs one or two requests instead of one per click.
 */
type QueuedEvent = { k: "pageview" | "click"; p: string; t?: string; l?: string };

const VISITOR_KEY = "innova-vid";
const SESSION_KEY = "innova-sid";
const SOURCE_KEY = "innova-src";
/** Set while someone of the store uses the admin panel: their visits are not counted. */
export const NO_TRACK_KEY = "innova-no-track";
const SESSION_IDLE_MS = 30 * 60 * 1000;
const MAX_BATCH = 20;

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16));

function storage(kind: "local" | "session") {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function disabled() {
  if (typeof window === "undefined") return true;
  if (navigator.webdriver) return true;
  return storage("local")?.getItem(NO_TRACK_KEY) === "1";
}

function visitorId() {
  const s = storage("local");
  let id = s?.getItem(VISITOR_KEY);
  if (!id) {
    id = uuid();
    s?.setItem(VISITOR_KEY, id);
  }
  return id;
}

/** A session ends after 30 minutes without activity. */
function sessionId() {
  const s = storage("session") ?? storage("local");
  const now = Date.now();
  try {
    const saved = JSON.parse(s?.getItem(SESSION_KEY) ?? "null") as { id: string; at: number } | null;
    if (saved && now - saved.at < SESSION_IDLE_MS) {
      s?.setItem(SESSION_KEY, JSON.stringify({ id: saved.id, at: now }));
      return { id: saved.id, isNew: false };
    }
  } catch {
    // corrupt value: start a new session
  }
  const id = uuid();
  s?.setItem(SESSION_KEY, JSON.stringify({ id, at: now }));
  return { id, isNew: true };
}

type Source = { source: string; medium?: string; campaign?: string; ref?: string };

/** Where the visit came from: UTM tags, ad click ids or the referring site. */
function detectSource(): Source {
  const params = new URLSearchParams(window.location.search);
  const utm = params.get("utm_source");
  let ref: string | undefined;
  try {
    const host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
    if (host && host !== window.location.hostname.replace(/^www\./, "")) ref = host;
  } catch {
    ref = undefined;
  }
  const medium = params.get("utm_medium") ?? undefined;
  const campaign = params.get("utm_campaign") ?? undefined;
  if (utm) return { source: utm.toLowerCase(), medium, campaign, ref };
  if (params.has("fbclid")) return { source: ref?.includes("instagram") ? "instagram" : "facebook", medium: "paid", ref };
  if (params.has("gclid") || params.has("gbraid") || params.has("wbraid")) return { source: "google", medium: "paid", ref };
  if (params.has("ttclid")) return { source: "tiktok", medium: "paid", ref };
  if (!ref) return { source: "direct" };
  const map: [RegExp, string][] = [
    [/(^|\.)facebook\.com$|(^|\.)fb\.com$|^fb\.me$/, "facebook"],
    [/instagram\.com$/, "instagram"],
    [/tiktok\.com$/, "tiktok"],
    [/(^|\.)google\./, "google"],
    [/bing\.com$/, "bing"],
    [/whatsapp\.com$|^wa\.me$/, "whatsapp"],
    [/youtube\.com$|^youtu\.be$/, "youtube"],
    [/(^|\.)t\.co$|twitter\.com$|(^|\.)x\.com$/, "x"],
    [/linkedin\.com$|lnkd\.in$/, "linkedin"],
  ];
  return { source: map.find(([re]) => re.test(ref))?.[1] ?? "other", ref };
}

function sessionSource(isNewSession: boolean): Source {
  const s = storage("session");
  if (!isNewSession) {
    try {
      const saved = JSON.parse(s?.getItem(SOURCE_KEY) ?? "null") as Source | null;
      if (saved?.source) return saved;
    } catch {
      // fall through
    }
  }
  const src = detectSource();
  s?.setItem(SOURCE_KEY, JSON.stringify(src));
  return src;
}

function flush() {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!queue.length || disabled()) {
    queue = [];
    return;
  }
  const session = sessionId();
  const body = JSON.stringify({ v: visitorId(), s: session.id, src: sessionSource(session.isNew), e: queue.slice(0, MAX_BATCH) });
  queue = queue.slice(MAX_BATCH);
  const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
  const sent = typeof navigator.sendBeacon === "function" && navigator.sendBeacon("/api/track", blob);
  if (!sent) fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "text/plain;charset=UTF-8" } }).catch(() => {});
  if (queue.length) flush();
}

function enqueue(event: QueuedEvent) {
  if (disabled()) return;
  queue.push({ ...event, p: event.p.slice(0, 200), l: event.l?.trim().slice(0, 140) || undefined });
  if (queue.length >= MAX_BATCH) return flush();
  if (!timer) timer = setTimeout(flush, 4000);
}

export function trackPageview(path: string, label?: string) {
  enqueue({ k: "pageview", p: path, l: label });
}

/** A meaningful action: whatsapp, call, add_to_cart, checkout_whatsapp… */
export function track(target: string, label?: string) {
  enqueue({ k: "click", p: window.location.pathname, t: target.slice(0, 40), l: label });
}

let listening = false;
/** Sends what is queued when the visitor leaves or hides the tab. */
export function listenForExit() {
  if (listening) return;
  listening = true;
  document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());
  window.addEventListener("pagehide", flush);
}
