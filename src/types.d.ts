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
