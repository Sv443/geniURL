---
lang: en-US
title: Guide
description: Get started with using geniURL to fetch lyrics metadata
---

## Introduction
geniURL is a simple JSON and XML REST API to search for song metadata, the lyrics URL and lyrics translations on genius.com.  
Authorization is not required and geniURL implements a fuzzy search that will greatly improve search results over the genius.com API.  
Obtaining actual lyrics sadly isn't possible.

<br>

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
