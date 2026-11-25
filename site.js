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
    { label: "The One-Hour Hero", href: "prompt_generator.html", icon: "sparkles", badge: "Free" },
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

  // Small inline icons. Use one by adding  icon: "sparkles"  to a MENU item.
  const ICONS = {
    sparkles:
      '<svg class="nav-icon twinkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/>' +
      '<path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></svg>'
  };
  // -----------------------------

  const script = document.currentScript;
  const ROOT = (script && script.getAttribute("data-root")) || "";
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function norm(name) {
    return String(name).toLowerCase().replace(/\.html$/, "");
  }

  function isCurrent(href) {
    return norm(href.split("#")[0]) === norm(here);
  }

  function linkHtml(item) {
    const classes = [];
    if (isCurrent(item.href)) classes.push("active");
    if (item.badge) classes.push("is-feature");
    const icon = item.icon && ICONS[item.icon] ? ICONS[item.icon] : "";
    const inner = (icon || item.badge)
      ? '<span class="nav-main">' + icon + '<span>' + esc(item.label) + '</span></span>' +
        (item.badge ? '<span class="nav-badge">' + esc(item.badge) + '</span>' : "")
      : esc(item.label);
    return '<a href="' + ROOT + item.href + '"' + (classes.length ? ' class="' + classes.join(" ") + '"' : "") + '>' + inner + '</a>';
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
              item.children.map(function (c) { return '<li>' + linkHtml(c) + '</li>'; }).join("") +
            '</ul>' +
          '</li>'
        );
      }
      return '<li>' + linkHtml(item) + '</li>';
    }).join("");
  }

  // Styles for menu icons and badges (kept here so style.css doesn't need to change)
  function injectNavStyles() {
    const style = document.createElement("style");
    style.textContent =
      ".site-nav .nav-main{display:flex;align-items:center;gap:.55rem}" +
      ".site-nav .nav-icon{width:20px;height:20px;flex:0 0 20px;color:var(--accent,#ff3366)}" +
      ".site-nav a.is-feature{background:linear-gradient(90deg,rgba(255,51,102,.10),rgba(255,200,87,.24))}" +
      ".site-nav a.is-feature:hover{background:linear-gradient(90deg,rgba(255,51,102,.18),rgba(255,200,87,.36))}" +
      ".site-nav .nav-badge{font-size:.68rem;font-weight:600;letter-spacing:1px;text-transform:uppercase;" +
        "padding:.15rem .6rem;border-radius:999px;color:var(--ink,#0e0a0c);" +
        "background:var(--sun,linear-gradient(135deg,#ff3366 0%,#ff7a45 60%,#ffc857 100%))}" +
      "@keyframes navTwinkle{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.18) rotate(14deg)}}" +
      "@media (prefers-reduced-motion:no-preference){.site-nav .nav-icon.twinkle{animation:navTwinkle 3.2s ease-in-out infinite}}";
    document.head.appendChild(style);
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

    initAutoHide(target, nav);
  }

  // Hide the header on scroll down (past a threshold), bring it back on scroll up.
  // Hiding is quick; re-appearing takes 3x as long.
  function initAutoHide(header, nav) {
    const HIDE_AFTER = 120;      // px scrolled before the header is allowed to hide
    const HIDE_MS = 300;         // time to slide away
    const SHOW_MS = HIDE_MS * 3; // time to slide back (3x)
    const HIDE_TRAVEL = 40;      // px of steady downward scrolling before it hides
    const SHOW_TRAVEL = 24;      // px of steady upward scrolling before it returns

    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const style = document.createElement("style");
    style.textContent =
      ".site-header{transition-property:transform,visibility;transition-timing-function:ease;will-change:transform;transform:translate3d(0,0,0)}" +
      ".site-header.is-hidden{transform:translate3d(0,calc(-100% - 6px),0);visibility:hidden}" +
      "html{overflow-anchor:none;scroll-behavior:auto}";
    document.head.appendChild(style);

    // If the header isn't already fixed/sticky, make it sticky so it can slide away.
    const pos = getComputedStyle(header).position;
    if (pos === "static" || pos === "relative") {
      header.style.position = "sticky";
      header.style.top = "0";
      header.style.zIndex = "1000";
    }

    let lastY = window.pageYOffset || 0;
    let ticking = false;

    function setHidden(hide) {
      if (header.classList.contains("is-hidden") === hide) return;
      header.style.transitionDuration = reduced ? "0ms" : (hide ? HIDE_MS : SHOW_MS) + "ms";
      header.classList.toggle("is-hidden", hide);
    }

    let travel = 0; // accumulated scroll distance in the current direction

    function update() {
      ticking = false;
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const y = Math.min(Math.max(0, window.pageYOffset || 0), maxY); // ignore iOS rubber-banding
      const delta = y - lastY;
      lastY = y;
      if (delta === 0) return;

      // Reset the tally whenever direction flips, so small wobbles never toggle anything.
      if ((delta > 0) !== (travel > 0)) travel = 0;
      travel += delta;

      if (y <= HIDE_AFTER) {
        setHidden(false);
        travel = 0;
      } else if (travel >= HIDE_TRAVEL && !nav.classList.contains("open")) {
        setHidden(true);
      } else if (travel <= -SHOW_TRAVEL) {
        setHidden(false);
      }
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    // Keyboard users tabbing into the header should always see it.
    header.addEventListener("focusin", function () { setHidden(false); });
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
    injectNavStyles();
    buildHeader();
    buildFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();