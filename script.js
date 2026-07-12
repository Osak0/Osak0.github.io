(function () {
  "use strict";

  var year = document.querySelector("[data-current-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  var content = window.OSAKO_CONTENT || {};

  renderItems("updates", content.updates, function (item) {
    return card(item.title, item.summary, item.href, item.date);
  });
  renderItems("projects", content.projects, function (item) {
    return card(item.title, item.summary, item.repository || item.href, item.status);
  });
  renderItems("notes", content.notes, function (item) {
    return card(item.title, item.summary, item.href, item.category);
  });

  function renderItems(key, items, createItem) {
    var target = document.querySelector('[data-content="' + key + '"]');
    if (!target || !Array.isArray(items) || items.length === 0) return;

    var fragment = document.createDocumentFragment();
    items.forEach(function (item) { fragment.appendChild(createItem(item)); });
    target.replaceChildren(fragment);
    target.classList.add("editorial-grid");
  }

  function card(title, summary, href, meta) {
    var element = document.createElement(href ? "a" : "article");
    element.className = "feature-card";
    if (href) element.href = href;

    var small = document.createElement("span");
    small.className = "card-index";
    small.textContent = meta || "更新";

    var heading = document.createElement("h3");
    heading.textContent = title || "未命名内容";

    var copy = document.createElement("p");
    copy.textContent = summary || "";

    element.append(small, heading, copy);
    return element;
  }
})();
