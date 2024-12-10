---
lang: en-US
title: General info
description: General information about all routes that are offered by geniURL's REST service
---

# General info
All routes support gzip, deflate and brotli compression.  
  
Also all routes always return the properties `error` and `matches`.  
They can be used to determine whether a response has succeeded (error = false, matches > 0), is errored (error = true, matches = null) or just didn't yield any results (error = true, matches = 0).  
