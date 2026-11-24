/* ==========================================================
   portfolio.js — renders portfolioItems into #portfolio-list.
   The category comes from the URL hash:
     portfolio.html#video | #design | #writing | #music
   No hash (or an unknown one) falls back to DEFAULT_CATEGORY.
   Requires portfolio-data.js to be loaded first.
   ========================================================== */
(function () {
  "use strict";

  const DEFAULT_CATEGORY = "video";

  const CATEGORIES = [
    { key: "video", label: "Video", blurb: "Hero videos, short clips, and edits." },
    { key: "design", label: "Graphic Design", blurb: "Graphics, layouts, and visual identity work." },
    { key: "writing", label: "Writing", blurb: "Copy, articles, and scripts." },
    { key: "music", label: "Music", blurb: "Original recordings and compositions." }
  ];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function currentCategory() {
    const key = decodeURIComponent(location.hash.replace("#", "")).toLowerCase();
    return CATEGORIES.some(function (c) { return c.key === key; }) ? key : DEFAULT_CATEGORY;
  }

  // Turn a YouTube / Vimeo link into an embeddable URL (or null for plain files)
  function embedUrl(url) {
    let m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
    if (m) return "https://www.youtube-nocookie.com/embed/" + m[1];
    m = String(url).match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return "https://player.vimeo.com/video/" + m[1];
    return null;
  }

  function mediaHtml(item) {
    const title = esc(item.title);
    if (item.category === "video") {
      const embed = embedUrl(item.media);
      if (embed) {
        return '<iframe class="media" src="' + esc(embed) + '" title="' + title + '" loading="lazy" allowfullscreen ' +
          'allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"></iframe>';
      }
      return '<video class="media" controls preload="metadata" ' + (item.thumb ? 'poster="' + esc(item.thumb) + '" ' : "") +
        'src="' + esc(item.media) + '"></video>';
    }
    if (item.category === "design") {
      return '<img class="thumb" loading="lazy" src="' + esc(item.media) + '" alt="' + title + '">';
    }
    if (item.category === "music") {
      return (item.thumb ? '<img class="thumb" loading="lazy" src="' + esc(item.thumb) + '" alt="' + title + ' artwork">' : "") +
        '<audio controls preload="none" src="' + esc(item.media) + '"></audio>';
    }
    // writing
    return item.thumb ? '<img class="thumb" loading="lazy" src="' + esc(item.thumb) + '" alt="' + title + '">' : "";
  }

  function cardHtml(item) {
    const link = item.link
      ? '<a class="btn" href="' + esc(item.link) + '"' + (/^https?:/i.test(item.link) ? ' target="_blank" rel="noopener"' : "") + '>' +
        (item.category === "writing" ? "Read it" : "View more") + '</a>'
      : "";
    return (
      '<article class="card">' +
        mediaHtml(item) +
        '<div class="card-body">' +
          '<h3>' + esc(item.title) + '</h3>' +
          '<p class="meta">' + esc(item.date || "") + '</p>' +
          '<p class="summary">' + esc(item.description) + '</p>' +
          link +
        '</div>' +
      '</article>'
    );
  }

  function render() {
    const list = document.getElementById("portfolio-list");
    if (!list) return;
    const cat = currentCategory();
    const info = CATEGORIES.filter(function (c) { return c.key === cat; })[0];

    // Chips
    document.querySelectorAll("#portfolio-chips .chip").forEach(function (chip) {
      chip.classList.toggle("active", chip.getAttribute("data-cat") === cat);
    });
    const blurb = document.getElementById("portfolio-blurb");
    if (blurb) blurb.textContent = info.blurb;

    // Newest first within the category
    const items = portfolioItems
      .filter(function (i) { return i.category === cat; })
      .sort(function (a, b) { return (b.date || "").localeCompare(a.date || "") || a.title.localeCompare(b.title); });

    list.innerHTML = items.length
      ? items.map(cardHtml).join("")
      : '<div class="empty" style="grid-column:1/-1">No ' + esc(info.label.toLowerCase()) + ' pieces yet — check back soon.</div>';
  }

  function setupChips() {
    const holder = document.getElementById("portfolio-chips");
    if (!holder) return;
    holder.innerHTML = CATEGORIES.map(function (c) {
      return '<button type="button" class="chip" data-cat="' + c.key + '">' + esc(c.label) + '</button>';
    }).join("");
    holder.addEventListener("click", function (e) {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      // Changing the hash fires "hashchange", which re-renders (and keeps the URL shareable)
      location.hash = chip.getAttribute("data-cat");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupChips();
    render();
  });
  window.addEventListener("hashchange", render);
})();
