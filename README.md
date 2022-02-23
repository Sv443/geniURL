# geniURL
Simple "REST proxy" for searching for lyrics on genius.com


<br><br>


## Routes:

> ### GET `/search?q=<text>`
> This endpoint searches the genius API for the specified `<text>`  
> The text should contain both song and artist name(s) if possible, but the song name alone might sometimes be enough.  
> If there are special characters, they need to be [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)  
>   
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
