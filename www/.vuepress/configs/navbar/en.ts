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
    link: "/docs/manual-search.md",
  },
  {
    text: "GitHub",
    link: "https://github.com/Sv443/geniURL",
  },
  {
    text: "Discord",
    link: "https://dc.sv443.net",
  },
  /*{
    text: 'Routes',
    children: [
      {
        text: 'Core',
        children: [
          {
            text: 'CLI',
            link: '/reference/cli.html',
          },
          '/reference/config.md',
          '/reference/frontmatter.md',
          '/reference/components.md',
          '/reference/plugin-api.md',
          '/reference/theme-api.md',
          '/reference/client-api.md',
          '/reference/node-api.md',
        ],
      },
      {
        text: 'Bundlers',
        children: [
          '/reference/bundler/vite.md',
          '/reference/bundler/webpack.md',
        ],
      },
      {
        text: 'Ecosystem',
        children: [
          {
            text: 'Default Theme',
            link: 'https://ecosystem.vuejs.press/themes/default/',
          },
          {
            text: 'Plugins',
            link: 'https://ecosystem.vuejs.press/plugins/',
          },
        ],
      },
    ],
  },
  {
    text: 'Learn More',
    children: [
      {
        text: 'Advanced',
        children: [
          '/advanced/architecture.md',
          '/advanced/plugin.md',
          '/advanced/theme.md',
          {
            text: 'Cookbook',
            link: '/advanced/cookbook/',
          },
        ],
      },
      {
        text: 'Resources',
        children: [
          {
            text: 'Ecosystem',
            link: 'https://ecosystem.vuejs.press/',
          },
          {
            text: 'MarketPlace',
            link: 'https://marketplace.vuejs.press',
          },
          {
            text: 'Contributing Guide',
            link: 'https://github.com/vuepress/core/blob/main/CONTRIBUTING.md',
          },
        ],
      },
    ],
  },
  {
    text: `v${VERSION}`,
    children: [
      {
        text: 'Changelog',
        link: 'https://github.com/vuepress/core/blob/main/CHANGELOG.md',
      },
      {
        text: 'v1.x',
        link: 'https://v1.vuepress.vuejs.org',
      },
      {
        text: 'v0.x',
        link: 'https://v0.vuepress.vuejs.org',
      },
    ],
  },*/
  // TODO: remove the type assertion
] as NavbarOptions;
