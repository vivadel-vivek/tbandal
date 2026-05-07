// Server-component shell — fetches catalog teas + contributors at
// request time and hands them to the client view. The client owns
// member state, mode tabs, and the rec algorithm.

import { getContributors, getTeas } from "@/lib/content";
import { RecommendationsView } from "@/components/recommendations/RecommendationsView";

export default async function RecommendationsPage() {
  const [teas, contributors] = await Promise.all([
    getTeas(),
    getContributors(),
  ]);
  return <RecommendationsView teas={teas} contributors={contributors} />;
}
