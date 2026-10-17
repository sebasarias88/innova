"use client";

/**
 * Opens WhatsApp in a new tab on computers, so the store stays open behind it.
 * The tab must be opened during the click (browsers block pop-ups opened after
 * an `await`), so it starts empty and receives the URL once the order/booking
 * is saved. On phones the link opens the WhatsApp app directly, so the current
 * tab is used as before.
 */
export function prepareWhatsAppTab() {
  const desktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const tab = desktop ? window.open("", "_blank") : null;
  if (tab) {
    tab.opener = null;
    tab.document.title = "Abriendo WhatsApp…";
  }
  return {
    /** Sends the new tab (or, without one, the current tab) to WhatsApp. */
    go(url: string) {
      if (tab && !tab.closed) tab.location.href = url;
      else window.location.assign(url);
    },
    cancel() {
      tab?.close();
    },
  };
}
