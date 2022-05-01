const { default: axios } = require("axios");

/** @typedef {import("./types").SongMeta} SongMeta */

/**
 * Returns meta information about the top results of a search using the genius API
 * @param {string} search
 * @returns {Promise<{ top: SongMeta, all: SongMeta[] } | null>} Resolves null if no results are found
 */
async function getMeta(search)
{
    const accessToken = process.env.GENIUS_ACCESS_TOKEN ?? "ERR_NO_ENV";

    const { data: { response } } = await axios.get(`https://api.genius.com/search?q=${encodeURIComponent(search)}`, {
        headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if(Array.isArray(response?.hits))
    {
        if(response.hits.length === 0)
            return null;

        const hits = response.hits
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

        return {
            top: hits[0],
            all: hits.slice(0, 10),
        };
    }
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
