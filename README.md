# geniURL

Simple JSON and XML REST API to search for song metadata and the lyrics URL on [genius](https://genius.com/)  
Obtaining actual lyrics sadly isn't possible yet (suggestions are welcome lol)

<br><br>

## Base URL:

I host a public instance on this URL:

```
https://api.sv443.net/geniurl/
```

Note that this instance is rate limited to 5 requests in 10 seconds.  
<sub>If you want to host your own and increase the values, look at the top of `src/server.js`</sub>

<br><br>

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
> **URL Parameters:**  
> `?q=search%20query`  
> This parameter should contain both the song and artist name (for best result artist name should come first, separate with a whitespace).  
> Sometimes the song name alone might be enough but the results vary greatly.  
> Using this parameter instead of `?artist` and `?song` will not modify the search results and so you will rarely get blatantly wrong top matches.  
> Make sure the search query is [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)  
>   
> `?artist=name` and `?song=name`  
> Instead of `?q`, you can use `?artist` and `?song` to tell geniURL to preemptively filter the search results.  
> This is done using a fuzzy search to greatly increase the chances the correct search result will be at the top.  
> Make sure these parameters are [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)  
>   
> `?format=json/xml`  
> Use this parameter to change the response format from the default (`json`) to `xml`  
> The structure of the data closely resembles that of the shown JSON data.
>
> <br>
> <details><summary><b>Successful response (click to view)</b></summary>
>
> ```json
> {
>     "error": false,
>     "matches": 10,
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
>         "// This array contains up to 10 objects with the same structure as 'top', sorted best match first",
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
>     "matches": null,
>     "message": "Something went wrong",
>     "timestamp": 1234567890123
> }
> ```
>
> </details>
> <br>
> <details><summary>Response when no results found (click to view)</summary>
>
> ```json
> {
>     "error": false,
>     "matches": 0,
>     "message": "Found no results matching your search query",
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
> **URL Parameters:**  
> `?q=search%20query`  
> This parameter should contain both the song and artist name (for best result artist name should come first, separate with a whitespace).  
> Sometimes the song name alone might be enough but the results vary greatly.  
> Using this parameter instead of `?artist` and `?song` will not modify the search result and so you will rarely get a blatantly wrong top match.  
> Make sure the search query is [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)  
>   
> `?artist=name` and `?song=name`  
> Instead of `?q`, you can use `?artist` and `?song` to tell geniURL to preemptively filter the search results.  
> This is done using a fuzzy search to greatly increase the chances the correct search result will be returned.  
> Make sure these parameters are [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)  
>   
> `?format=json/xml`  
> Use this parameter to change the response format from the default (`json`) to `xml`  
> The structure of the data closely resembles that of the shown JSON data.
>
> <br>
> <details><summary><b>Successful response (click to view)</b></summary>
>
> ```json
> {
>     "error": false,
>     "matches": 1,
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
>         "thumbnail": "https://images.genius.com/123456789abcdef.300x300x1.png",
>         "image": "https://images.genius.com/123456789abcdef.1000x1000x1.png"
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
>     "matches": null,
>     "message": "Something went wrong",
>     "timestamp": 1234567890123
> }
> ```
>
> </details>
> <br>
> <details><summary>Response when no result found (click to view)</summary>
>
> ```json
> {
>     "error": false,
>     "matches": 0,
>     "message": "Found no results matching your search query",
>     "timestamp": 1234567890123
> }
> ```
>
> </details><br>

<br><br>

<div align="center" style="text-align:center;">

Made with ❤️ by [Sv443](https://sv443.net/)  
If you like geniURL, please consider [supporting the development](https://github.com/sponsors/Sv443)

</div>
