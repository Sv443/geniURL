import { initSearchEndpoints } from "./search";
import { initTranslationsEndpoints } from "./translations";

export const endpointFuncs = [
    initSearchEndpoints,
    initTranslationsEndpoints,
];
