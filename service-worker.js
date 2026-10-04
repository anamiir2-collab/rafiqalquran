/* ============================================================
   رفيق القرآن للأطفال — service-worker.js
   Cache-First للأصول الأساسية + Runtime Cache للصوت والخطوط
   ============================================================ */
"use strict";

const VERSION = "v1.1.8";
const CORE_CACHE = `rafiq-core-${VERSION}`;
const AUDIO_CACHE = `rafiq-audio-${VERSION}`;
const MAX_AUDIO_ENTRIES = 300;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/fonts.css",
  "./css/style.css",
  "./css/child.css",
  "./css/parent.css",
  "./css/responsive.css",
  "./js/storage.js",
  "./js/navigation.js",
  "./js/quran.js",
  "./js/range.js",
  "./js/audio.js",
  "./js/rewards.js",
  "./js/challenges.js",
  "./js/revision.js",
  "./js/memorization.js",
  "./js/stories.js",
  "./js/morals.js",
  "./js/parent.js",
  "./js/pwa.js",
  "./js/app.js",
  "./data/quran.json",
  "./data/stories.json",
  "./data/stories/index.json",
  "./data/stories/story-01.json",
  "./data/stories/story-02.json",
  "./data/stories/story-03.json",
  "./data/stories/story-04.json",
  "./data/morals.json",
  "./data/challenges.json",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/favicon-32.png",
  "./assets/fonts/tajawal-400-arabic.woff2",
  "./assets/fonts/tajawal-400-latin.woff2",
  "./assets/fonts/tajawal-500-arabic.woff2",
  "./assets/fonts/tajawal-500-latin.woff2",
  "./assets/fonts/tajawal-700-arabic.woff2",
  "./assets/fonts/tajawal-700-latin.woff2",
  "./assets/fonts/tajawal-800-arabic.woff2",
  "./assets/fonts/tajawal-800-latin.woff2",
  "./assets/fonts/amiri-400-arabic.woff2",
  "./assets/fonts/amiri-700-arabic.woff2",
  "./assets/fonts/amiri-quran-400-arabic.woff2",
  "./assets/fonts/amiri-quran-400-latin.woff2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CORE_CACHE);
      await Promise.allSettled(
        CORE_ASSETS.map((url) => cache.add(new Request(url, { cache: "reload" })))
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n.startsWith("rafiq-") && !n.endsWith(VERSION))
          .map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  if (url.hostname.endsWith("everyayah.com") && url.pathname.endsWith(".mp3")) {
    event.respondWith(cacheFirst(req, AUDIO_CACHE, { trim: MAX_AUDIO_ENTRIES }));
    return;
  }

  if (url.origin === location.origin) {
    if (req.mode === "navigate") {
      event.respondWith(navigateHandler(req));
      return;
    }
    event.respondWith(cacheFirst(req, CORE_CACHE));
  }
});

async function navigateHandler(req) {
  try {
    const fresh = await fetch(req);
    const cache = await caches.open(CORE_CACHE);
    cache.put("./index.html", fresh.clone());
    return fresh;
  } catch (e) {
    const cache = await caches.open(CORE_CACHE);
    return (
      (await cache.match(req)) ||
      (await cache.match("./index.html")) ||
      (await cache.match("./")) ||
      new Response("<!DOCTYPE html><html lang='ar' dir='rtl'><body style='font-family:sans-serif;text-align:center;padding:40px'><h1>رفيق القرآن</h1><p>لا يوجد اتصال — افتح التطبيق لاحقًا</p></body></html>", { headers: { "Content-Type": "text/html; charset=utf-8" } })
    );
  }
}

async function cacheFirst(req, cacheName, opts = {}) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req, { ignoreVary: true });
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && (fresh.ok || fresh.type === "opaque")) {
      cache.put(req, fresh.clone());
      if (opts.trim) trimCache(cacheName, opts.trim);
    }
    return fresh;
  } catch (e) {
    if (req.destination === "audio") {
      return new Response(new Blob([]), { status: 504, statusText: "Audio offline" });
    }
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

async function trimCache(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > max) {
    await cache.delete(keys[0]);
  }
}
