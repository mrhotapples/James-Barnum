/* ==========================================================
   blog.js — renders `articles` (from blog-data.js) into #article-list,
   with sort + category filter controls.
   Add data-limit="3" to the container for a "latest posts" strip
   (no controls are shown in that case).
   ========================================================== */
(function () {
  "use strict";

  const state = { key: "date", dir: "desc", category: "all" };

  const sorters = {
    date: function (a, b) { return a.date.localeCompare(b.date); },
    title: function (a, b) { return a.title.localeCompare(b.title); },
    category: function (a, b) { return a.category.localeCompare(b.category); }
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function prettyDate(iso) {
    const d = new Date(iso + "T12:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function visibleArticles() {
    const compare = sorters[state.key];
    const direction = state.dir === "asc" ? 1 : -1;
    return articles
      .filter(function (a) { return state.category === "all" || a.category === state.category; })
      .sort(function (a, b) { return compare(a, b) * direction || a.title.localeCompare(b.title); });
  }

  function render() {
    const list = document.getElementById("article-list");
    if (!list) return;
    const limit = parseInt(list.dataset.limit, 10) || Infinity;
    const items = visibleArticles().slice(0, limit);

    list.innerHTML = items.length
      ? items.map(function (a) {
          return (
            '<article class="card">' +
              (a.image ? '<a href="' + esc(a.url) + '"><img class="thumb" loading="lazy" src="' + esc(a.image) + '" alt="' + esc(a.title) + '"></a>' : "") +
              '<div class="card-body">' +
                '<span class="tag">' + esc(a.category) + '</span>' +
                '<h3>' + esc(a.title) + '</h3>' +
                '<p class="meta">' + esc(prettyDate(a.date)) + (a.readTime ? " &bull; " + esc(a.readTime) + " min read" : "") + '</p>' +
                '<p class="summary">' + esc(a.summary) + '</p>' +
                '<a class="btn" href="' + esc(a.url) + '">Read article</a>' +
              '</div>' +
            '</article>'
          );
        }).join("")
      : '<div class="empty" style="grid-column:1/-1">No articles yet — the first one is on its way.</div>';
  }

  function setupControls() {
    const list = document.getElementById("article-list");
    if (!list || list.dataset.limit) return; // controls only on the full list

    const categories = Array.from(new Set(articles.map(function (a) { return a.category; }))).sort();
    const controls = document.createElement("div");
    controls.className = "sort-controls";
    controls.innerHTML =
      '<label for="sort-key">Sort by</label>' +
      '<select id="sort-key">' +
        '<option value="date">Date published</option>' +
        '<option value="title">Title</option>' +
        '<option value="category">Category</option>' +
      '</select>' +
      '<button type="button" id="sort-dir" aria-label="Toggle sort direction"></button>' +
      '<label for="filter-cat">Category</label>' +
      '<select id="filter-cat"><option value="all">All</option>' +
        categories.map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + '</option>'; }).join("") +
      '</select>';
    list.parentNode.insertBefore(controls, list);

    const keySelect = controls.querySelector("#sort-key");
    const dirButton = controls.querySelector("#sort-dir");
    const catSelect = controls.querySelector("#filter-cat");

    function updateButton() {
      dirButton.textContent = state.dir === "asc" ? "↑ Ascending" : "↓ Descending";
    }
    updateButton();

    keySelect.addEventListener("change", function () {
      state.key = keySelect.value;
      state.dir = state.key === "date" ? "desc" : "asc";
      updateButton();
      render();
    });
    dirButton.addEventListener("click", function () {
      state.dir = state.dir === "asc" ? "desc" : "asc";
      updateButton();
      render();
    });
    catSelect.addEventListener("change", function () {
      state.category = catSelect.value;
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupControls();
    render();
  });
})();
