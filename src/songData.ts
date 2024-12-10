import { axios, baseAxiosOpts } from "@src/axios.js";
import { charReplacements } from "@src/constants.js";
import type { Album, ApiSearchResult, ApiSongResult, GetMetaArgs, GetMetaResult, MetaSearchHit, SongTranslation } from "@src/types.js";

/**
 * Returns meta information about the top results of a search using the genius API
 * @param param0 URL parameters - needs either a `q` prop or the props `artist` and `song`
 */
export async function getMeta({
  q,
  artist,
  song,
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

  if(status >= 200 && status < 300 && Array.isArray(response?.hits)) {
    if(response.hits.length === 0)
      return null;

    const hits: MetaSearchHit[] = response.hits
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
  catch {
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
  catch {
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

  return str // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B]/g, "") // 0-width spaces & control characters
    .replace(/\u00A0/g, " "); // non-standard 1-width spaces
}
