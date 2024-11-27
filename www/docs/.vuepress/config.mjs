import { defineUserConfig } from "vuepress/cli";
import { defaultTheme } from "@vuepress/theme-default";
import { viteBundler } from "@vuepress/bundler-vite";
import { seoPlugin } from "@vuepress/plugin-seo";
import { sitemapPlugin } from "@vuepress/plugin-sitemap";
import rootPkgJson from "../../../package.json";

export default defineUserConfig({
  lang: "en-US",
  base: "/docs/v2/",
  title: "geniURL",
  description: "A simple JSON and XML REST API to search for song metadata, the lyrics URL and lyrics translations on genius.com",
  theme: defaultTheme({
    logo: "https://vuejs.press/images/hero.png",

    navbar: ["/", "/get-started"],
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
