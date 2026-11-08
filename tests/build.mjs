import { execFileSync } from "node:child_process";
import {
  writeFileSync,
  appendFileSync,
  rmSync,
  readFileSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import assert from "node:assert/strict";
const directory = "content/references/blog";
mkdirSync(directory, { recursive: true });
const file = directory + "/acceptance.md";
const draft = directory + "/private.md";
if (existsSync(file) || existsSync(draft))
  throw new Error("Test fixture names already exist; refusing to overwrite");
let ownsCodeFixture = false;
try {
  writeFileSync(
    file,
    "---\ntitle: Test\ndate: 2026-11-05\nlang: en\ndraft: false\n---\n\n# Test 中文与 English 长标题排版检查\n\n[Home](../../SKILL.md)\n\n> 引用 text\n\n| A | B |\n| - | - |\n| 中文 | English |\n\n~~~python\nprint(xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)\n~~~\n",
  );
  writeFileSync(draft, "---\ndraft: true\n---\nSECRET");
  const codeDirectory = "content/references/code/__build_test__";
  if (existsSync(codeDirectory)) throw Error("Code fixture exists");
  mkdirSync(codeDirectory, { recursive: true });
  ownsCodeFixture = true;
  writeFileSync(
    codeDirectory + "/sample.py",
    "# region selected\nprint('INCLUDED_CODE')\n# endregion selected\nPRIVATE_TAIL\n",
  );
  appendFileSync(
    file,
    '\n::: code ../code/__build_test__/sample.py region="selected"\n:::\n',
  );
  execFileSync(
    process.execPath,
    [
      "node_modules/astro/bin/astro.mjs",
      "build",
      "--outDir",
      "output/acceptance-dist",
    ],
    {
      stdio: "inherit",
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
    },
  );
  assert.ok(
    readFileSync(
      "output/acceptance-dist/references/blog/acceptance/index.html",
      "utf8",
    ).includes('href="/"'),
  );
  assert.equal(
    readFileSync(
      "output/acceptance-dist/raw/references/blog/acceptance.md",
      "utf8",
    ),
    readFileSync(file, "utf8"),
  );
  assert.ok(
    !existsSync("output/acceptance-dist/raw/references/blog/private.md"),
  );
  assert.ok(
    !readFileSync("output/acceptance-dist/sitemap-0.xml", "utf8").includes(
      "/raw/",
    ),
  );
  const rendered = readFileSync(
    "output/acceptance-dist/references/blog/acceptance/index.html",
    "utf8",
  );
  assert.ok(rendered.includes("INCLUDED_CODE"));
  assert.ok(!rendered.includes("PRIVATE_TAIL"));
  assert.ok(!existsSync("output/acceptance-dist/references/code"));
  console.log(
    "Published route, original Markdown, relative links, draft exclusion and sitemap passed",
  );
} finally {
  if (ownsCodeFixture) rmSync("content/references/code/__build_test__", {
    recursive: true,
    force: true,
  });
  rmSync(file, { force: true });
  rmSync(draft, { force: true });
}
