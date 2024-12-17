import type { NavbarOptions } from "@vuepress/theme-default";

export const navbarEn: NavbarOptions = [
  {
    text: "Documentation",
    children: [
      "/docs/README.md",
      {
        text: "Routes",
        link: "/docs/routes/README.md",
      },
    ],
  },
  {
    text: "Try It",
    link: "/docs/try-it.md",
  },
  {
    text: "GitHub",
    link: "https://github.com/Sv443/geniURL",
  },
  {
    text: "Discord",
    link: "https://dc.sv443.net",
  },
] satisfies NavbarOptions;
