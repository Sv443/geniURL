/* eslint-disable no-control-regex */

import { axios } from "./axios";
import Fuse from "fuse.js";
import { nanoid } from "nanoid";
import { clamp, Stringifiable } from "svcorelib";
import type { Album, ApiSearchResult, ApiSongResult, GetMetaArgs, GetMetaResult, GetTranslationsArgs, MetaSearchHit, SongMeta, SongTranslation } from "./types";
import { getAxiosAuthConfig } from "./utils";

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
    preferLang,
}: GetMetaArgs): Promise<GetMetaResult | null>
{
    const query = q ? q : `${artist} ${song}`;

    const {
        data: { response },
        status,
    } = await axios.get<ApiSearchResult>(
        `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
        getAxiosAuthConfig(process.env.GENIUS_ACCESS_TOKEN)
    );

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

        if(hits.length === 0)
            return null;

        // splice out preferredLang results and move them to the beginning of the array, while keeping their original order:
        const preferredBestMatches: MetaSearchHit[] = [];

        if(preferLang) {
            hits.forEach((hit, i) => {
                if(hit.language === preferLang.toLowerCase())
                    preferredBestMatches.push(hits.splice(i, 1)[0]!);
            });
        }

        const reorderedHits = preferredBestMatches.concat(hits);

        return {
            top: reorderedHits[0]!,
            all: reorderedHits.slice(0, 10),
        };
    }

    return null;
}

/**
 * Returns translations for a song with the specified ID
 * @param songId Song ID gotten from the /search endpoints
 * @param param1 URL parameters
 */
export async function getTranslations(songId: number, { preferLang }: GetTranslationsArgs): Promise<SongTranslation[] | null> {
    try {
        const { data, status } = await axios.get<ApiSongResult>(
            `https://api.genius.com/songs/${songId}`,
            getAxiosAuthConfig(process.env.GENIUS_ACCESS_TOKEN)
        );

        if(status >= 200 && status < 300 && Array.isArray(data?.response?.song?.translation_songs))
        {
            const { response: { song } } = data;
            const results = song.translation_songs
                .map(({ language, id, path, title, url }) => ({ language, title, url, path, id }));

            // splice out preferredLang results and move them to the beginning of the array, while keeping their original order:
            const preferredResults: SongTranslation[] = [];

            if(preferLang) {
                results.forEach((res, i) => {
                    if(res.language === preferLang.toLowerCase())
                        preferredResults.push(results.splice(i, 1)[0]!);
                });
            }

            return preferredResults.concat(results);
        }
        return null;
    }
    catch(e) {
        return null;
    }
}

export async function getAlbum(songId: number): Promise<Album | null> {
    try {
        const { data, status } = await axios.get<ApiSongResult>(
            `https://api.genius.com/songs/${songId}`,
            getAxiosAuthConfig(process.env.GENIUS_ACCESS_TOKEN)
        );

        if(status >= 200 && status < 300 && data?.response?.song?.album?.id)
        {
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

/**
 * Removes invisible characters and control characters from a string  
 * @throws Throws TypeError if the input is not a string
 */
function formatStr(str: Stringifiable): string
{
    if(!str || !str.toString || typeof str !== "string")
        throw new TypeError("formatStr(): input is not a string");

    return str.toString()
        .replace(/[\u0000-\u001F\u007F-\u009F\u200B]/g, "") // 0-width spaces & control characters
        .replace(/\u00A0/g, " "); // non-standard 1-width spaces
}
