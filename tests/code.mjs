import assert from "node:assert/strict";
import fs from "node:fs";
import MarkdownIt from "markdown-it";
import { renderCode } from "../src/lib/code.ts";
const dir = "content/references/code/__include_test__";
if (fs.existsSync(dir)) throw Error("Fixture already exists");
fs.mkdirSync(dir, { recursive: true });
const render = (value) =>
  renderCode(new MarkdownIt({ html: false }), value, "references/blog/test.md");
const include = (options) =>
  `::: code ../code/__include_test__/sample.py ${options}\n:::\n`;
try {
  fs.writeFileSync(
    `${dir}/sample.py`,
    '# region predict\r\nprint("中文 <tag>")\r\n# endregion predict\r\nUNPUBLISHED_TAIL\r\n',
  );
  const html = await render(include('region="predict"'));
  assert.ok(html.includes("expressive-code"));
  assert.ok(html.includes("中文"));
  assert.ok(!html.includes("UNPUBLISHED_TAIL"));
  assert.ok(/(?:&lt;|&#x3C;)tag/.test(html));
  assert.ok(html.includes("sample.py"));
  assert.match(html, /class="ln"[^>]*>2<\/div>/);
  assert.ok((await render(include('lines="2-2"'))).includes("中文"));
  for (const options of [
    'lines="0-3"',
    'lines="1-99"',
    'region="missing"',
    'region="predict" lines="1-2"',
    'oops="x"',
  ]) {
    await assert.rejects(
      () => render(include(options)),
      /references\/blog\/test.md:1/,
    );
  }
  await assert.rejects(() => render("::: code ../../../package.json\n:::\n"));
  const literal = await render("```md\n::: code missing.py\n:::\n```");
  assert.ok(literal.includes("missing.py"));
  fs.writeFileSync(
    `${dir}/sample.py`,
    "# region a\n# region b\n# endregion b\n# endregion a",
  );
  await assert.rejects(() => render(include("")), /Nested/);
  console.log(
    "Code include extraction, escaping, ranges, regions and errors passed",
  );
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
