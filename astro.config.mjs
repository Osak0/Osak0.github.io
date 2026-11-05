import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
export default defineConfig({
  site: "https://osak0.github.io",
  output: "static",
  trailingSlash: "always",
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      filter: (p) =>
        !p.includes("/raw/") && !p.includes("/assets/") && !p.endsWith(".html"),
    }),
  ],
  redirects: {
    "/blog/": "/references/blog/",
    "/zh/": "/",
    "/zh/blog/": "/references/blog/",
  },
});
