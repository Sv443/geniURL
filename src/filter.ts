import type { MetaSearchHit, ScoredResults, SearchFilterArgs } from "@src/types.js";

export function filterSearchResults(_args: SearchFilterArgs, _results: MetaSearchHit[]): MetaSearchHit[] {
  const scored: ScoredResults<MetaSearchHit>[] = [];

  // TODO:
  // 1. check direct match
  // 2. check fuzzy match

  return scored
    .sort((a, b) => b.score - a.score)
    .map(r => r.result);
}
