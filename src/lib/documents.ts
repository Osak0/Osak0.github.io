import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
export interface Document {
  file: string;
  url: string;
  raw: string;
  body: string;
  title: string;
  lang: string;
  date?: string;
  metadata: Record<string, unknown>;
}
const base = path.resolve("content");
function walk(dir: string): string[] {
  return fs.existsSync(dir)
    ? fs
        .readdirSync(dir, { withFileTypes: true })
        .flatMap((e) =>
          e.isDirectory()
            ? walk(path.join(dir, e.name))
            : [path.join(dir, e.name)],
        )
    : [];
}
export const assets = walk(path.join(base, "assets")).map((p) => ({
  file: path.relative(base, p).replaceAll("\\", "/"),
  bytes: fs.readFileSync(p),
}));
const entries: Document[] = walk(base)
  .filter(
    (p) =>
      p.endsWith(".md") && !p.startsWith(path.join(base, "assets") + path.sep),
  )
  .flatMap((p) => {
    const file = path.relative(base, p).replaceAll("\\", "/");
    const raw = fs.readFileSync(p, "utf8");
    const { data, content } = matter(raw);
    if (file === "references/blog/README.md")
      throw Error("Blog README is generated");
    if (file !== "SKILL.md") {
      if (data.draft !== false) return [];
      if (!data.title || !data.date || !["en", "zh"].includes(data.lang))
        throw Error("Missing title/date/lang: " + file);
    }
    return [
      {
        file,
        raw,
        body: content,
        url: file === "SKILL.md" ? "/" : "/" + file.slice(0, -3) + "/",
        title: String(data.title || file.split("/").pop()),
        lang: data.lang === "en" ? "en" : "zh-CN",
        date: data.date
          ? new Date(data.date).toISOString().slice(0, 10)
          : undefined,
        metadata: data,
      },
    ];
  });
const posts = entries
  .filter((d) => d.file.startsWith("references/blog/"))
  .sort(
    (a, b) =>
      (b.date || "").localeCompare(a.date || "") ||
      a.file.localeCompare(b.file),
  );
const index =
  "# Blog\n\n" +
  (posts.length
    ? posts
        .map(
          (p) =>
            "- " +
            p.date +
            " [" +
            p.title.replace(/[\[\]\r\n]/g, " ") +
            "](./" +
            encodeURIComponent(p.file.slice(16)) +
            ")",
        )
        .join("\n")
    : "暂无文章。") +
  "\n";
export const documents: Document[] = [
  ...entries,
  {
    file: "references/blog/README.md",
    url: "/references/blog/",
    raw: index,
    body: index,
    title: "Blog",
    lang: "zh-CN",
    metadata: {},
  },
];
export function renderDocument(doc: Document) {
  const md = new MarkdownIt({ html: false, linkify: true });
  function resolve(href: string) {
    if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(href)) return href;
    const parts = href.match(/^([^?#]*)(.*)$/)!;
    const name = decodeURIComponent(parts[1]);
    const target = name.startsWith("/")
      ? name.slice(1)
      : path.posix.normalize(
          path.posix.join(path.posix.dirname(doc.file), name),
        );
    const found = documents.find((d) => d.file === target || d.url === name);
    if (found) return found.url + parts[2];
    if (assets.some((a) => a.file === target)) return "/" + target + parts[2];
    throw Error("Broken or unpublished link in " + doc.file + ": " + href);
  }
  md.renderer.rules.link_open = (tokens, i, options, _env, self) => {
    tokens[i].attrSet("href", resolve(String(tokens[i].attrGet("href") || "")));
    return self.renderToken(tokens, i, options);
  };
  const image = md.renderer.rules.image!;
  md.renderer.rules.image = (tokens, i, options, _env, self) => {
    tokens[i].attrSet("src", resolve(String(tokens[i].attrGet("src") || "")));
    return image(tokens, i, options, _env, self);
  };
  return md.render(doc.body);
}
for (const doc of documents) renderDocument(doc);
