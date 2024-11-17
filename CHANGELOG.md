### v2.0.0
**Features:**
- Added `?redirect` parameter for automatic HTTP redirection instead of returning a JSON response ([#22](https://github.com/Sv443/geniURL/issues/22))
**Changes:**
- Removed fuzzy filtering and `?disableFuzzy` parameter altogether (to maybe be added back in the future as an opt-in feature) ([#24](https://github.com/Sv443/geniURL/issues/24))
- Reduced ratelimit budget from 25 requests every 30 seconds to 20 requests

<br>

### v1.3.3
**Changes:**
- Removed `?preferLang` parameter due to genius API not returning a song language anymore ([#20](https://github.com/Sv443/geniURL/issues/20))
- Added temporary `?disableFuzzy` parameter to optionally disable fuzzy filtering since it's not as accurate as it should be

**Fixes:**
- Fixed errored response for /translations/:songId - it now sets matches to null and gives a different error message if the provided song ID is invalid ([#18](https://github.com/Sv443/geniURL/issues/18))

<br>

### v1.3.2
- Increased ratelimit budget from 5 requests in 15 seconds to 25 requests in 30 seconds

<br>

### v1.3.1
- Fixed inconsistent `error` property when no translations are found
- Added support for preflight through an OPTIONS request
- Improved ratelimit header consistency
- Removed timestamp property to allow for better caching
- Made documentation more clear

<br>

### v1.3.0
- Added route `/translations/:songId` to receive info about a song's translation pages
- Added route `/album/:songId` to get info about the album that the provided song is in
- Added parameter `?preferLang=en` to always rank results of a certain language higher than the rest
- geniURL will now replace inconsistent unicode characters in the properties `title`, `fullTitle`, and `artists` ([#15](https://github.com/Sv443/geniURL/issues/15))

<br>

### v1.2.0
- Added `?threshold` parameter to change the fuzzy search threshold from its default of 0.6 ([#7](https://github.com/Sv443/geniURL/issues/7))
- Added support for fuzzy searching when using `?q` instead of `?artist` and `?song` ([#8](https://github.com/Sv443/geniURL/issues/8))

<br>

### v1.1.1
- Minor fixes

<br>

### v1.1.0
- Migrated code to TypeScript
- Added new metadata:
    - release date
    - featured artists
    - images of artists
    - lyrics language

<br>

### v1.0.0
- Added `?artist` and `?song` parameters as an alternative to `?q` for getting better search results through fuzzy filtering ([#4](https://github.com/Sv443/geniURL/issues/4))
- Added `matches` property that's set to the number of results (`0` if none were found, or `null` on error)

<br>

### v0.2.0
- Added XML format
- API now filters out invisible characters ([#1](https://github.com/Sv443/geniURL/issues/1))
- Improvements to reliability

<br>

### v0.1.0
- Added endpoints
    - `/search` to search for the top result and the 10 best matches
    - `/search/top` to only search for the top result
- Added gzip and brotli encoding

<br>
