---
lang: en-US
title: Lyrics Translations
description: Description of all routes related to searching for lyrics translations
---

## GET `/translations/:songId`

This route returns all translations of a certain song.  
Get the song ID from one of the [search routes.](./search)  
Example: `/translations/1644`

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

</details>
