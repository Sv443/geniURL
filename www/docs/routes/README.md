---
lang: en-US
title: Info
description: General information about all routes that are offered by geniURL's REST service
---

## General info
All routes support gzip, deflate and brotli compression.  
  
Also all routes always return the properties `error` and `matches`.  
They can be used to determine whether a response has succeeded (error = false, matches > 0), is errored (error = true, matches = null) or just didn't yield any results (error = true, matches = 0).  

<br>

## Available routes
These are the available routes:
- [GET `/search`](./search#get-search) - Search for lyrics (multiple results)
  - [GET `/search/top`](./search#get-search-top) - Search for lyrics (only the top result)
- [GET `/translations/:songId`](./translations) - Fetch lyrics translations
- [GET `/album/:songId`](./album) - Fetch associated album
