"use client";

import type { Tea } from "@/lib/types";
import { useMember } from "@/contexts/MemberContext";
import { useTweaks } from "@/contexts/TweaksContext";
import { TeaCard } from "@/components/tea/TeaCard";

/**
 * Client island that renders the 3-column "Recently brewed" grid on the
 * home page. Reads `tweaks.density` and `member.settings.flavorMode` to
 * choose card density + per-tea hideReviews. The parent page stays RSC
 * and passes the tea list down as serializable JSON.
 */
export function RecentlyBrewedGrid({ teas }: { teas: Tea[] }) {
  const { isBlindFor } = useMember();
  const { tweaks } = useTweaks();
  const hide = (slug: string) => tweaks.hideReviews || isBlindFor(slug);

  return (
    <div className="grid grid-cols-3 gap-6">
      {teas.map((t) => (
        <TeaCard
          key={t.slug}
          tea={t}
          density={tweaks.density}
          hideReviews={hide(t.slug)}
        />
      ))}
    </div>
  );
}
