import fs from "node:fs";
import path from "node:path";
import { ExpressiveCode } from "expressive-code";
import { toHtml } from "expressive-code/hast";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
const engine = new ExpressiveCode({
  themeCssSelector: (theme) =>
    theme.type === "dark"
      ? ':root[data-theme="dark"]'
      : ':root:not([data-theme="dark"])',
  plugins: [pluginLineNumbers()],
  defaultProps: { showLineNumbers: true },
});
export async function renderCode(md: any, source: string, file: string) {
  md.block.ruler.before(
    "fence",
    "code_include",
    (state: any, start: number, end: number, silent: boolean) => {
      const line = state.src.slice(
        state.bMarks[start] + state.tShift[start],
        state.eMarks[start],
      );
      if (!/^::: code(?:\s|$)/.test(line)) return false;
      if (silent) return true;
      const fail = (message: string): never => {
        throw Error(`${file}:${start + 1}: ${line}: ${message}`);
      };
      const match = line.match(/^::: code\s+(\S+)((?:\s+\w+="[^"]*")*)\s*$/);
      if (!match) fail("Invalid code directive");
      if (
        start + 1 >= end ||
        state.src
          .slice(
            state.bMarks[start + 1] + state.tShift[start + 1],
            state.eMarks[start + 1],
          )
          .trim() !== ":::"
      )
        fail("Expected closing :::");
      const options: Record<string, string> = {};
      for (const option of match![2].matchAll(/(\w+)="([^"]*)"/g)) {
        if (
          !["lines", "region", "lang"].includes(option[1]) ||
          option[1] in options
        )
          fail("Invalid or duplicate option");
        options[option[1]] = option[2];
      }
      if (options.lines && options.region)
        fail("lines and region are mutually exclusive");
      let code: string;
      let first = 1;
      const target = path.resolve("content", path.dirname(file), match![1]);
      try {
        const root = fs.realpathSync("content/references/code");
        const real = fs.realpathSync(target);
        const relative = path.relative(root, real);
        if (
          relative.startsWith("..") ||
          path.isAbsolute(relative) ||
          !fs.statSync(real).isFile()
        )
          fail("Code path outside allowed directory");
        code = new TextDecoder("utf-8", { fatal: true })
          .decode(fs.readFileSync(real))
          .replace(/\r\n/g, "\n");
        if (code.includes("\0")) fail("Binary file");
      } catch (error) {
        fail(String(error));
      }
      const lines = code!.split("\n");
      if (lines.at(-1) === "") lines.pop();
      const regions = new Map<string, [number, number]>();
      const markers = new Set<number>();
      let active: { name: string; start: number } | undefined;
      lines.forEach((text, i) => {
        const marker =
          text.match(/^\s*(?:#|\/\/)\s*(region|endregion)\s+([\w-]+)\s*$/) ||
          text.match(/^\s*<!--\s*(region|endregion)\s+([\w-]+)\s*-->\s*$/);
        if (!marker) return;
        markers.add(i);
        if (marker[1] === "region") {
          if (active || regions.has(marker[2]))
            fail("Nested or duplicate region");
          active = { name: marker[2], start: i + 1 };
        } else {
          if (!active || active.name !== marker[2]) fail("Unmatched region");
          regions.set(marker[2], [active!.start, i]);
          active = undefined;
        }
      });
      if (active) fail("Unclosed region");
      let from = 0,
        to = lines.length;
      if (options.lines) {
        const range = options.lines.match(/^(\d+)-(\d+)$/);
        if (!range) fail("Invalid lines range");
        from = Number(range![1]) - 1;
        to = Number(range![2]);
        if (from < 0 || to <= from || to > lines.length)
          fail("Range outside file");
      }
      if (options.region) {
        const range = regions.get(options.region);
        if (!range) fail("Region not found");
        [from, to] = range!;
      }
      first = from + 1;
      const token = state.push("fence", "code", 0);
      token.content = lines
        .slice(from, to)
        .filter((_, i) => !markers.has(from + i))
        .join("\n");
      const languages: Record<string, string> = {
        py: "python",
        js: "javascript",
        ts: "typescript",
        sh: "bash",
        yml: "yaml",
        md: "markdown",
        h: "cpp",
      };
      const ext = path.extname(target).slice(1);
      token.info = options.lang || languages[ext] || ext || "text";
      token.includeNumbers = lines
        .map((_, i) => i + 1)
        .slice(from, to)
        .filter((_, i) => !markers.has(from + i));
      token.meta = { title: path.basename(target), startLineNumber: first };
      state.line = start + 2;
      return true;
    },
  );
  const tokens = md.parse(source, {});
  const styles = new Set<string>();
  for (const token of tokens) {
    if (token.type !== "fence") continue;
    let language = token.info.split(/\s/)[0] || "text";
    let result;
    try {
      result = await engine.render({
        code: token.content,
        language,
        meta: token.info.slice(language.length),
        props: token.meta || {},
      });
    } catch (error) {
      if (!String(error).toLowerCase().includes("language")) throw error;
      result = await engine.render({
        code: token.content,
        language: "text",
        props: token.meta || {},
      });
    }
    token.type = "html_block";
    token.content = toHtml(result.renderedGroupAst);
    if (token.includeNumbers) {
      let index = 0;
      token.content = token.content.replace(
        /(<div class="ln"[^>]*>)\d+(<\/div>)/g,
        (_match: string, open: string, close: string) =>
          `${open}${token.includeNumbers[index++]}${close}`,
      );
    }
    result.styles.forEach((style) => styles.add(style));
  }
  const html = md.renderer.render(tokens, md.options, {});
  if (
    !styles.size &&
    !tokens.some((t: any) => t.content.includes("expressive-code"))
  )
    return html;
  return `<style>${await engine.getBaseStyles()}${await engine.getThemeStyles()}${[...styles].join("")}</style>${html}<script type="module">${(await engine.getJsModules()).join("\n")}</script>`;
}
