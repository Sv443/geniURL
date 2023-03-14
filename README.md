# geniURL
Simple JSON and XML REST API to search for song metadata, the lyrics URL and lyrics translations on [genius.com](https://genius.com/)  
Authorization is not required and geniURL implements a fuzzy search that will greatly improve search results over the genius.com API.  
Obtaining actual lyrics sadly isn't possible.  
  
Like geniURL? Please consider [supporting the development ❤️](https://github.com/sponsors/Sv443)

<br><br>

## Try it out:
For trying out geniURL yourself, you can use [this Postman workspace.](https://www.postman.com/sv443/workspace/geniurl)  
To download it and test locally, hover over the collection, click the three-dot-menu and then "Export"

<br><br>

## Base URL:
I host a public instance on this URL:
```
https://api.sv443.net/geniurl/
```

<sub>
Note that this instance is rate limited to 10 requests within 30 seconds per unique client.
</sub>

<br><br>

## Routes:
All routes support gzip and deflate compression.

- [Search](#get-search)
    - [Search (only top result)](#get-searchtop)
- [Translations](#get-translationssongid)
- [Associated Album](#get-albumsongid)

<br>

> ### GET `/search`
>
> This endpoint gives you up to 10 results for a search query specified by `search_text`  
> The returned payload contains various data like the lyrics website URL, song and thumbnail metadata and more (see below).
>
> <br>
>
> **URL Parameters:**  
> `?q=search%20query`  
> This parameter should contain both the song and artist name. For best result artist name should come first, separate with a whitespace or hyphen.  
> Sometimes the song name alone might be enough but the results vary greatly.  
> If you want to search for a remix (like `?q=Artist - Song (Artist2 Remix)`), this parameter will yield better results.  
> Make sure the search query is [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)  
> 
> **OR**
> 
> `?artist=name` and `?song=name`  
> Instead of `?q`, you can also use `?artist` and `?song`.  
> Make sure these parameters are [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)
> 
> <br>
> 
> **Optional URL Parameters:**  
> `?preferLang=en`  
> Sometimes the genius API and geniURL's filtering will rank song translations or remixes higher than the original song. This optional parameter can help with that.  
> Specify a [two-character ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) here to tell geniURL to prefer results of that language.  
> Note that this only changes the ranking. Filtering will stay the same and results of other languages will still be returned.
>   
> `?format=json/xml`  
> Use this optional parameter to change the response format from the default (`json`) to `xml`  
> The structure of the XML data is similar to the shown JSON data.
>   
> `?threshold=0.65`  
> This optional parameter can be used to change the fuzzy search threshold from the default of 0.65  
> It has to be between 0.0 and 1.0; the lower the number, the less results you'll get but the more accurate the top results will be.  
> 0.65 is a good middle ground but depending on your use-case you might want to play around with this.
>
> <br>
> 
> **Response:**  
> 
> <details><summary><b>Successful response (click to view)</b></summary>
>
> ```jsonc
> {
>     "error": false,
>     "matches": 10,
>     "top": {
>         "url": "https://genius.com/Artist-Foo-song-name-lyrics",
>         "path": "/Artist-Foo-song-name-lyrics",
>         "language": "en",
>         "meta": {
>             "title": "Song Name",
>             "fullTitle": "Song Name by Artist Foo (ft. Artist Bar)",
>             "artists": "Artist Foo (ft. Artist Bar)",
>             "primaryArtist": {
>                 "name": "Artist Foo",
>                 "url": "https://genius.com/artists/Artist-Foo",
>                 "headerImage": "https://images.genius.com/...",
>                 "image": "https://images.genius.com/..."
>             },
>             "featuredArtists": [
>                 {
>                     "name": "Artist Bar",
>                     "url": "https://genius.com/artists/Artist-Bar",
>                     "headerImage": "https://images.genius.com/...",
>                     "image": "https://images.genius.com/..."
>                 }
>             ],
>             "releaseDate": {
>                 "year": 2018,
>                 "month": 9,
>                 "day": 12
>             }
>         },
>         "resources": {
>             "thumbnail": "https://images.genius.com/...",
>             "image": "https://images.genius.com/..."
>         },
>         "lyricsState": "complete",
>         "id": 42069
>     },
>     "all": [
>         // This array contains up to 10 objects with the same structure as 'top', sorted best match first
>         // The amount of objects in here is the same as the 'matches' property
>         // The first object of this array is exactly the same as 'top'
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
>     "error": true,
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
> This endpoint is similar to `/search`, but it only gives the top result.  
> Use this if you are only interested in the top result and want to reduce traffic.
>
> <br>
>
> **URL Parameters:**  
> `?q=search%20query`  
> This parameter should contain both the song and artist name. For best result artist name should come first, separate with a whitespace or hyphen.  
> Sometimes the song name alone might be enough but the results vary greatly.  
> If you want to search for a remix (like `?q=Artist - Song (Artist2 Remix)`), this parameter will yield better results.  
> Make sure the search query is [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)  
> 
> **OR**
> 
> `?artist=name` and `?song=name`  
> Instead of `?q`, you can also use `?artist` and `?song`.  
> Make sure these parameters are [percent/URL-encoded.](https://en.wikipedia.org/wiki/Percent-encoding)
> 
> <br><br>
> 
> **Optional URL Parameters:**  
> `?preferLang=en`  
> Sometimes the genius API and geniURL's filtering will rank song translations or remixes higher than the original song. This optional parameter can help with that.  
> Specify a [two-character ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) here to tell geniURL to prefer results of that language.  
> Note that this only changes the ranking. Filtering will stay the same and results of other languages will still be returned.
>   
> `?format=json/xml`  
> Use this optional parameter to change the response format from the default (`json`) to `xml`  
> The structure of the XML data is similar to the shown JSON data.
>   
> `?threshold=0.65`  
> This optional parameter can be used to change the fuzzy search threshold from the default of 0.65  
> It has to be between 0.0 and 1.0; the lower the number, the less results you'll get but the more accurate the top results will be.  
> 0.65 is a good middle ground but depending on your use-case you might want to play around with this.
>
> <br>
> 
> **Response:**  
> 
> <details><summary><b>Successful response (click to view)</b></summary>
>
> ```jsonc
> {
>     "error": false,
>     "matches": 1,
>     "url": "https://genius.com/Artist-Foo-song-name-lyrics",
>     "path": "/Artist-Foo-song-name-lyrics",
>     "language": "en",
>     "meta": {
>         "title": "Song Name",
>         "fullTitle": "Song Name by Artist Foo (ft. Artist Bar)",
>         "artists": "Artist Foo (ft. Artist Bar)",
>         "primaryArtist": {
>             "name": "Artist Foo",
>             "url": "https://genius.com/artists/Artist-Foo",
>             "headerImage": "https://images.genius.com/...",
>             "image": "https://images.genius.com/..."
>         },
>         "featuredArtists": [
>             {
>                 "name": "Artist Bar",
>                 "url": "https://genius.com/artists/Artist-Bar",
>                 "headerImage": "https://images.genius.com/...",
>                 "image": "https://images.genius.com/..."
>             }
>         ],
>         "releaseDate": {
>             "year": 2018,
>             "month": 9,
>             "day": 12
>         }
>     },
>     "resources": {
>         "thumbnail": "https://images.genius.com/...",
>         "image": "https://images.genius.com/..."
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
>     "error": true,
>     "matches": 0,
>     "message": "Found no results matching your search query",
>     "timestamp": 1234567890123
> }
> ```
>
> </details><br>

<br><br>

> ### GET `/translations/:songId`
>
> This endpoint returns all translations of a certain song.  
> Specify the song ID, gotten from the /search/ endpoints, in the URL path.  
> Example: `/translations/3093344`
> 
> <br>
>
> **Optional URL Parameters:**  
> `?preferLang=en`  
> The filtering done by the genius API and geniURL will sometimes produce results that are ranked inconsistently. This optional parameter can help with that.  
> Specify a [two-character ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) here to tell geniURL to prefer results of that language.  
> Note that this only changes the ranking. Filtering will stay the same and results of other languages will still be returned.
>   
> `?format=json/xml`  
> Use this optional parameter to change the response format from the default (`json`) to `xml`  
> The structure of the XML data is similar to the shown JSON data.
> 
> <br>
> 
> **Response:**  
> 
> <details><summary><b>Successful response (click to view)</b></summary>
>
> ```jsonc
> {
>     "error": false,
>     "matches": 1,
>     "translations": [
>         {
>             "language": "es",
>             "title": "Artist - Song (Traducción al Español)",
>             "url": "https://genius.com/Genius-traducciones-al-espanol-artist-song-al-espanol-lyrics",
>             "path": "/Genius-traducciones-al-espanol-artist-song-al-espanol-lyrics",
>             "id": 6942
>         }
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
> <details><summary>Response when no result found (click to view)</summary>
>
> ```json
> {
>     "error": false,
>     "matches": 0,
>     "translations": [],
>     "timestamp": 1234567890123
> }
> ```
>
> </details><br>

<br><br>

> ### GET `/album/:songId`
>
> This endpoint returns any associated album for a specified song.  
> Example: `/translations/3093344`
> 
> <br>
>
> **Optional URL Parameters:**  
> `?format=json/xml`  
> Use this optional parameter to change the response format from the default (`json`) to `xml`  
> The structure of the XML data is similar to the shown JSON data.
> 
> <br>
> 
> **Response:**  
> 
> <details><summary><b>Successful response (click to view)</b></summary>
>
> ```jsonc
> {
>     "error": false,
>     "matches": 1,
>     "album": {
>         "name": "Album",
>         "fullTitle": "Song by Artist",
>         "url": "https://genius.com/albums/Artist/Album",
>         "coverArt": "https://images.genius.com/...",
>         "id": 12345,
>         "artist": {
>             "name": "Artist",
>             "url": "https://genius.com/artists/Artist",
>             "image": "https://images.genius.com/...",
>             "headerImage": "https://images.genius.com/..."
>         }
>     },
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
>     "error": true,
>     "matches": 0,
>     "message": "Couldn't find any associated album for this song",
>     "timestamp": 1234567890123
> }
> ```
>
> </details><br>

<br><br><br>

<div align="center" style="text-align:center;">

Made with ❤️ by [Sv443](https://sv443.net/)  
If you like geniURL, please consider [supporting the development](https://github.com/sponsors/Sv443)

</div>
