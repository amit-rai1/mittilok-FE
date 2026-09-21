import { useEffect } from "react";

export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export const ORDER_STATUS_LABELS: Record<number, string> = {
  0: "Pending",
  1: "Confirmed",
  2: "Processing",
  3: "Packed",
  4: "Shipped",
  5: "Out for Delivery",
  6: "Delivered",
  7: "Cancelled",
  8: "Returned",
  9: "Refund Initiated",
  10: "Refunded",
};

export const FESTIVAL_BOOKING_STATUS_LABELS: Record<string, string> = {
  PendingAdvance: "Pending advance",
  Confirmed: "Confirmed",
  Processing: "Processing",
  Ready: "Ready",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
  Refunded: "Refunded",
  0: "Pending advance",
  1: "Confirmed",
  2: "Processing",
  3: "Ready",
  4: "Delivered",
  5: "Cancelled",
  6: "Refunded",
};

export function festivalBookingStatusLabel(status: string | number): string {
  return FESTIVAL_BOOKING_STATUS_LABELS[String(status)] ?? String(status);
}

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | MittiLok Nursery` : "MittiLok Nursery";
  }, [title]);
}
