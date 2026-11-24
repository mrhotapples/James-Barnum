/* ==========================================================
   site.js — shared header (hamburger menu) + footer.
   Edit the SITE and MENU objects below and every page updates.
   Pages include it with:  <script src="site.js" data-root=""></script>
   (pages inside /articles/ use data-root="../")
   ========================================================== */
(function () {
  "use strict";

  // ---------- EDIT ME ----------
  const SITE = {
    name: "James Barnum",       // shown in the footer + logo alt text
    logo: "images/logo-wordmark.png", // leave "" for a plain-text name
    patreon: "https://www.patreon.com/dangerpin",
    tagline: "Marketing &bull; Music &bull; Writing &bull; Design",
    year: new Date().getFullYear()
  };

  // `href` is relative to the site root. Items with `children` become dropdowns.
  const MENU = [
    { label: "Home", href: "index.html" },
    { label: "Blog", href: "blog.html" },
    {
      label: "Services",
      children: [
        { label: "Video Editing", href: "video_editing.html" },
        { label: "Marketing", href: "marketing.html" },
        { label: "Consulting", href: "consulting.html" }
      ]
    },
    { label: "Portfolio", href: "portfolio.html" },
    { label: "About", href: "about.html" }
  ];
  // -----------------------------

  const script = document.currentScript;
  const ROOT = (script && script.getAttribute("data-root")) || "";
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function isCurrent(href) {
    const file = href.split("#")[0].toLowerCase();
    return file === here;
  }

  function buildMenu() {
    return MENU.map(function (item, i) {
      if (item.children) {
        const open = item.children.some(function (c) { return isCurrent(c.href); });
        const subId = "submenu-" + i;
        return (
          '<li>' +
            '<button type="button" class="sub-toggle" aria-expanded="' + open + '" aria-controls="' + subId + '">' +
              esc(item.label) + ' <span class="chev" aria-hidden="true">&#9660;</span>' +
            '</button>' +
            '<ul class="submenu' + (open ? " open" : "") + '" id="' + subId + '">' +
              item.children.map(function (c) {
                return '<li><a href="' + ROOT + c.href + '"' + (isCurrent(c.href) ? ' class="active"' : "") + '>' + esc(c.label) + '</a></li>';
              }).join("") +
            '</ul>' +
          '</li>'
        );
      }
      return '<li><a href="' + ROOT + item.href + '"' + (isCurrent(item.href) ? ' class="active"' : "") + '>' + esc(item.label) + '</a></li>';
    }).join("");
  }

  function buildHeader() {
    const target = document.getElementById("site-header");
    if (!target) return;
    target.className = "site-header";
    const brandInner = SITE.logo
      ? '<img src="' + ROOT + esc(SITE.logo) + '" alt="' + esc(SITE.name) + '" ' +
        'onerror="this.replaceWith(document.createTextNode(\'' + esc(SITE.name) + '\'))">'
      : esc(SITE.name);
    target.innerHTML =
      '<div class="header-bar">' +
        '<a class="brand" href="' + ROOT + 'index.html">' + brandInner + '</a>' +
        '<button type="button" class="menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</div>' +
      '<nav class="site-nav" id="site-nav" aria-label="Main"><ul>' + buildMenu() + '</ul></nav>';

    const toggle = target.querySelector(".menu-toggle");
    const nav = target.querySelector(".site-nav");

    function setOpen(open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("open"));
    });

    nav.querySelectorAll(".sub-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const sub = document.getElementById(btn.getAttribute("aria-controls"));
        const open = !sub.classList.contains("open");
        sub.classList.toggle("open", open);
        btn.setAttribute("aria-expanded", String(open));
      });
    });

    // Close after choosing a link (same-page hash links like portfolio.html#design need this)
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!target.contains(e.target)) setOpen(false);
    });
  }

  function buildFooter() {
    const target = document.getElementById("site-footer");
    if (!target) return;
    target.className = "site-footer";
    target.innerHTML =
      '<p class="tagline">' + SITE.tagline + "</p>" +
      (SITE.patreon ? '<p><a href="' + esc(SITE.patreon) + '" target="_blank" rel="noopener">Support on Patreon</a></p>' : "") +
      "<p>&copy; " + SITE.year + " " + esc(SITE.name) + ". All rights reserved.</p>";
  }

  function init() {
    buildHeader();
    buildFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
