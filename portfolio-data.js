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
  }
] /* ITEMS-END */;
