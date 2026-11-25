/* ==========================================================
   article.js — runs on every page in /articles/.
   Needs blog-data.js loaded first (it defines `articles`).

   Fills in:
     - author avatar in the byline + the author box   (#author-box, .avatar)
     - share buttons                                  (#share-row)
     - "latest 3 in this category" strip              (#related-articles)

   Because the related strip is built from blog-data.js in the
   browser, every article (old and new) updates automatically
   whenever a new post is added.
   ========================================================== */
(function () {
  "use strict";

  // ---------- EDIT ME: author profiles ----------
  // Key = the name typed in Article Gen's "Author" field.
  // avatar: image path relative to the site root ("" = initials circle)
  // url:    where the author's name/box links to ("" = no link)
  const AUTHORS = {
    "James Barnum": {
      bio: "Writing about video, marketing, and building an online business.",
      avatar: "",
      url: "about.html"
    }
  };
  // -----------------------------------------------

  const RELATED_COUNT = 3;
  const script = document.currentScript;
  const ROOT = (script && script.getAttribute("data-root")) || "../";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function isExternal(p) { return /^([a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(p); }
  function asset(p) { return isExternal(p) ? p : ROOT + p; }
  function initials(name) {
    return String(name).trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join("") || "?";
  }
  function prettyDate(iso) {
    const d = new Date(iso + "T12:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
  function avatarHtml(name, cls) {
    const a = AUTHORS[name];
    return a && a.avatar
      ? '<img class="' + cls + '" src="' + esc(asset(a.avatar)) + '" alt="">'
      : '<span class="' + cls + '" aria-hidden="true">' + esc(initials(name)) + "</span>";
  }

  // ---------- byline avatar + author box ----------
  function renderAuthors() {
    document.querySelectorAll(".byline .avatar[data-author]").forEach(function (el) {
      const a = AUTHORS[el.getAttribute("data-author")];
      if (a && a.avatar) el.innerHTML = '<img src="' + esc(asset(a.avatar)) + '" alt="">';
    });

    const box = document.getElementById("author-box");
    if (!box) return;
    const name = box.getAttribute("data-author") || "";
    const a = AUTHORS[name] || {};
    const nameHtml = a.url
      ? '<a href="' + esc(asset(a.url)) + '">' + esc(name) + "</a>"
      : esc(name);
    box.innerHTML =
      avatarHtml(name, "avatar avatar-lg") +
      '<div class="author-box-text">' +
        '<p class="author-box-label">Written by</p>' +
        '<p class="author-box-name">' + nameHtml + "</p>" +
        (a.bio ? '<p class="author-box-bio">' + esc(a.bio) + "</p>" : "") +
      "</div>";
  }

  // ---------- share buttons ----------
  function renderShare() {
    const row = document.getElementById("share-row");
    if (!row) return;
    const url = encodeURIComponent(location.href);
    const title = encodeURIComponent(document.title);
    row.innerHTML =
      '<span class="share-label">Share</span>' +
      '<button type="button" class="chip" id="copy-link">Copy link</button>' +
      '<a class="chip" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=' + url + "&text=" + title + '">X</a>' +
      '<a class="chip" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + url + '">Facebook</a>' +
      '<a class="chip" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=' + url + '">LinkedIn</a>';

    const btn = document.getElementById("copy-link");
    btn.addEventListener("click", function () {
      function done() {
        btn.textContent = "Copied!";
        setTimeout(function () { btn.textContent = "Copy link"; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href).then(done, function () { window.prompt("Copy this link:", location.href); });
      } else {
        window.prompt("Copy this link:", location.href);
      }
    });
  }

  // ---------- latest posts strip ----------
  function newestFirst(a, b) {
    return b.date.localeCompare(a.date) || a.title.localeCompare(b.title);
  }

  function renderRelated() {
    const box = document.getElementById("related-articles");
    if (!box || typeof articles === "undefined") return;

    // Which article is this page?
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    const currentUrl = (box.getAttribute("data-url") || "articles/" + file).toLowerCase();
    const current = articles.filter(function (a) { return a.url.toLowerCase() === currentUrl; })[0];
    const category = box.getAttribute("data-category") || (current && current.category) || "";

    const others = articles.filter(function (a) { return a.url.toLowerCase() !== currentUrl; }).sort(newestFirst);
    const sameCategory = others.filter(function (a) { return a.category === category; }).slice(0, RELATED_COUNT);

    // If the category has fewer than 3 other posts, top up with the newest posts overall
    // so the reader always has somewhere to go next.
    let picks = sameCategory.slice();
    others.forEach(function (a) {
      if (picks.length < RELATED_COUNT && picks.indexOf(a) === -1) picks.push(a);
    });
    if (!picks.length) return; // only article on the site — nothing to show

    const heading = sameCategory.length >= RELATED_COUNT
      ? "More in " + esc(category)
      : (sameCategory.length ? "Keep reading" : "Latest from the blog");

    box.innerHTML =
      "<h2>" + heading + "</h2>" +
      '<div class="card-grid">' +
      picks.map(function (a) {
        const href = esc(asset(a.url));
        return (
          '<article class="card">' +
            (a.image ? '<a href="' + href + '" tabindex="-1" aria-hidden="true"><img class="thumb" loading="lazy" src="' + esc(asset(a.image)) + '" alt=""></a>' : "") +
            '<div class="card-body">' +
              '<span class="tag">' + esc(a.category) + "</span>" +
              '<h3><a class="card-link" href="' + href + '">' + esc(a.title) + "</a></h3>" +
              '<p class="meta">' + esc(prettyDate(a.date)) + (a.readTime ? " &bull; " + esc(a.readTime) + " min read" : "") + "</p>" +
              '<p class="summary">' + esc(a.summary) + "</p>" +
              '<a class="btn" href="' + href + '">Read article</a>' +
            "</div>" +
          "</article>"
        );
      }).join("") +
      "</div>" +
      '<p style="margin:0"><a class="btn btn-ghost" href="' + esc(ROOT) + 'blog.html">View all articles</a></p>';
    box.hidden = false;
  }

  function init() {
    renderAuthors();
    renderShare();
    renderRelated();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
