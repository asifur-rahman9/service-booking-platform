const money = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

export const formatMoney = (n: number) => money.format(n);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });

export const formatDateTime = (iso: string) => `${formatDate(iso)} · ${formatTime(iso)}`;

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** YYYY-MM-DD in local time. */
export function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const businessName = (b: unknown) =>
  typeof b === "object" && b !== null ? ((b as { business?: { name?: string } }).business?.name ?? "") : "";
