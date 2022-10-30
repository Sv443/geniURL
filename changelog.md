## Version History:
- [1.1.0](#v110)
- [1.0.0](#v100)
- [0.2.0](#v020)
- [0.1.0](#v010)

<br><br>

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
