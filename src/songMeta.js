const axios = require("axios");
const Fuse = require("fuse.js");
const { randomUUID } = require("crypto");
const { reserialize } = require("svcorelib");

/** @typedef {import("./types").SongMeta} SongMeta */

/**
 * Returns meta information about the top results of a search using the genius API
 * @param {Record<"q"|"artist"|"song", string|undefined>} search
 * @returns {Promise<{ top: SongMeta, all: SongMeta[] } | null>} Resolves null if no results are found
 */
async function getMeta({ q, artist, song })
{
    const accessToken = process.env.GENIUS_ACCESS_TOKEN ?? "ERR_NO_ENV";

    const query = q ? q : `${artist} ${song}`;

    const { data: { response }, status } = await axios.get(`https://api.genius.com/search?q=${encodeURIComponent(query)}`, {
        headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if(status >= 200 && status < 300 && Array.isArray(response?.hits))
    {
        if(response.hits.length === 0)
            return null;

        let hits = response.hits
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
            /** @type {Record<string, number>} */
            const scoreMap = {};

            hits = hits.map(h => {
                h.uuid = randomUUID();
                return h;
            });

            const fuseOpts = {
                ignoreLocation: true,
                includeScore: true,
                threshold: 0.5,
            };

            const titleFuse = new Fuse(hits, { ...fuseOpts, keys: [ "meta.title" ] });
            const artistFuse = new Fuse(hits, { ...fuseOpts, keys: [ "meta.primaryArtist.name" ] });

            /** @param {({ item: { uuid: string }, score: number })[]} searchRes */
            const addScores = (searchRes) => searchRes.forEach(({ item, score }) => {
                if(!scoreMap[item.uuid])
                    scoreMap[item.uuid] = score;
                else
                    scoreMap[item.uuid] += score;
            });

            addScores(titleFuse.search(song));
            addScores(artistFuse.search(artist));

            const bestMatches = Object.entries(scoreMap)
                .sort(([, valA], [, valB]) => valA > valB)
                .map(e => e[0]);

            const oldHits = reserialize(hits);

            hits = bestMatches
                .map(uuid => oldHits.find(h => h.uuid === uuid))
                .map(hit => {
                    delete hit.uuid;
                    return hit;
                });
        }

        return {
            top: hits[0],
            all: hits.slice(0, 10),
        };
    }

    return null;
}

/**
 * Removes invisible characters and control characters from a string
 * @param {string} str
 * @returns {string}
 */
function normalizeString(str)
{
    return str.replace(/[\u0000-\u001F\u007F-\u009F\u200B]/g, "").replace(/\u00A0/g, " ");
}

module.exports = { getMeta };
