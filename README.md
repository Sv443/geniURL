# geniURL
Simple JSON and XML REST API to search for song metadata, the lyrics URL and lyrics translations on [genius.com](https://genius.com/)  
Authorization is not required. Obtaining actual lyrics sadly isn't possible.  
  
Disclaimer: this project is not affiliated with or endorsed by Genius.  
  
> [!NOTE]  
> Like using geniURL for free?  
> It's entirely reliant on donations so please consider [supporting the development ❤️](https://github.com/sponsors/Sv443)  

<br>

## Table of contents:
- [Try it out](#try-it-out)
- [Base URL](#base-url)
- [Routes](#routes)
    - [Search](#get-search)
        - [Search (only top result)](#get-searchtop)
    - [Translations](#get-translationssongid)
    - [Associated Album](#get-albumsongid)
- [Local setup](#local-setup)
- [Legal stuff](#legal-stuff)

<br><br>

## Try it out:
For trying out geniURL yourself, you can use [this Postman workspace.](https://www.postman.com/sv443/workspace/geniurl)  
To download it and test locally, hover over the collection, click the three-dot-menu and then "Export"

<br><br>

## Base URL:
I host a public instance on this base URL:
```
https://api.sv443.net/geniurl/v2/
```

Note: this instance is rate limited to 20 requests within a 30 second timeframe.  
To always know how many requests you are able to send, refer to the response headers `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset`


<br><br>

## Routes:
All routes support gzip, deflate and brotli compression.  
  
Also all routes always return the properties `error` and `matches`.  
They can be used to determine whether a response has succeeded (error = false, matches > 0), is errored (error = true, matches = null) or just didn't yield any results (error = true, matches = 0).  
  
These are the available routes:
- [Search](#get-search)
    - [Search (only top result)](#get-searchtop)
- [Translations](#get-translationssongid)
- [Associated Album](#get-albumsongid)

<br><br>

### GET `/search`

This route gives you up to 10 results for a provided search query.  
The returned payload contains various data like the lyrics website URL, song and thumbnail metadata and more (see below).

<br>

**URL Parameters:**  
`?q=search%20query`  
This parameter should contain both the song and artist name. For best result artist name should come first, separate with a whitespace or hyphen.  
Sometimes the song name alone might be enough but the results vary greatly.  
If you want to search for a remix (like `?q=Artist - Song (Artist2 Remix)`), this parameter will yield better results.  
Make sure the search query is [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)  

**OR**

`?artist=name` and `?song=name`  
Instead of `?q`, you can also use `?artist` and `?song`.  
Make sure these parameters are [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)

<br>

**Optional URL Parameters:**  
`?format=json/xml`  
Use this optional parameter to change the response format from the default (`json`) to `xml`  
The structure of the XML data is similar to the shown JSON data.

<br>

**Response:**  

<details><summary><b>Successful response (click to view)</b></summary>

```jsonc
{
    "error": false,
    "matches": 10,
    "top": {
        "url": "https://genius.com/Artist-Foo-song-name-lyrics",
        "path": "/Artist-Foo-song-name-lyrics",
        "language": "en",
        "meta": {
            "title": "Song Name",
            "fullTitle": "Song Name by Artist Foo (ft. Artist Bar)",
            "artists": "Artist Foo (ft. Artist Bar)",
            "primaryArtist": {
                "name": "Artist Foo",
                "url": "https://genius.com/artists/Artist-Foo",
                "headerImage": "https://images.genius.com/...",
                "image": "https://images.genius.com/..."
            },
            "featuredArtists": [
                {
                    "name": "Artist Bar",
                    "url": "https://genius.com/artists/Artist-Bar",
                    "headerImage": "https://images.genius.com/...",
                    "image": "https://images.genius.com/..."
                }
            ],
            "releaseDate": {
                "year": 2018,
                "month": 9,
                "day": 12
            }
        },
        "resources": {
            "thumbnail": "https://images.genius.com/...",
            "image": "https://images.genius.com/..."
        },
        "lyricsState": "complete",
        "id": 42069
    },
    "all": [
        // This array contains up to 10 objects with the same structure as 'top', sorted best match first
        // The amount of objects in here is the same as the 'matches' property
        // The first object of this array is exactly the same as 'top'
    ]
}
```

</details>
<br>
<details><summary>Errored response (click to view)</summary>

```json
{
    "error": true,
    "matches": null,
    "message": "Something went wrong"
}
```

</details>
<br>
<details><summary>Response when no results found (click to view)</summary>

```json
{
    "error": true,
    "matches": 0,
    "message": "Found no results matching your search query"
}
```

</details><br>

<br><br><br>

### GET `/search/top`

This route is similar to `/search`, but it only gives the top result.  
Use this if you are only interested in the top result and want to reduce traffic.

<br>

**URL Parameters:**  
`?q=search%20query`  
This parameter should contain both the song and artist name. For best result artist name should come first, separate with a whitespace or hyphen.  
Sometimes the song name alone might be enough but the results vary greatly.  
If you want to search for a remix (like `?q=Artist - Song (Artist2 Remix)`), this parameter will yield better results.  
Make sure the search query is [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)  

**OR**

`?artist=name` and `?song=name`  
Instead of `?q`, you can also use `?artist` and `?song`.  
Make sure these parameters are [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)

<br><br>

**Optional URL Parameters:**  
`?format=json/xml`  
Use this optional parameter to change the response format from the default (`json`) to `xml`  
The structure of the XML data is similar to the shown JSON data.

<br>

**Response:**  

<details><summary><b>Successful response (click to view)</b></summary>

```jsonc
{
    "error": false,
    "matches": 1,
    "url": "https://genius.com/Artist-Foo-song-name-lyrics",
    "path": "/Artist-Foo-song-name-lyrics",
    "language": "en",
    "meta": {
        "title": "Song Name",
        "fullTitle": "Song Name by Artist Foo (ft. Artist Bar)",
        "artists": "Artist Foo (ft. Artist Bar)",
        "primaryArtist": {
            "name": "Artist Foo",
            "url": "https://genius.com/artists/Artist-Foo",
            "headerImage": "https://images.genius.com/...",
            "image": "https://images.genius.com/..."
        },
        "featuredArtists": [
            {
                "name": "Artist Bar",
                "url": "https://genius.com/artists/Artist-Bar",
                "headerImage": "https://images.genius.com/...",
                "image": "https://images.genius.com/..."
            }
        ],
        "releaseDate": {
            "year": 2018,
            "month": 9,
            "day": 12
        }
    },
    "resources": {
        "thumbnail": "https://images.genius.com/...",
        "image": "https://images.genius.com/..."
    },
    "lyricsState": "complete",
    "id": 42069
}
```

</details>
<br>
<details><summary>Errored response (click to view)</summary>

```json
{
    "error": true,
    "matches": null,
    "message": "Something went wrong"
}
```

</details>
<br>
<details><summary>Response when no result found (click to view)</summary>

```json
{
    "error": true,
    "matches": 0,
    "message": "Found no results matching your search query"
}
```

</details><br>

<br><br><br>

### GET `/translations/:songId`

This route returns all translations of a certain song.  
Get the song ID from one of the [search routes.](#routes)  
Example: `/translations/1644`

<br>

**Optional URL Parameters:**  
`?format=json/xml`  
Use this optional parameter to change the response format from the default (`json`) to `xml`  
The structure of the XML data is similar to the shown JSON data.

<br>

**Response:**  

<details><summary><b>Successful response (click to view)</b></summary>

```jsonc
{
    "error": false,
    "matches": 1,
    "translations": [
        {
            "language": "es",
            "title": "Artist - Song (Traducción al Español)",
            "url": "https://genius.com/Genius-traducciones-al-espanol-artist-song-al-espanol-lyrics",
            "path": "/Genius-traducciones-al-espanol-artist-song-al-espanol-lyrics",
            "id": 6942
        }
    ]
}
```

</details>
<br>
<details><summary>Errored response (click to view)</summary>

```json
{
    "error": true,
    "matches": null,
    "message": "Something went wrong"
}
```

</details>
<br>
<details><summary>Response when no result found (click to view)</summary>

```json
{
    "error": true,
    "matches": 0,
    "translations": []
}
```

</details><br>

<br><br><br>

### GET `/album/:songId`

This route returns any associated album for a specified song.  
Get the song ID from one of the [search routes.](#routes)  
Example: `/album/1644`

<br>

**Optional URL Parameters:**  
`?format=json/xml`  
Use this optional parameter to change the response format from the default (`json`) to `xml`  
The structure of the XML data is similar to the shown JSON data.

<br>

**Response:**  

<details><summary><b>Successful response (click to view)</b></summary>

```jsonc
{
    "error": false,
    "matches": 1,
    "album": {
        "name": "Album",
        "fullTitle": "Song by Artist",
        "url": "https://genius.com/albums/Artist/Album",
        "coverArt": "https://images.genius.com/...",
        "id": 12345,
        "artist": {
            "name": "Artist",
            "url": "https://genius.com/artists/Artist",
            "image": "https://images.genius.com/...",
            "headerImage": "https://images.genius.com/..."
        }
    }
}
```

</details>
<br>
<details><summary>Errored response (click to view)</summary>

```json
{
    "error": true,
    "matches": null,
    "message": "Something went wrong"
}
```

</details>
<br>
<details><summary>Response when no result found (click to view)</summary>

```json
{
    "error": true,
    "matches": 0,
    "message": "Couldn't find any associated album for this song"
}
```

</details><br>

<br><br>

## Local setup:
To set up geniURL locally, follow these steps:
1. [Install Node.js](https://nodejs.org/en/download) (current or LTS) and make sure npm is installed by running `npm -v`
2. [Install pnpm](https://pnpm.io/installation) (can be done by running `npm i -g pnpm`)
3. Clone or download and extract this repository
4. Run `pnpm i` in the project directory to install dependencies
5. Copy `.env.template` to `.env` and fill in the required values  
  The genius.com API key can be obtained by [creating an API client here](https://genius.com/api-clients)
6. Run `pnpm start` to start the server  
  Alternatively, run `pnpm run dev` to start the server and automatically recompile and restart when the code is changed

I recommend using a process manager like [PM2](https://pm2.keymetrics.io/) to keep the server running in the background, make it automatically restart on crashes and start on system boot.

<br><br>

## Legal stuff:
This project is licensed under the [MIT License](./LICENSE.txt)  
  
The genius.com API is used to get the search results and song metadata. No actual lyrics are obtained.  
This project is not affiliated with, sponsored or endorsed by genius.com.

<br><br><br>

<div align="center" style="text-align:center;">

Made with ❤️ by [Sv443](https://sv443.net/)  
If you like geniURL, please consider [supporting the development ❤️](https://github.com/sponsors/Sv443)

</div>
