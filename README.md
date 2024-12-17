# geniURL
Simple JSON and XML REST API to search for song metadata, the lyrics URL and lyrics translations on [genius.com](https://genius.com/)  
Authorization is not required. Obtaining actual lyrics sadly isn't possible.  
  
Disclaimer: this project is not affiliated with or endorsed by Genius.  
  
> [!NOTE]  
> Like using geniURL for free?  
> It's entirely reliant on donations so please consider [supporting the development ❤️](https://github.com/sponsors/Sv443)  

<br>

## Table of contents:
- [Documentation](#documentation)
- [Try it](#try-it)
- [Local setup](#local-setup)
- [Legal stuff](#legal-stuff)

<br><br>

## Documentation:
The full documentation is available on this page: https://api.sv443.net/geniurl/v2/docs/  
It will explain everything you need to know about using the REST API.

<br><br>

## Try it:
For trying out geniURL yourself, you can use [this Postman workspace.](https://www.postman.com/sv443/workspace/geniurl)  
To download it and test locally, hover over the collection, click the three-dot-menu, then click "Export".

<br><br>

## Local setup:
To set up geniURL locally, follow these steps:
1. [Install Node.js](https://nodejs.org/en/download) (current or LTS) and make sure npm is installed by running `npm -v`
2. [Install pnpm](https://pnpm.io/installation) (can be done by running `npm i -g pnpm`)
3. Clone or download and extract this repository
4. Run `pnpm i` in the project directory to install dependencies
5. Copy `.env.template` to `.env` and fill in the required values  
  The genius.com API key can be obtained by [creating an API client here](https://genius.com/api-clients)
6. Run `pnpm start` to start the REST server  
  Alternatively, run `pnpm dev` to start the server and automatically recompile and restart when the code is changed.  
  If you want to start the documentation as well, make sure `HOST_HOMEPAGE` is set to `true` in `.env`, then run `pnpm dev-all`.

I recommend using a process manager like [PM2](https://pm2.keymetrics.io/) to keep the server running in the background, make it automatically restart on crashes and start on system boot.  
  
Minor modifications to the server's behavior can be made in the file [`src/constants.ts`](./src/constants.ts)

<br><br>

## Legal stuff:
This project is licensed under the [MIT License](./LICENSE.txt)  
  
The genius.com API is used to get the search results and song metadata. No actual lyrics are obtained.  
This project is not affiliated with, sponsored or endorsed by genius.com.

<br><br><br>

<div align="center" style="text-align:center;">

Made with ❤️ by [Sv443](https://sv443.net/)  
If you like geniURL, please consider [supporting the development ❤️](https://github.com/sponsors/Sv443)

</div>
