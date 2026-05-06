"use client";

import type { Tea } from "@/lib/types";
import { useMember } from "@/contexts/MemberContext";
import { TeaCard } from "@/components/tea/TeaCard";

/**
 * Client island that renders the 3-column "Recently brewed" grid on the
 * home page. Reads `member.settings.flavorMode` to choose per-tea
 * hideReviews; the parent page stays RSC and passes the tea list down
 * as serializable JSON.
 *
 * Density was a tweaks-panel toggle (cozy / compact); the grid now
 * uses the cozy default unconditionally.
 */
export function RecentlyBrewedGrid({ teas }: { teas: Tea[] }) {
  const { isBlindFor } = useMember();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
      {teas.map((t) => (
        <TeaCard
          key={t.slug}
          tea={t}
          density="cozy"
          hideReviews={isBlindFor(t.slug)}
        />
      ))}
    </div>
  );
}
