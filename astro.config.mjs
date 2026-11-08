import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import sitemap from "@astrojs/sitemap";
export default defineConfig({
  site: "https://osak0.github.io",
  output: "static",
  trailingSlash: "always",
  devToolbar: { enabled: false },
  integrations: [
    {
      name: "code-file-reload",
      hooks: {
        "astro:server:setup": ({ server }) => {
          const directory = fileURLToPath(
            new URL("./content/references/code/", import.meta.url),
          );
          server.watcher.add(directory);
          server.watcher.on("all", (_event, file) => {
            if (
              file.replaceAll("\\", "/").includes("/content/references/code/")
            ) {
              server.moduleGraph.invalidateAll();
              server.ws.send({ type: "full-reload" });
            }
          });
        },
      },
    },
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
