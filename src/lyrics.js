const { default: axios } = require("axios");
const { getLyrics: apiGetLyrics } = require("genius-lyrics-api");
const error = require("./error");

const accessToken = process.env.GENIUS_ACCESS_TOKEN || "ERR_NO_ENV";

async function getMeta(search)
{
    const { data: { response } } = await axios.get(`https://api.genius.com/search?q=${encodeURIComponent(search)}`, {
        headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if(Array.isArray(response?.hits))
    {
        const hits = response.hits
            .filter(h => h.type === "song")
            .map(({ result }) => ({
                url: result.url,
                path: result.path,
                meta: {
                    title: result.title,
                    fullTitle: result.full_title,
                    artists: result.artist_names,
                    primaryArtist: {
                        name: result.primary_artist.name,
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
 * @param {string} title
 * @param {string} artist
 * @returns {Promise<string | null>}
 */
async function getLyrics(title, artist)
{
    try
    {
        return await apiGetLyrics({
            apiKey: accessToken,
            title,
            artist,
            optimizeQuery: true,
        });
    }
    catch(err)
    {
        error("Error while getting lyrics", err);
    }
}

module.exports = { getMeta, getLyrics };
