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
