---
lang: en-US
title: Lyrics Search
description: Description of all routes related to searching for lyrics metadata
---

## GET `/search`

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

```json
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

## GET `/search/top`

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

```json
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

</details>