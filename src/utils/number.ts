export function formatDiscountPercent(v?: number): string {
  if (!v) return "0";
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}
