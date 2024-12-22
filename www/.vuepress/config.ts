import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync } from "node:fs";
import { defineUserConfig } from "vuepress/cli";
import { defaultTheme } from "@vuepress/theme-default";
import { viteBundler } from "@vuepress/bundler-vite";
import { seoPlugin } from "@vuepress/plugin-seo";
import { sitemapPlugin } from "@vuepress/plugin-sitemap";
import { registerComponentsPlugin } from "@vuepress/plugin-register-components";
import "dotenv/config";
import rootPkgJson from "../../package.json";
import { navbarEn, sidebarEn } from "./configs/index.js";

const verMajor = Number(rootPkgJson.version.split(".")![0]);

const componentDir = join(dirname(fileURLToPath(import.meta.url)), "./components/");
const componentNames = readdirSync(componentDir).map((p) => {
  const fileNameParts = p.split("/").at(-1)!.split(".");
  fileNameParts.pop();
  return fileNameParts.join(".");
});

export default defineUserConfig({
  lang: "en-US",
  base: process.env.HOST_HOMEPAGE?.trim().toLowerCase() === "true" ? `/v${verMajor}/docs/` : "/",
  title: "geniURL",
  description: "JSON and XML REST API to search for song metadata, lyrics URL and lyrics translations via the genius.com API without requiring an API key.",
  theme: defaultTheme({
    // logo: "https://vuejs.press/images/hero.png",
    navbar: navbarEn,
    sidebar: sidebarEn,
  }),
  // @ts-ignore
  bundler: viteBundler(),
  plugins: [
    seoPlugin({
      hostname: "https://api.sv443.net",
      author: rootPkgJson.author,
    }),
    sitemapPlugin({
      hostname: "https://api.sv443.net",
      changefreq: "weekly",
    }),
    registerComponentsPlugin({
      components: componentNames.reduce((a, c) => ({ ...a, [c]: join(componentDir, `${c}.vue`) }), {}),
    }),
  ],
});
