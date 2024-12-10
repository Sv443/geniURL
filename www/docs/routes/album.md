---
lang: en-US
title: Related Album
description: Description of all routes related to searching for a related album
---

## GET `/album/:songId`

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

</details>
