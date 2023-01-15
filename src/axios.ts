import { default as _axios } from "axios";

export const axios = _axios.create({
    timeout: 1000 * 15,
});
