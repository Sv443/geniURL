//#region server

/** Successful or errored response object */
export type ServerResponse<T> = SuccessResponse<T> | ErrorResponse;

/** Successful response object */
export type SuccessResponse<T> = {
  error: false;
  matches: number;
} & T;

/** Errored response object */
export type ErrorResponse = {
  error: true;
  matches: 0 | null;
  message: string;
}

//#region meta

/** genius.com artist object */
interface Artist {
  name: string | null;
  url: string | null;
  image: string | null;
  headerImage: string | null;
}

/** genius.com song meta object */
export interface SongMeta {
  url: string;
  path: string;
  meta: {
    title: string;
    fullTitle: string;
    artists: string;
    releaseDate: {
      year: number | null;
      month: number | null;
      day: number | null;
    };
    primaryArtist: Artist | null;
    featuredArtists: Artist[];
  };
  resources: {
    thumbnail: string | null;
    image: string | null;
  };
  lyricsState: string;
  id: number;
}

export type MetaSearchHit = SongMeta & { uuid?: string; };

/** Arguments passed to the getMeta() function */
export interface GetMetaArgs {
  q?: string;
  artist?: string;
  song?: string;
  limit?: number;
}

export type SearchFilterArgs = GetMetaArgs;

export type ScoredResults<T> = {
  score: number;
  result: T;
};

/** Resulting object from calling getMeta() */
export interface GetMetaResult {
  top: SongMeta;
  all: SongMeta[];
}

//#region translations

/** genius.com translation object */
export interface SongTranslation {
  language: string;
  id: number;
  path: string;
  title: string;
  url: string;
}

//#region server

/** geniURL response type */
export type ResponseType = "serverError" | "clientError" | "success";

/** geniURL response file format */
export type ResponseFormat = "json" | "xml";

//#region API

/** The entire object returned by the search endpoint of the genius API */
export type ApiSearchResult = {
  response: {
    hits: SearchHit[];
  };
};

/** The entire object returned by the songs endpoint of the genius API */
export type ApiSongResult = {
  response: {
    song: SongObj;
  }
}

/** One result returned by the genius API search */
export type SearchHit = {
  type: "song";
  result: SongBaseObj & {
    release_date_components: {
      year: number;
      month: number;
      day: number;
    };
    featured_artists: ArtistObj[];
  };
};

/** Result returned by the songs endpoint of the genius API */
export type SongObj = SongBaseObj & {
  album: {
    api_path: string;
    cover_art_url: string;
    full_title: string;
    id: number;
    name: string;
    url: string;
    artist: ArtistObj;
  },
  translation_songs: {
    api_path: string;
    id: number;
    language: string;
    lyrics_state: string;
    path: string;
    title: string;
    url: string;
  }[];
};

/** Base object returned by the songs endpoints of the genius API */
type SongBaseObj = {
  api_path: string;
  artist_names: string;
  primary_artist: ArtistObj;
  full_title: string;
  header_image_thumbnail_url: string;
  header_image_url: string;
  id: number;
  language: string;
  lyrics_owner_id: number;
  lyrics_state: "complete";
  path: string;
  pyongs_count: number;
  relationships_index_url: string;
  song_art_image_thumbnail_url: string;
  song_art_image_url: string;
  title: string;
  title_with_featured: string;
  url: string;
};

/** Artist object returned by the genius API */
type ArtistObj = {
  api_path: string;
  header_image_url: string;
  id: number;
  image_url: string;
  name: string;
  url: string;
}

/** Album object returned by the genius API */
export interface Album {
  name: string;
  fullTitle: string;
  url: string;
  coverArt: string | null;
  id: number;
  artist: Artist;
}
