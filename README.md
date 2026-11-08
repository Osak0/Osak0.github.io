# Osako 文档网站

Node.js 24 LTS。运行 npm ci、npm run dev。本地受限环境设置 ASTRO_TELEMETRY_DISABLED=1。

## 写作

首页编辑 content/SKILL.md，可以不写 YAML；非空元数据将以键值行展示。

将 docs/article-template.md 复制到 content/references/blog/name.md，填写 title、date、lang（en 或 zh），发布时设置 draft: false。缺省为草稿，不进入网页、目录、原文或站点地图。

references/blog/README.md 自动生成，不要手工创建。图片及附件放在 content/assets/，此目录所有文件均公开。

博客引用首页用 ../../SKILL.md，引用图片用 ../../assets/image.webp，同目录引用用 ./other.md。失效链接或指向草稿的链接会导致构建失败。

文章网页 /references/blog/name/，源码视图 ?view=source，原文 /raw/references/blog/name.md。切换主题后本地记忆。禁用脚本仍可阅读和导航，并可点击原文链接。

## 验证与部署

npm run check、npm test、npm run test:build、npm run build。npm run preview 查看生产输出。GitHub Pages Source 选择 GitHub Actions；main 更新后部署。修改不会自动推送。

## 博客引用代码

代码放在 `content/references/code/`，正文保留在 `content/references/blog/`。引用路径相对于文章文件；只读取代码，不执行，也不生成完整文件下载路由。

```md
::: code ../code/experiment/inference.py
:::

::: code ../code/experiment/inference.py lines="10-30"
:::

::: code ../code/experiment/inference.py region="predict" lang="python"
:::
```

`lines` 从 1 开始，包含起止行，不能与 `region` 同用。命名片段以独占一行的 `# region predict` / `# endregion predict` 标记，也支持 `//` 和 `<!-- -->` 注释。名称唯一，不允许嵌套；展示及复制不包含标记行。普通围栏代码块同样支持高亮、行号和复制。未知语言回退纯文本。

代码须为 UTF-8 文本。无效路径、参数、行范围或片段会中止构建。开发时保存代码会刷新预览；发布时重新构建并部署。`dist/` 可直接交给 GitHub Pages、Nginx 或 Caddy，无需后端。博客源码视图保留引用指令。
