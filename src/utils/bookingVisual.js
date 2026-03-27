import { BOOKING_CARD, STATUS_THEME } from "./constants.js";

export function resolveBookingStatusKey(status) {
  const s = String(status ?? "").toLowerCase();
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("no-show") || s.includes("no show")) return "cancelled";
  if (s.includes("complete")) return "completed";
  if (s.includes("check") || s.includes("progress")) return "checkIn";
  return "confirmed";
}

export function getBookingCardBackground(booking) {
  const key = resolveBookingStatusKey(booking.status);
  const tint = STATUS_THEME[key]?.cardTint ?? "#F3F4F6";
  const svc = BOOKING_CARD[booking.cardKey]?.bg ?? "#E5E7EB";
  return `linear-gradient(180deg, ${tint} 0%, ${svc} 92%)`;
}

export function statusLabelForPanel(status) {
  const key = resolveBookingStatusKey(status);
  if (key === "checkIn") return "Check-in (In Progress)";
  if (key === "cancelled") return "Cancelled";
  if (key === "completed") return "Completed";
  return "Confirmed";
}
