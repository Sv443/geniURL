import axios from "axios";
import Fuse from "fuse.js";
import { randomUUID } from "crypto";
import { JSONCompatible, reserialize } from "svcorelib";
import { ApiSearchResult, SongMeta } from "./types";

type SearchHit = (SongMeta & { uuid?: string; });

/**
 * Returns meta information about the top results of a search using the genius API
 * @param param0 Pass an object with either a `q` prop or the props `artist` and `song` to make use of fuzzy filtering
 */
export async function getMeta({ q, artist, song }: Partial<Record<"q" | "artist" | "song", string>>): Promise<{ top: SongMeta, all: SongMeta[] } | null>
{
    const accessToken = process.env.GENIUS_ACCESS_TOKEN ?? "ERR_NO_ENV";

    const query = q ? q : `${artist} ${song}`;

    const { data: { response }, status } = await axios.get<ApiSearchResult>(`https://api.genius.com/search?q=${encodeURIComponent(query)}`, {
        headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if(status >= 200 && status < 300 && Array.isArray(response?.hits))
    {
        if(response.hits.length === 0)
            return null;

        let hits: SearchHit[] = response.hits
            .filter(h => h.type === "song")
            .map(({ result }) => ({
                url: result.url,
                path: result.path,
                meta: {
                    title: normalizeString(result.title),
                    fullTitle: normalizeString(result.full_title),
                    artists: normalizeString(result.artist_names),
                    primaryArtist: {
                        name: normalizeString(result.primary_artist.name),
                        url: result.primary_artist.url,
                    },
                    release: result.release_date_components,
                },
                resources: {
                    thumbnail: result.song_art_image_thumbnail_url,
                    image: result.song_art_image_url,
                },
                lyricsState: result.lyrics_state,
                id: result.id,
            }));

        if(artist && song)
        {
            const scoreMap: Record<string, number> = {};

            hits = hits.map(h => {
                h.uuid = randomUUID();
                return h;
            }) as (SongMeta & { uuid: string })[];

            const fuseOpts = {
                ignoreLocation: true,
                includeScore: true,
                threshold: 0.5,
            };

            const titleFuse = new Fuse(hits, { ...fuseOpts, keys: [ "meta.title" ] });
            const artistFuse = new Fuse(hits, { ...fuseOpts, keys: [ "meta.primaryArtist.name" ] });

            /** @param {({ item: { uuid: string }, score: number })[]} searchRes */
            const addScores = (searchRes: Fuse.FuseResult<SongMeta & { uuid?: string; }>[]) =>
                searchRes.forEach(({ item, score }) => {
                    if(!item.uuid || !score)
                        return;

                    if(!scoreMap[item.uuid])
                        scoreMap[item.uuid] = score;
                    else
                        scoreMap[item.uuid] += score;
                });

            addScores(titleFuse.search(song));
            addScores(artistFuse.search(artist));

            const bestMatches = Object.entries(scoreMap)
                .sort(([, valA], [, valB]) => valA > valB ? 1 : -1) // TODO: check
                .map(e => e[0]);

            const oldHits = reserialize(hits as unknown as JSONCompatible) as unknown as SearchHit[];

            hits = bestMatches
                .map(uuid => oldHits.find(h => h.uuid === uuid))
                .map(hit => {
                    if(hit)
                    {
                        delete hit.uuid;
                        return hit;
                    }
                })
                .filter(h => h !== undefined) as SearchHit[];
        }

        return {
            top: hits[0] as SearchHit,
            all: hits.slice(0, 10),
        };
    }

    return null;
}

/**
 * Removes invisible characters and control characters from a string
 */
function normalizeString(str: string)
{
    return str.replace(/[\u0000-\u001F\u007F-\u009F\u200B]/g, "").replace(/\u00A0/g, " ");
}
