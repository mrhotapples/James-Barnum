/* ==========================================================
   gen-common.js — helpers shared by article-gen.html and portfolio-gen.html

   Two ways to save:
   1) FOLDER MODE (Chrome / Edge): pick your site folder once. The tool reads
      and rewrites the data file and writes new pages/images straight into it.
   2) DOWNLOAD MODE (any browser): the tool downloads the new files and you
      drop them into the site folder yourself.
   ========================================================== */
const Gen = (function () {
  "use strict";

  const START = "/* ITEMS-START */";
  const END = "/* ITEMS-END */";
  const supportsFolders = typeof window.showDirectoryPicker === "function";

  // ---------- remember the chosen folder between visits ----------
  function idb() {
    return new Promise(function (resolve, reject) {
      const req = indexedDB.open("site-gen", 1);
      req.onupgradeneeded = function () { req.result.createObjectStore("kv"); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function kvGet(key) {
    return idb().then(function (db) {
      return new Promise(function (resolve) {
        const r = db.transaction("kv").objectStore("kv").get(key);
        r.onsuccess = function () { resolve(r.result); };
        r.onerror = function () { resolve(undefined); };
      });
    }).catch(function () { return undefined; });
  }
  function kvSet(key, val) {
    return idb().then(function (db) {
      return new Promise(function (resolve) {
        const tx = db.transaction("kv", "readwrite");
        tx.objectStore("kv").put(val, key);
        tx.oncomplete = resolve;
        tx.onerror = resolve;
      });
    }).catch(function () {});
  }

  async function pickFolder() {
    const handle = await window.showDirectoryPicker({ mode: "readwrite" });
    await kvSet("root", handle);
    return handle;
  }

  // Returns a previously chosen folder if permission is still granted (or can be re-granted by a click)
  async function savedFolder(askPermission) {
    if (!supportsFolders) return null;
    const handle = await kvGet("root");
    if (!handle) return null;
    let perm = await handle.queryPermission({ mode: "readwrite" });
    if (perm !== "granted" && askPermission) perm = await handle.requestPermission({ mode: "readwrite" });
    return perm === "granted" ? handle : null;
  }

  // ---------- file helpers (paths like "articles/my-post.html") ----------
  async function dirFor(root, path, create) {
    const parts = path.split("/").filter(Boolean);
    const file = parts.pop();
    let dir = root;
    for (let i = 0; i < parts.length; i++) {
      dir = await dir.getDirectoryHandle(parts[i], { create: create });
    }
    return { dir: dir, file: file };
  }
  async function readText(root, path) {
    const t = await dirFor(root, path, false);
    const fh = await t.dir.getFileHandle(t.file);
    return (await fh.getFile()).text();
  }
  async function writeFile(root, path, data) {
    const t = await dirFor(root, path, true);
    const fh = await t.dir.getFileHandle(t.file, { create: true });
    const w = await fh.createWritable();
    await w.write(data);
    await w.close();
  }
  async function exists(root, path) {
    try { const t = await dirFor(root, path, false); await t.dir.getFileHandle(t.file); return true; }
    catch (e) { return false; }
  }

  // ---------- data file (JSON between markers) ----------
  function parseItems(text) {
    const a = text.indexOf(START);
    const b = text.indexOf(END);
    if (a === -1 || b === -1 || b < a) throw new Error("Couldn't find the ITEMS-START / ITEMS-END markers in the data file.");
    return JSON.parse(text.slice(a + START.length, b));
  }
  function writeItems(text, items) {
    const a = text.indexOf(START);
    const b = text.indexOf(END);
    if (a === -1 || b === -1) throw new Error("Couldn't find the ITEMS-START / ITEMS-END markers in the data file.");
    return text.slice(0, a + START.length) + " " + JSON.stringify(items, null, 2) + " " + text.slice(b);
  }

  // ---------- download fallback ----------
  function download(filename, data, type) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: type || "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  // ---------- misc ----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function slugify(s) {
    return String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  }
  function safeName(name) {
    const dot = name.lastIndexOf(".");
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot).toLowerCase() : "";
    return (slugify(base) || "file") + ext;
  }
  function today() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function status(el, kind, html) {
    el.className = "status show " + kind;
    el.innerHTML = html;
  }

  return {
    supportsFolders: supportsFolders,
    pickFolder: pickFolder, savedFolder: savedFolder,
    readText: readText, writeFile: writeFile, exists: exists,
    parseItems: parseItems, writeItems: writeItems,
    download: download, esc: esc, slugify: slugify, safeName: safeName, today: today, status: status
  };
})();
