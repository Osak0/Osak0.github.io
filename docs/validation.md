# 文档仓库版验收

2026-11-05，本地验证，未推送或上线。

- 类型检查：0 错误、0 警告。
- 生产构建和集成测试通过：文章生成、原始 Markdown 一致性、相对链接转换、草稿原文排除、站点地图排除原文。
- Playwright：375 / 768 / 1440px，浅色和深色均无页面横向溢出；截图位于 output/playwright/skill-*。
- 源码 URL 参数、原文响应、主题保存、键盘跳过导航和无 JavaScript 文件导航均通过。
- npm audit：0 vulnerabilities。

性能报告与其他补充结果如可生成，保存在 output/。本次不沿用上一版网站的 Lighthouse 分数。

正文留空，文章模板在 docs/article-template.md。content/assets 下的文件全部公开；草稿附件应留在此目录之外。

Lighthouse 13.5.0 移动端模拟，本地生产首页：性能 100，可访问性 100，LCP 约 0.6 秒，CLS 0。原始报告 output/skill-lighthouse.json。分数不代表公网部署速度。

