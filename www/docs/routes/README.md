---
lang: en-US
title: Info
description: General information about all routes that are offered by geniURL's REST service
---

## Base URL
I host a public instance on this base URL:
```
https://api.sv443.net/geniurl/v2/
```

<br>

## Rate Limiting
The public instance is rate limited to 25 requests within a 30 second timeframe.  
To know how many requests you have sent and are still able to send, refer to the following headers that are attached to each response:
| Name                    | Description                                                                                                     |
| :---------------------- | :-------------------------------------------------------------------------------------------------------------- |
| `Retry-After`           | Number of seconds you need to wait until being able to send another request.                                    |
| `X-RateLimit-Reset`     | An [ISO 8601 UTC timestamp](https://en.wikipedia.org/wiki/ISO_8601) indicating when you can send more requests. |
| `X-RateLimit-Limit`     | The total number of requests you can send per timeframe.                                                        |
| `X-RateLimit-Remaining` | The requests you are still able to send in the current timeframe.                                               |

<br>

## Error detection
All routes always return the properties `error` and `matches`.  
They can be used to determine whether a response has succeeded (error = false, matches > 0), is errored (error = true, matches = null) or just didn't yield any results (error = true, matches = 0).  
  
Additionally, you can use the [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) to find out whether a request has succeeded or not.

<br>

## Compression
All routes support gzip, deflate and brotli compression.  
If no compression support is provided via the `Accept-Encoding` header, the content will be transmitted uncompressed.

<br>

## Available routes
These are the available routes:
- [GET `/search`](./search#get-search) - Search for lyrics (multiple results)
  - [GET `/search/top`](./search#get-search-top) - Search for lyrics (only the top result)
- [GET `/translations/:songId`](./translations) - Fetch lyrics translations
- [GET `/album/:songId`](./album) - Fetch associated album
