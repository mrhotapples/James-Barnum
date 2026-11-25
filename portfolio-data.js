/* ==========================================================
   portfolio-data.js — the list of portfolio pieces.
   You normally don't edit this by hand: "portfolio-gen.html"
   rewrites the JSON between the ITEMS-START / ITEMS-END markers.
   (Keep it valid JSON: double quotes, no trailing commas.)

   Fields
     title, category ("video" | "design" | "writing" | "music"),
     date (YYYY-MM-DD), description,
     media  - video: YouTube/Vimeo link OR a file path like "videos/demo.mp4"
              design: image path   |  music: audio file path
              writing: (unused)
     thumb  - optional preview image (used for writing + music + video files)
     link   - optional "view more" link (writing: the article/PDF)
   ========================================================== */
const portfolioItems = /* ITEMS-START */ [
  {
    "title": "Banjo v Guitar (short)",
    "category": "video",
    "date": "2026-11-24",
    "description": "Banjo v Guitar",
    "media": "https://www.youtube.com/shorts/WIMY0_ymcyY"
  },
  {
    "title": "Controlled Flopposition",
    "category": "music",
    "date": "2025-11-20",
    "description": "A song about putting your shoes on, duh.",
    "media": "audio/controlled-flopposition-rc3.wav",
    "thumb": "images/portfolio/dp-yt-banner.png"
  },
  {
    "title": "Seasons of Me (editor)",
    "category": "writing",
    "date": "2025-07-25",
    "description": "by Joyce Wambua Osborne. A story of immigration, motherhood, loss, and renewal.",
    "thumb": "images/portfolio/seasons-of-me-cover.avif",
    "link": "https://www.amazon.com/dp/B0FGY28Q9S?plpRedirect=mhFallback&ref=clp_hp_h_pc"
  },
  {
    "title": "Bepis Shirt",
    "category": "design",
    "date": "2025-03-03",
    "description": "Drink Ice Cold Bepis",
    "media": "images/portfolio/bepis-shirt.png",
    "thumb": "images/portfolio/bepis-shirt.png",
    "link": "https://www.patreon.com/DANGERPIN/posts/t-shirt-ice-cold-152159214"
  },
  {
    "title": "History of The Dodge Caravan (editor)",
    "category": "video",
    "date": "2025-02-25",
    "description": "Collab with Team HESH https://www.youtube.com/@teamhesh",
    "media": "https://www.youtube.com/watch?v=kBdwkl46kGg"
  }
] /* ITEMS-END */;
