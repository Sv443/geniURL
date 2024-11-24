import { defaultTheme } from "@vuepress/theme-default"
import { defineUserConfig } from "vuepress/cli"
import { viteBundler } from "@vuepress/bundler-vite"

export default defineUserConfig({
  lang: "en-US",

  title: "geniURL Homepage and Docs",
  description: "geniURL is a simple JSON and XML REST API to search for song metadata, the lyrics URL and lyrics translations on genius.com",

  theme: defaultTheme({
    logo: "https://vuejs.press/images/hero.png",

    navbar: ["/", "/get-started"],
  }),

  bundler: viteBundler(),
})
