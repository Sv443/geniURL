# geniURL

Simple JSON "REST proxy" to search for lyrics metadata on [genius](https://genius.com/).  
Obtaining actual lyrics sadly isn't possible.

<br><br>

## Base URL:

I host a public instance on this URL:

```
https://api.sv443.net/geniurl/
```

<br>

## Routes:

All routes support gzip and deflate compression.

<br>

> ### GET `/search`
>
> This endpoint gives you the top 10 results for a search query specified by `search_text`  
> The returned data contains various data like the lyrics website URL, song and thumbnail metadata and more (see below).
>
> <br>
>
> **Parameters:**  
> `?q=search%20query`  
> This parameter should contain both song and artist name(s) if possible (order doesn't matter, separate with a whitespace).  
> Sometimes the song name alone might be enough but the results may vary.  
> If the search query contains special characters, they need to be [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)
>
> <br>
> <details><summary><b>Successful response (click to view)</b></summary>
>
> ```json
> {
>     "error": false,
>     "top": {
>         "url": "https://genius.com/Artist-1-song-name-lyrics",
>         "path": "/Artist-1-song-name-lyrics",
>         "meta": {
>             "title": "Song Name",
>             "fullTitle": "Song Name by Artist 1 (ft. Artist 2)",
>             "artists": "Artist 1 (ft. Artist 2)",
>             "primaryArtist": {
>                 "name": "Artist 1",
>                 "url": "https://genius.com/artists/Artist-1"
>             }
>         },
>         "resources": {
>             "thumbnail": "https://images.genius.com/8485557225af0345d2c550af8bae731b.300x300x1.png",
>             "image": "https://images.genius.com/13d7b13ef827a9f007a5d24c115b9ebb.1000x1000x1.png"
>         },
>         "lyricsState": "complete",
>         "id": 42069
>     },
>     "all": [
>         "// This array contains 10 objects with the same structure as 'top', sorted best match first",
>         "// The first item of this array is exactly the same as 'top'"
>     ],
>     "timestamp": 1234567890123
> }
> ```
>
> </details>
> <br>
> <details><summary>Errored response (click to view)</summary>
>
> ```json
> {
>     "error": true,
>     "message": "Something went wrong",
>     "timestamp": 1234567890123
> }
> ```
>
> </details><br>

<br><br>

> ### GET `/search/top`
>
> This endpoint is the same as `/search`, but it only gives the top result.  
> Use this if you are only interested in the top result and want to reduce traffic.
>
> <br>
>
> **Parameters:**  
> `?q=search%20query`  
> This parameter should contain both song and artist name(s) if possible (order doesn't matter, separate with a whitespace).  
> Sometimes the song name alone might be enough but the results may vary.  
> If the search query contains special characters, they need to be [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)
>
> <br>
> <details><summary><b>Successful response (click to view)</b></summary>
>
> ```json
> {
>     "error": false,
>     "url": "https://genius.com/Artist-1-song-name-lyrics",
>     "path": "/Artist-1-song-name-lyrics",
>     "meta": {
>         "title": "Song Name",
>         "fullTitle": "Song Name by Artist 1 (ft. Artist 2)",
>         "artists": "Artist 1 (ft. Artist 2)",
>         "primaryArtist": {
>             "name": "Artist 1",
>             "url": "https://genius.com/artists/Artist-1"
>         }
>     },
>     "resources": {
>         "thumbnail": "https://images.genius.com/8485557225af0345d2c550af8bae731b.300x300x1.png",
>         "image": "https://images.genius.com/13d7b13ef827a9f007a5d24c115b9ebb.1000x1000x1.png"
>     },
>     "lyricsState": "complete",
>     "id": 42069,
>     "timestamp": 1234567890123
> }
> ```
>
> </details>
> <br>
> <details><summary>Errored response (click to view)</summary>
>
> ```json
> {
>     "error": true,
>     "message": "Something went wrong",
>     "timestamp": 1234567890123
> }
> ```
>
> </details><br>

<br>

## Rate Limiting

My public API instance is rate limited to 8 requests in 10 seconds.  
If you want to host your own instance and increase the values, look at the top of `src/server.js`

<br><br><br>

<div align="center" style="text-align:center;">

Made with low effort but still lots of ❤️ by [Sv443](https://sv443.net/)  
Licensed under the [MIT license](./LICENSE.txt#readme)

</div>
