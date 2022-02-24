# geniURL
Simple "REST proxy" for searching for lyrics on genius.com


<br><br>


## Routes:
All routes support gzip and deflate compression.  

<br>

> ### GET `/search?q=search_text`
> This endpoint gives you the top 10 results for a search query specified by `search_text`  
> The returned data contains various data like the lyrics website URL, song and thumbnail metadata and more (see below).  
>   
> The `search_text` should contain both song and artist name(s) if possible (order doesn't matter, separate with a whitespace)
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
>         /* 10 elements, same structure as "top", sorted best match first */
>     ],
>     "timestamp": 1234567890123
> }
> ```
> 
> </details>
> <br>
>   
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
> </details>
> <br>

<br><br>

> ### GET `/lyrics?q=search_text`
> Use this endpoint to get the lyrics of a specified song and additionally all properties from the top result of the `/search` endpoint.  
>   
> The `search_text` should contain both song and artist name(s) if possible (order doesn't matter, separate with a whitespace)
> Sometimes the song name alone might be enough but the results may vary.  
> If the search query contains special characters, they need to be [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)  
>   
> This feature is powered by [this awesome scraper.](https://github.com/farshed/genius-lyrics-api)
> 
> <br>
> <details><summary><b>Successful response (click to view)</b></summary>
> 
> ```json
> {
>     "error": false,
>     "lyrics": "[Verse 1]\nAyy ayy ayy\nYou know who it is ayy\n",
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
>   
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
> </details>
> <br>
