import { api } from "./api";

const FALLBACK_WHATSAPP = "917905995960";

export function toWhatsAppNumber(raw?: string | null) {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return FALLBACK_WHATSAPP;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function whatsAppOrderUrl(message: string, number?: string | null) {
  return `https://wa.me/${toWhatsAppNumber(number)}?text=${encodeURIComponent(message)}`;
}

export async function getAdminWhatsAppNumber() {
  try {
    const result = await api<{ number?: string | null }>("/settings/admin-whatsapp", { auth: false });
    return toWhatsAppNumber(result.number);
  } catch {
    return FALLBACK_WHATSAPP;
  }
}
