export function checkValProps(val: unknown, props: string[]) {
  for(const prop of props)
    expect(val).toHaveProperty(prop);
}

export function checkSongProps(songObj: unknown) {
  return checkValProps(songObj, [
    "url", 
    "path", 
    "lyricsState", 
    "id", 
    "meta.title", 
    "meta.fullTitle", 
    "meta.artists",
  ]);
}

export function checkAlbumProps(albumObj: unknown) {
  return checkValProps(albumObj, [
    "name",
    "fullTitle",
    "url",
    "coverArt",
    "id",
    "artist",
  ]);
}

export function checkArtistProps(artistObj: unknown) {
  return checkValProps(artistObj, [
    "name",
    "url",
    "image",
    "headerImage",
  ]);
}

export function checkTranslationProps(translationObj: unknown) {
  return checkValProps(translationObj, [
    "language",
    "id",
    "path",
    "title",
    "url",
  ]);
}
