//#SECTION meta

export interface SongMeta {
    url: string;
    path: string;
    meta: {
        title: string;
        fullTitle: string;
        artists: string;
        primaryArtist: {
            name: string;
            url: string;
        },
    },
    resources: {
        thumbnail: string;
        image: string;
    },
    lyricsState: string;
    id: number;
}

//#SECTION server

export type ResponseType = "serverError" | "clientError" | "success";

export type ResponseFormat = "json" | "xml";

//#SECTION API

export type ApiSearchResult = {
    response: {
        hits: SearchHit[];
    };
};

export type SearchHit = {
    type: "song";
    result: {
        artist_names: string;
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
        release_date_components: {
            year: number;
            month: number;
            day: number;
        };
        song_art_image_thumbnail_url: string;
        song_art_image_url: string;
        title: string;
        title_with_featured: string;
        url: string;
        featured_artists: {
            api_path: string;
            header_image_url: string;
            id: number;
            image_url: string;
            name: string;
            url: string;
        }[];
        primary_artist: {
            api_path: string;
            header_image_url: string;
            id: number;
            image_url: string;
            name: string;
            url: string;
        };
    };
};
