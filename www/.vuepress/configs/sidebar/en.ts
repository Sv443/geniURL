import type { SidebarOptions } from "@vuepress/theme-default";

export const sidebarEn = {
  "/docs/": [
    {
      text: "Introduction",
      link: "/docs/README.md",
    },
    {
      text: "Routes",
      link: "/docs/routes/README.md",
      children: [
        "/docs/routes/README.md",
        "/docs/routes/search.md",
        "/docs/routes/translations.md",
        "/docs/routes/album.md",
      ],
    },
    {
      text: "Try It",
      link: "/docs/try-it.md",
    },
  ],
} satisfies SidebarOptions;
