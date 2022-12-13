import axios from "axios";
import Fuse from "fuse.js";
import { nanoid } from "nanoid";
import { allOfType, clamp } from "svcorelib";
import type { ApiSearchResult, SongMeta } from "./types";

type MetaSearchHit = SongMeta & { uuid?: string; };

interface GetMetaProps {
    q?: string;
    artist?: string;
    song?: string;
    threshold?: number;
}

interface GetMetaResult {
    top: SongMeta;
    all: SongMeta[];
}

const defaultFuzzyThreshold = 0.65;

/**
 * Returns meta information about the top results of a search using the genius API
 * @param param0 Pass an object with either a `q` prop or the props `artist` and `song` to make use of fuzzy filtering
 */
export async function getMeta({
    q,
    artist,
    song,
    threshold,
}: GetMetaProps): Promise<GetMetaResult | null>
{
    const accessToken = process.env.GENIUS_ACCESS_TOKEN ?? "ERR_NO_ENV";

    const query = q ? q : `${artist} ${song}`;
    const searchByQuery = allOfType([artist, song], "undefined");

    const { data: { response }, status } = await axios.get<ApiSearchResult>(`https://api.genius.com/search?q=${encodeURIComponent(query)}`, {
        headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if(threshold === undefined || isNaN(threshold))
        threshold = defaultFuzzyThreshold;
    threshold = clamp(threshold, 0.0, 1.0);

    if(status >= 200 && status < 300 && Array.isArray(response?.hits))
    {
        if(response.hits.length === 0)
            return null;

        let hits: MetaSearchHit[] = response.hits
            .filter(h => h.type === "song")
            .map(({ result }) => ({
                url: result.url,
                path: result.path,
                language: result.language ?? null,
                meta: {
                    title: formatStr(result.title),
                    fullTitle: formatStr(result.full_title),
                    artists: formatStr(result.artist_names),
                    primaryArtist: {
                        name: result.primary_artist.name ? formatStr(result.primary_artist.name) : null,
                        url: result.primary_artist.url ?? null,
                        headerImage: result.primary_artist.header_image_url ?? null,
                        image: result.primary_artist.image_url ?? null,
                    },
                    featuredArtists: Array.isArray(result.featured_artists) && result.featured_artists.length > 0
                        ? result.featured_artists.map((a) => ({
                            name: a.name ? formatStr(a.name) : null,
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

        return {
            top: hits[0] as MetaSearchHit,
            all: hits.slice(0, 10),
        };
    }

    return null;
}

/**
 * Removes invisible characters and control characters from a string  
 * @throws Throws TypeError if the input is not a string
 */
function formatStr(str: unknown): string
{
    if(!str || typeof str !== "string")
        throw new TypeError("formatStr(): input is not a string");

    return str
        .replace(/[\u0000-\u001F\u007F-\u009F\u200B]/g, "") // 0-width spaces & control characters
        .replace(/\u00A0/g, " "); // non-standard 1-width spaces
}
