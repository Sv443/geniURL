import type { MetaSearchHit, ScoredResults, SearchFilterArgs } from "./types";

export function filterSearchResults(args: SearchFilterArgs, results: MetaSearchHit[]): MetaSearchHit[] {
  let scored: ScoredResults<MetaSearchHit>[] = [];

  // TODO:
  // 1. check direct match
  // 2. check fuzzy match

  return scored
    .sort((a, b) => b.score - a.score)
    .map(r => r.result);
}
