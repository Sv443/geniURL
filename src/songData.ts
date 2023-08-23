/* eslint-disable no-control-regex */

import Fuse from "fuse.js";
import { nanoid } from "nanoid";
import { clamp } from "svcorelib";

import { axios, baseAxiosOpts } from "./axios";
import { charReplacements } from "./constants";
import type { Album, ApiSearchResult, ApiSongResult, GetMetaArgs, GetMetaResult, MetaSearchHit, SongMeta, SongTranslation } from "./types";

const defaultFuzzyThreshold = 0.65;

/**
 * Returns meta information about the top results of a search using the genius API
 * @param param0 URL parameters - needs either a `q` prop or the props `artist` and `song`
 */
export async function getMeta({
  q,
  artist,
  song,
  threshold,
}: GetMetaArgs): Promise<GetMetaResult | null>
{
  const query = q ? q : `${artist} ${song}`;

  const {
    data: { response },
    status,
  } = await axios.get<ApiSearchResult>(
    `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
    baseAxiosOpts()
  );

  if(threshold === undefined || isNaN(threshold))
    threshold = defaultFuzzyThreshold;
  else
    threshold = clamp(threshold, 0.0, 1.0);

  if(status >= 200 && status < 300 && Array.isArray(response?.hits)) {
    if(response.hits.length === 0)
      return null;

    let hits: MetaSearchHit[] = response.hits
      .filter(h => h.type === "song")
      .map(({ result }) => ({
        url: result.url,
        path: result.path,
        meta: {
          title: normalize(result.title),
          fullTitle: normalize(result.full_title),
          artists: normalize(result.artist_names),
          primaryArtist: {
            name: result.primary_artist?.name ?? null,
            url: result.primary_artist?.url ?? null,
            headerImage: result.primary_artist?.header_image_url ?? null,
            image: result.primary_artist?.image_url ?? null,
          },
          featuredArtists: Array.isArray(result.featured_artists) && result.featured_artists.length > 0
            ? result.featured_artists.map((a) => ({
              name: a.name ?? null,
              url: a.url ?? null,
              headerImage: a.header_image_url ?? null,
              image: a.image_url ?? null,
            }))
            : [],
          releaseDate: result.release_date_components ?? null,
        },
        resources: {
          thumbnail: result.song_art_image_thumbnail_url ?? null,
          image: result.song_art_image_url ?? null,
        },
        lyricsState: result.lyrics_state ?? null,
        id: result.id ?? null,
      }));

    const scoreMap: Record<string, number> = {};

    hits = hits.map(h => {
      h.uuid = nanoid();
      return h;
    }) as (SongMeta & { uuid: string })[];

    const fuseOpts: Fuse.IFuseOptions<MetaSearchHit> = {
      includeScore: true,
      threshold,
    };

    // TODO:FIXME: this entire thing is unreliable af
    const addScores = (searchRes: Fuse.FuseResult<SongMeta & { uuid?: string; }>[]) =>
      searchRes.forEach(({ item, score }) => {
        if(!item.uuid || !score)
          return;

        if(!scoreMap[item.uuid])
          scoreMap[item.uuid] = score;
        else
          scoreMap[item.uuid] += score;
      });

    if(song && artist) {
      const titleFuse = new Fuse(hits, { ...fuseOpts, keys: [ "meta.title" ] });
      const artistFuse = new Fuse(hits, { ...fuseOpts, keys: [ "meta.primaryArtist.name" ] });

      addScores(titleFuse.search(song));
      addScores(artistFuse.search(artist));
    }
    else {
      const queryFuse = new Fuse(hits, {
        ...fuseOpts,
        ignoreLocation: true,
        keys: [ "meta.title", "meta.primaryArtist.name" ],
      });

      let queryParts = [query];
      if(query.match(/\s-\s/))
        queryParts = query.split(/\s-\s/);

      queryParts = queryParts.slice(0, 5);
      for(const part of queryParts)
        addScores(queryFuse.search(part.trim()));
    }

    // TODO: reduce the amount of remapping cause it takes long

    const bestMatches = Object.entries(scoreMap)
      .sort(([, valA], [, valB]) => valA > valB ? 1 : -1)
      .map(e => e[0]);

    const oldHits = [...hits];

    hits = bestMatches
      .map(uuid => oldHits.find(h => h.uuid === uuid))
      .map(hit => {
        if(!hit) return undefined;
        delete hit.uuid;
        return hit;
      })
      .filter(h => h !== undefined) as MetaSearchHit[];

    if(hits.length === 0)
      return null;

    return {
      top: hits[0]!,
      all: hits.slice(0, 10),
    };
  }

  return null;
}

/**
 * Returns translations for a song with the specified ID
 * @param songId Song ID gotten from the /search endpoints
 * @param param1 URL parameters
 * @returns An array of translation objects, null if the song doesn't have any or undefined if an error occurred (like the song doesn't exist)
 */
export async function getTranslations(songId: number): Promise<SongTranslation[] | null | undefined> {
  try {
    const { data, status } = await axios.get<ApiSongResult>(
      `https://api.genius.com/songs/${songId}`,
      baseAxiosOpts()
    );

    if(status >= 200 && status < 300 && Array.isArray(data?.response?.song?.translation_songs)) {
      if(data.response.song.translation_songs.length === 0)
        return null;

      const { response: { song } } = data;
      const results = song.translation_songs
        .map(({ language, id, path, title, url }) => ({ language, title, url, path, id }));

      return results;
    }
    return null;
  }
  catch(e) {
    return undefined;
  }
}

export async function getAlbum(songId: number): Promise<Album | null> {
  try {
    const { data, status } = await axios.get<ApiSongResult>(
      `https://api.genius.com/songs/${songId}`,
      baseAxiosOpts()
    );

    if(status >= 200 && status < 300 && data?.response?.song?.album?.id) {
      const { response: { song: { album } } } = data;

      return {
        name: album.name,
        fullTitle: album.full_title,
        url: album.url,
        coverArt: album.cover_art_url ?? null,
        id: album.id,
        artist: {
          name: album.artist.name ?? null,
          url: album.artist.url ?? null,
          image: album.artist.image_url ?? null,
          headerImage: album.artist.header_image_url ?? null,
        }
      };
    }
    return null;
  }
  catch(e) {
    return null;
  }
}

const allReplaceCharsRegex = new RegExp(`[${
  [...charReplacements.entries()].reduce((a, [chars]) => a + chars, "")
}]`);

const charReplacementRegexes = [...charReplacements.entries()]
  .map(([chars, repl]) => ([new RegExp(`[${chars}]`, "g"), repl])) as [RegExp, string][];

/** Removes invisible characters and control characters from a string and replaces weird unicode variants with the regular ASCII characters */
function normalize(str: string): string {
  if(str.match(allReplaceCharsRegex)) {
    charReplacementRegexes.forEach(([regex, val]) => {
      str = str.replace(regex, val);
    });
  }

  return str
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B]/g, "") // 0-width spaces & control characters
    .replace(/\u00A0/g, " "); // non-standard 1-width spaces
}
