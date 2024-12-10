import { defineUserConfig } from "vuepress/cli";
import { defaultTheme } from "@vuepress/theme-default";
import { viteBundler } from "@vuepress/bundler-vite";
import { seoPlugin } from "@vuepress/plugin-seo";
import { sitemapPlugin } from "@vuepress/plugin-sitemap";
import "dotenv/config";
import rootPkgJson from "../../package.json";
import { navbarEn, sidebarEn } from "./configs/index.js";

const verMajor = Number(rootPkgJson.version.split(".")![0]);

export default defineUserConfig({
  lang: "en-US",
  base: process.env.HOST_HOMEPAGE === "true" ? `/v${verMajor}/docs/` : "/",
  title: "geniURL",
  description: "A simple JSON and XML REST API to search for song metadata, the lyrics URL and lyrics translations on genius.com",
  theme: defaultTheme({
    logo: "https://vuejs.press/images/hero.png",
    navbar: navbarEn,
    sidebar: sidebarEn,
  }),
  bundler: viteBundler(),
  plugins: [
    seoPlugin({
      hostname: "https://api.sv443.net",
      author: rootPkgJson.author,
    }),
    sitemapPlugin({
      hostname: "https://api.sv443.net",
    }),
  ]
});
