import { useEffect, useState } from "react";
import { api } from "./api";

type FestivalNavCampaign = { isBookingOpen?: boolean };

let cached: { open: boolean; at: number } | null = null;
const TTL_MS = 60_000;

/** True when at least one festival campaign is currently open for booking. */
export function useHasOpenFestival() {
  const [hasOpen, setHasOpen] = useState(() => cached?.open ?? false);

  useEffect(() => {
    let cancelled = false;
    const now = Date.now();
    if (cached && now - cached.at < TTL_MS) {
      setHasOpen(cached.open);
      return;
    }

    api<FestivalNavCampaign[]>("/festivals", { auth: false })
      .then((list) => {
        const open = (list ?? []).some((c) => c.isBookingOpen);
        cached = { open, at: Date.now() };
        if (!cancelled) setHasOpen(open);
      })
      .catch(() => {
        cached = { open: false, at: Date.now() };
        if (!cancelled) setHasOpen(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return hasOpen;
}
