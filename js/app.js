/* ============================================================
   رفيق القرآن للأطفال — app.js
   الأيقونات SVG + الأدوات المساعدة + الشاشات + التهيئة
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  /* ================= الأيقونات (SVG stroke احترافية — بدون إيموجي) ================= */
  const I = (p, fill) => `<svg viewBox="0 0 24 24" fill="${fill || "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

  App.icons = {
    home: I('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.7V21h5v-6h4v6h5V9.7"/>'),
    book: I('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
    refresh: I('<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>'),
    trophy: I('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>'),
    grid: I('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    play: I('<polygon points="6 3 20 12 6 21 6 3"/>', "currentColor"),
    pause: I('<rect x="5" y="4" width="5" height="16" rx="1.2"/><rect x="14" y="4" width="5" height="16" rx="1.2"/>', "currentColor"),
    replay: I('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>'),
    next: I('<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>'),
    prev: I('<polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>'),
    mic: I('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>'),
    stop: I('<rect x="6" y="6" width="12" height="12" rx="2"/>', "currentColor"),
    check: I('<polyline points="20 6 9 17 4 12"/>'),
    x: I('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
    star: I('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
    medal: I('<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>'),
    crown: I('<path d="M2 18h20"/><path d="m3 18 1.6-9.5L9.5 12 12 5l2.5 7 4.9-3.5L21 18"/>'),
    flame: I('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'),
    brain: I('<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>'),
    leaf: I('<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>'),
    bookOpen: I('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'),
    puzzle: I('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
    pen: I('<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>'),
    grip: I('<circle cx="9" cy="5" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="9" cy="19" r="1.4"/><circle cx="15" cy="5" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="15" cy="19" r="1.4"/>', "currentColor"),
    list: I('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'),
    headphones: I('<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>'),
    loop: I('<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>'),
    settings: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
    chevronLeft: I('<polyline points="15 18 9 12 15 6"/>'),
    chevronRight: I('<polyline points="9 18 15 12 9 6"/>'),
    rocket: I('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>'),
    sparkle: I('<path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3Z"/>'),
    bookmark: I('<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>'),
    wifiOff: I('<line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>'),
    alert: I('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'),
    lock: I('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
    clock: I('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
    chart: I('<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>'),
    certificate: I('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="15" r="2.5"/><path d="m12 17.5-.7 2.5"/>'),
    download: I('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
    upload: I('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'),
    trash: I('<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
    circle: I('<circle cx="12" cy="12" r="9"/>'),
    user: I('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    loader: I('<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>'),
    heart: I('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'),
    share: I('<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>'),
    calendar: I('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
    /* أيقونات جديدة للوضع الليلي والنطاق */
    sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>'),
    moon: I('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),
    target: I('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor"/>'),
    range: I('<path d="M3 12h18"/><path d="M3 6h18M3 18h18" stroke-dasharray="3 3"/><circle cx="3" cy="12" r="2.5" fill="currentColor"/><circle cx="21" cy="12" r="2.5" fill="currentColor"/>'),
    playAuto: I('<polygon points="6 3 20 12 6 21 6 3" fill="currentColor"/><path d="M2 8v8"/><path d="M22 4l-3 3M22 4l-3-3" transform="translate(-2 8)"/>'),
    playScope: I('<polygon points="7 4 17 12 7 20 7 4" fill="currentColor"/><path d="M3 7v10" stroke-dasharray="2 2"/><path d="M21 7v10" stroke-dasharray="2 2"/>'),
    stopAuto: I('<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/><path d="M2 8v8"/>'),
    /* أيقونات يوميات الانتظام */
    journal: I('<path d="M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M8 6h8M8 10h8M8 14h5"/><path d="M16 18l2 2 4-4" stroke="#1B7F5A"/>'),
    flameBig: I('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'),
    pen: I('<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>'),
    chevronUp: I('<polyline points="18 15 12 9 6 15"/>'),
    chevronDown: I('<polyline points="6 9 12 15 18 9"/>')
  };

  /* الأحرف/الشخصيات */
  App.AVATARS = {
    falcon: { name: "الصقر", bg: "#0C7A5C", svg: '<circle cx="50" cy="52" r="34" fill="#F5C063"/><path d="M38 46c0-9 5-14 12-14s12 5 12 14c0 10-5 18-12 18s-12-8-12-18z" fill="#FFF6E2"/><circle cx="44" cy="46" r="3.2" fill="#22312C"/><circle cx="56" cy="46" r="3.2" fill="#22312C"/><path d="M47 52h6l-3 5z" fill="#E8931C"/><path d="M36 40l6-6M64 40l-6-6" stroke="#C9881B" stroke-width="3" stroke-linecap="round"/>' },
    cat: { name: "القطّ", bg: "#2FB5A3", svg: '<path d="M28 34l6-14 10 8M72 34l-6-14-10 8" fill="#F2E7D2"/><circle cx="50" cy="55" r="30" fill="#F2E7D2"/><circle cx="41" cy="50" r="3.5" fill="#22312C"/><circle cx="59" cy="50" r="3.5" fill="#22312C"/><path d="M46 62c2 2 6 2 8 0" stroke="#22312C" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M30 58h8M30 63h8M62 58h8M62 63h8" stroke="#C9B99A" stroke-width="2" stroke-linecap="round"/>' },
    rabbit: { name: "الأرنب", bg: "#6FA8C9", svg: '<ellipse cx="40" cy="22" rx="7" ry="16" fill="#FFFFFF"/><ellipse cx="60" cy="22" rx="7" ry="16" fill="#FFFFFF"/><ellipse cx="40" cy="24" rx="3.4" ry="10" fill="#F5C0C0"/><ellipse cx="60" cy="24" rx="3.4" ry="10" fill="#F5C0C0"/><circle cx="50" cy="60" r="26" fill="#FFFFFF"/><circle cx="42" cy="55" r="3" fill="#22312C"/><circle cx="58" cy="55" r="3" fill="#22312C"/><circle cx="50" cy="63" r="3.4" fill="#E8939C"/><path d="M45 69c2 2 8 2 10 0" stroke="#22312C" stroke-width="2.2" fill="none" stroke-linecap="round"/>' },
    star: { name: "النجم", bg: "#E8A93E", svg: '<path d="M50 16l9.6 20 21.4 3-15.6 15 3.8 21.4L50 65.4 30.8 75.4l3.8-21.4L19 39l21.4-3z" fill="#FFF6E2"/><circle cx="43" cy="46" r="3" fill="#22312C"/><circle cx="57" cy="46" r="3" fill="#22312C"/><path d="M44 55c3 3 9 3 12 0" stroke="#22312C" stroke-width="2.4" fill="none" stroke-linecap="round"/>' },
    panda: { name: "الباندا", bg: "#9B8CCB", svg: '<circle cx="32" cy="30" r="11" fill="#22312C"/><circle cx="68" cy="30" r="11" fill="#22312C"/><circle cx="50" cy="56" r="30" fill="#FFFFFF"/><ellipse cx="38" cy="50" rx="8" ry="9" fill="#22312C"/><ellipse cx="62" cy="50" rx="8" ry="9" fill="#22312C"/><circle cx="39" cy="51" r="2.8" fill="#FFF"/><circle cx="61" cy="51" r="2.8" fill="#FFF"/><ellipse cx="50" cy="63" rx="4" ry="3" fill="#22312C"/><path d="M44 69c3 2.5 9 2.5 12 0" stroke="#22312C" stroke-width="2.2" fill="none" stroke-linecap="round"/>' },
    fox: { name: "الثعلب", bg: "#D96A5B", svg: '<path d="M26 34l6-16 12 10M74 34l-6-16-12 10" fill="#E89363"/><circle cx="50" cy="56" r="28" fill="#E89363"/><path d="M50 70c-8 0-13-5-13-9h26c0 4-5 9-13 9z" fill="#FFF6E2"/><circle cx="41" cy="50" r="3.2" fill="#22312C"/><circle cx="59" cy="50" r="3.2" fill="#22312C"/><circle cx="50" cy="62" r="3.4" fill="#22312C"/>' }
  };

  App.avatarSvg = function (id, size) {
    const a = App.AVATARS[id] || App.AVATARS.falcon;
    return `<svg viewBox="0 0 100 100" width="${size || 40}" height="${size || 40}" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="${a.bg}"/>${a.svg}</svg>`;
  };

  /* ================= أدوات مساعدة ================= */
  App.arDigits = (n) => String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
  App.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  App.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  App.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  App.sample = (arr, n) => App.shuffle(arr).slice(0, n);
  App.haptic = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms || 20); } catch (e) {} };

  App.fillIcons = (root) => {
    (root || document).querySelectorAll("[data-ico]").forEach(el => {
      const name = el.dataset.ico;
      if (App.icons[name]) el.innerHTML = App.icons[name];
    });
  };

  App.ringSvg = function (size, stroke, pct, colorClass) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const off = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle class="ring-bg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/>
      <circle class="ring-val ${colorClass || ""}" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"
        stroke-dasharray="${c}" stroke-dashoffset="${off}"/>
    </svg>`;
  };

  App.emptyHtml = (msg, sub) => `
    <div class="empty-state">
      <span class="ico" data-ico="sparkle"></span>
      <p>${msg}</p>
      ${sub ? `<span>${sub}</span>` : ""}
    </div>`;

  App.loadingHtml = () => `
    <div class="empty-state">
      <span class="ico" data-ico="loader" style="animation:spin 1.2s linear infinite;display:inline-block"></span>
      <p>جارٍ التحميل…</p>
    </div>`;

  /* ---------- Toast ---------- */
  App.toast = function (msg, type) {
    const host = document.getElementById("toastHost");
    if (!host) return;
    const t = document.createElement("div");
    t.className = "toast " + (type || "");
    t.textContent = msg;
    host.appendChild(t);
    setTimeout(() => {
      t.classList.add("out");
      setTimeout(() => t.remove(), 350);
    }, 2600);
  };

  /* ---------- Modal ---------- */
  App.modal = function ({ title, body, actions, closable = true }) {
    const bd = document.getElementById("modalBackdrop");
    const card = document.getElementById("modalCard");
    if (!bd || !card) return;
    card.innerHTML = `
      ${title ? `<div class="modal-head"><h3>${title}</h3>${closable ? '<button class="icon-btn" data-action="close-modal" aria-label="إغلاق"><span class="ico" data-ico="x"></span></button>' : ""}</div>` : ""}
      <div class="modal-body">${body}</div>
      ${actions && actions.length ? `<div class="modal-actions">${actions.map(a => `<button class="btn ${a.primary ? "btn-primary" : "btn-ghost"}" data-action="${a.action}" data-modal-arg="${a.arg || ""}">${a.label}</button>`).join("")}</div>` : ""}`;
    bd.classList.remove("hidden");
    if (App.fillIcons) App.fillIcons(card);
    bd.onclick = (e) => { if (e.target === bd && closable) App.closeModal(); };
  };
  App.closeModal = function () {
    document.getElementById("modalBackdrop").classList.add("hidden");
  };
  App.confirm = function (msg, onOk) {
    App._confirmCb = onOk;
    App.modal({
      title: "تأكيد",
      body: `<p>${msg}</p>`,
      actions: [
        { label: "إلغاء", action: "close-modal" },
        { label: "تأكيد", action: "confirm-ok", primary: true }
      ]
    });
  };

  App.actions["close-modal"] = () => App.closeModal();
  App.actions["confirm-ok"] = () => {
    App.closeModal();
    if (App._confirmCb) { const cb = App._confirmCb; App._confirmCb = null; cb(); }
  };

  /* ---------- Confetti ---------- */
  App.confetti = function (duration) {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;
    canvas.classList.remove("hidden");
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const colors = ["#E8A93E", "#F5C063", "#0C7A5C", "#2FB5A3", "#6FA8C9", "#D96A5B"];
    const pieces = [];
    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * .4,
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 10,
        vy: 2 + Math.random() * 3.2,
        vx: -1.4 + Math.random() * 2.8,
        rot: Math.random() * Math.PI,
        vr: -.12 + Math.random() * .24,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    const start = Date.now();
    const dur = duration || 2600;
    (function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.y += p.vy; p.x += p.vx; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (Date.now() - start < dur) requestAnimationFrame(frame);
      else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.classList.add("hidden"); }
    })();
  };

  /* ================= أيقونات CSS إضافية ================= */
  const style = document.createElement("style");
  style.textContent = `
    .floating-player{position:fixed;bottom:calc(var(--nav-h) + var(--sab) + 12px);left:50%;transform:translateX(-50%);width:min(94%,460px);background:rgba(255,255,255,.98);backdrop-filter:blur(12px);border:1px solid var(--c-line);border-radius:18px;box-shadow:var(--shadow-lg);display:flex;align-items:center;gap:8px;padding:10px 12px;z-index:70;animation:screenIn var(--motion-base) var(--ease) both}
    [data-theme="dark"] .floating-player{background:rgba(30,41,59,.97);border-color:var(--c-line)}
    @media (prefers-color-scheme: dark){
      :root:not([data-theme="light"]) .floating-player{background:rgba(30,41,59,.97);border-color:var(--c-line)}
    }
    .floating-player .play-btn{width:48px;height:48px}
    .floating-player .play-btn .ico{width:20px;height:20px}
    .fp-info{flex:1;min-width:0}
    .fp-title{font-size:.82rem;font-weight:800;color:var(--c-primary-deep);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:5px}
    .fp-btn,.fp-close{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--c-primary-dark);background:var(--c-primary-soft);transition:transform var(--motion-fast) var(--ease)}
    .fp-btn:active,.fp-close:active{transform:scale(.92)}
    .fp-btn:focus-visible,.fp-close:focus-visible{outline:3px solid var(--c-gold);outline-offset:2px}
    .fp-btn .ico,.fp-close .ico{width:18px;height:18px}
    .fp-close{background:var(--c-danger-light);color:var(--c-danger)}
    .blank-slot{display:inline-flex;min-width:56px;height:1.15em;border-bottom:3px dotted var(--c-gold-deep);color:var(--c-gold-deep);align-items:center;justify-content:center}
    .order-item{display:flex;align-items:center;gap:8px;padding:10px;border:1.5px solid var(--c-line);border-radius:14px;margin-bottom:8px;background:var(--c-white);cursor:pointer;transition:all var(--motion-base)}
    .order-item .order-handle{display:flex;gap:4px;flex:0 0 auto}
    .order-item .order-text{font-family:var(--font-quran);font-size:1.15rem;flex:1}
    .up-btn,.down-btn{font-size:.78rem;min-width:36px;min-height:36px;padding:6px 8px;border-radius:8px;background:var(--c-primary-soft);color:var(--c-primary-dark);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
    .up-btn:focus-visible,.down-btn:focus-visible{outline:3px solid var(--c-gold);outline-offset:2px}
    @keyframes spin{to{transform:rotate(360deg)}}
    .star-ico.lit svg,.mastery-stars .lit svg{fill:currentColor}
    .cele-stars .ico.lit svg{fill:currentColor}
    .spin{animation:spin 1.2s linear infinite}
    /* شريط النطاق */
    .range-bar{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--c-primary-soft);border:1px solid var(--c-primary-light);border-radius:var(--r-md);margin-top:10px}
    .range-bar .rb-ico{width:34px;height:34px;border-radius:10px;background:var(--grad-primary);color:#fff;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
    .range-bar .rb-ico .ico{width:18px;height:18px}
    .range-bar .rb-info{flex:1;min-width:0}
    .range-bar .rb-title{font-size:.78rem;font-weight:800;color:var(--c-primary-deep);line-height:1.2}
    .range-bar .rb-sub{font-size:.7rem;color:var(--c-text-soft);margin-top:2px}
    .range-bar .rb-btn{min-height:44px;padding:6px 14px;border-radius:10px;background:var(--c-white);border:1px solid var(--c-primary);color:var(--c-primary-dark);font-size:.76rem;font-weight:700;display:inline-flex;align-items:center;gap:5px;transition:all var(--motion-base)}
    .range-bar .rb-btn:active{transform:scale(.95)}
    .range-bar .rb-btn:focus-visible{outline:3px solid var(--c-gold);outline-offset:2px}
    /* ===== يوميات الانتظام ===== */
    .streak-hero{position:relative;background:linear-gradient(160deg,#1F3A30 0%,#163025 40%,#0F2519 100%);border-radius:var(--r-xl);padding:24px 18px;color:#fff;overflow:hidden;box-shadow:var(--shadow-md);text-align:center}
    .streak-hero::before{content:"";position:absolute;inset:0;background-image:var(--pattern-star);background-size:72px 72px;opacity:.5;pointer-events:none}
    .streak-hero > *{position:relative;z-index:1}
    .streak-flame{width:64px;height:64px;margin:0 auto 8px;color:var(--c-gold);display:flex;align-items:center;justify-content:center;animation:flamePulse 2.4s var(--ease) infinite}
    .streak-flame .ico{width:48px;height:48px}
    @keyframes flamePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
    .streak-count{font-size:2.6rem;font-weight:800;color:#fff;line-height:1.1;margin-bottom:4px}
    .streak-label{font-size:.95rem;color:rgba(255,255,255,.85);font-weight:700}
    .streak-encourage{font-size:.82rem;color:var(--c-gold-light);margin-top:10px;line-height:1.5}
    .streak-progress{margin-top:14px;display:flex;gap:5px;justify-content:center}
    .streak-dot{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.18)}
    .streak-dot.lit{background:var(--c-gold);box-shadow:0 0 8px rgba(230,181,80,.6)}
    .streak-dot.today{background:#fff;box-shadow:0 0 10px rgba(255,255,255,.7);animation:flamePulse 1.6s ease infinite}
    /* التقويم */
    .calendar-card{padding:14px}
    .cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
    .cal-month{font-size:1rem;font-weight:800;color:var(--c-primary-deep)}
    .cal-nav{display:flex;gap:6px}
    .cal-nav-btn{width:38px;height:38px;border-radius:10px;background:var(--c-primary-soft);color:var(--c-primary-dark);display:inline-flex;align-items:center;justify-content:center;transition:transform var(--motion-fast) var(--ease)}
    .cal-nav-btn:active{transform:scale(.9)}
    .cal-nav-btn:focus-visible{outline:3px solid var(--c-gold);outline-offset:2px}
    .cal-nav-btn:disabled{opacity:.35;pointer-events:none}
    .cal-nav-btn .ico{width:18px;height:18px}
    .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
    .cal-day-name{text-align:center;font-size:.66rem;font-weight:700;color:var(--c-text-faint);padding:4px 0}
    .cal-cell{aspect-ratio:1;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:.76rem;font-weight:700;color:var(--c-text-soft);background:var(--c-primary-soft);position:relative;transition:all var(--motion-base);min-height:38px}
    .cal-cell.empty{background:transparent}
    .cal-cell.future{opacity:.4}
    .cal-cell.active{background:var(--grad-primary);color:#fff;box-shadow:0 3px 8px rgba(27,127,90,.3)}
    .cal-cell.today{outline:2.5px solid var(--c-gold);outline-offset:-1px}
    .cal-cell.active.today{outline:2.5px solid var(--c-gold)}
    .cal-cell.has-note::after{content:"";position:absolute;top:4px;left:4px;width:6px;height:6px;border-radius:50%;background:var(--c-gold)}
    .cal-cell.active.has-note::after{background:#fff}
    /* إحصائيات */
    .stat-mini{background:var(--c-white);border:1px solid var(--c-line);border-radius:var(--r-md);padding:12px;text-align:center;transition:transform var(--motion-base)}
    .stat-mini:active{transform:scale(.97)}
    .stat-mini .sm-ico{width:30px;height:30px;border-radius:9px;margin:0 auto 6px;display:flex;align-items:center;justify-content:center}
    .stat-mini .sm-ico .ico{width:16px;height:16px}
    .stat-mini .sm-val{font-size:1.4rem;font-weight:800;color:var(--c-primary-deep);line-height:1}
    .stat-mini .sm-label{font-size:.7rem;font-weight:700;color:var(--c-text-soft);margin-top:3px}
    /* ملاحظة يومية */
    .note-card .note-area{width:100%;min-height:90px;padding:12px 14px;border-radius:var(--r-md);border:1.5px solid var(--c-line);background:var(--c-white);color:var(--c-text);font-family:var(--font-ui);font-size:.92rem;line-height:1.6;resize:vertical;transition:border-color var(--motion-base)}
    .note-card .note-area:focus{outline:none;border-color:var(--c-primary);box-shadow:0 0 0 3px rgba(27,127,90,.15)}
    .note-card .note-area::placeholder{color:var(--c-text-faint)}
    /* ===== الأوراد المحفوظة (Saved Ranges) ===== */
    .saved-range{display:flex;align-items:center;gap:10px;padding:12px 10px;background:var(--c-white);border:1.5px solid var(--c-line);border-radius:var(--r-md);margin-bottom:8px;transition:all var(--motion-base)}
    .saved-range:last-child{margin-bottom:0}
    .saved-range.active{border-color:var(--c-primary);background:var(--c-primary-soft);box-shadow:0 2px 8px rgba(27,127,90,.12)}
    .saved-range .sr-info{flex:1;min-width:0}
    .saved-range .sr-label{font-weight:800;font-size:.9rem;color:var(--c-primary-deep);display:flex;align-items:center;gap:6px;flex-wrap:wrap;line-height:1.3}
    .saved-range .sr-meta{font-size:.74rem;color:var(--c-text-soft);margin-top:3px;line-height:1.4}
    .saved-range .sr-actions{display:flex;align-items:center;gap:5px;flex:0 0 auto}
    .saved-range .sr-activate{min-height:38px;padding:6px 14px;font-size:.78rem}
    .saved-range .icon-btn{width:38px;height:38px;border-radius:10px;background:var(--c-primary-soft);box-shadow:none;border:none}
    .saved-range .icon-btn:active{transform:scale(.92)}
    .saved-range .icon-btn:focus-visible{outline:3px solid var(--c-gold);outline-offset:2px}
    .empty-ranges{padding:24px 14px;text-align:center}
    .empty-ranges .ico{margin:0 auto 10px;opacity:.5}
  `;
  document.head.appendChild(style);

  /* ================= الشاشات ================= */

  /* ---------- الرئيسية ---------- */
  function pageHome() {
    const st = App.Storage.state;
    const pr = st.profile;
    const li = App.Rewards.levelInfo(st.rewards.points);
    const sess = st.session;
    const suggest = App.Quran.data ? App.Quran.suggestNext() : null;
    const target = sess ? App.Quran.surah(sess.surah) : suggest;
    const streak = App.Storage.streak();

    const stepsData = sess ? [
      { label: "استماع", done: sess.listened.length >= (sess.range[1] - sess.range[0] + 1), active: sess.step === "listen" },
      { label: "الترديد", done: sess.recited.length >= (sess.range[1] - sess.range[0] + 1), active: sess.step === "recite" },
      { label: "اختبار الإتقان", done: !!(sess.quizResult && sess.quizResult.passed), active: sess.step === "quiz" },
      { label: "المكافأة", done: !!sess.rewarded, active: sess.step === "mastery" || sess.step === "reward" && !sess.rewarded }
    ] : null;

    // آية اليوم — ثابتة لكل يوم
    let vodHtml = "";
    if (App.Quran.data) {
      const d = new Date();
      const seed = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
      const shorts = [];
      App.Quran.all().forEach(s => s.ayahs.forEach(a => {
        const wc = a.text.split(/\s+/).length;
        if (wc >= 4 && wc <= 9) shorts.push({ s, a });
      }));
      const v = shorts[seed % shorts.length];
      vodHtml = `
      <div class="card vod-card mt-16">
        <div class="card-title"><span class="ico" data-ico="sparkle"></span> آية اليوم</div>
        <div class="ayah-text md">${v.a.text}<span class="ayah-badge">${App.arDigits(v.a.number)}</span></div>
        <p class="center tiny text-faint mt-8">سورة ${v.s.name}</p>
      </div>`;
    }

    const dueCount = App.Quran.data ? App.Revision.dueSurahs().length : 0;

    return {
      nav: "home",
      html: `
      <header class="screen-head">
        <span style="width:48px;height:48px;border-radius:14px;background:var(--grad-primary);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:var(--shadow-sm)">
          <span class="ico" data-ico="book" style="width:24px;height:24px"></span>
        </span>
        <div class="sh-title"><h1>رفيق القرآن</h1><p>رفيقك في رحلة الحفظ</p></div>
        <button class="icon-btn" data-action="toggle-theme" aria-label="تبديل الوضع الليلي"><span class="ico" data-ico="${(st.settings && st.settings.theme === 'dark') || (!st.settings || st.settings.theme === 'auto' || !st.settings.theme) ? 'moon' : 'sun'}"></span></button>
        <button class="icon-btn" data-href="#/more/settings" aria-label="الإعدادات"><span class="ico" data-ico="settings"></span></button>
      </header>

      <div class="hero">
        <div class="hero-greet">أهلًا بك يا ${pr.name ? App.esc(pr.name) : "بطل"}${streak > 1 ? ` <span class="chip chip-gold" style="margin-inline-start:6px"><span class="ico" data-ico="flame"></span> ${App.arDigits(streak)} يوم</span>` : ""}</div>
        <div class="hero-sub">رفيقك في رحلة الحفظ وتعلم القرآن</div>
      </div>

      ${App.Range.isValid() ? App.Range.barHtml() : App.Range.emptyHtml()}

      <button class="card streak-card-cta btn-block mt-12" data-href="#/streak" style="text-align:right;background:linear-gradient(135deg,#1F3A30 0%,#163025 100%);color:#fff;border:none">
        <div class="row-between" style="align-items:center">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="width:42px;height:42px;border-radius:11px;background:rgba(230,181,80,.18);color:var(--c-gold);display:flex;align-items:center;justify-content:center">
              <span class="ico" data-ico="flameBig" style="width:24px;height:24px"></span>
            </span>
            <span>
              <div style="font-weight:800;font-size:.98rem;color:#fff">يوميات الانتظام</div>
              <div style="font-size:.74rem;color:rgba(255,255,255,.78)">${streak > 0 ? `${App.arDigits(streak)} ${streak === 1 ? "يوم متواصل" : "أيام متواصلة"}` : "ابدأ رحلتك اليوم"}</div>
            </span>
          </div>
          <span class="ico" data-ico="chevronLeft" style="color:rgba(255,255,255,.6)"></span>
        </div>
      </button>

      ${target ? `
      <div class="card journey-card mt-16">
        <div class="jc-head">
          <span class="jc-ico"><span class="ico" data-ico="rocket"></span></span>
          <span class="grow" style="text-align:right">
            <span class="jc-title">رحلتك اليوم</span>
            <span class="jc-sub">${sess ? "أكمل من حيث توقفت" : "رحلة جديدة بانتظارك"} — سورة ${target.name}</span>
          </span>
        </div>
        ${stepsData ? `
        <div class="jc-steps">
          ${stepsData.map(s2 => `
          <div class="jc-step ${s2.done ? "done" : ""} ${s2.active ? "active" : ""}">
            <span class="jc-dot"><span class="ico" data-ico="${s2.done ? "check" : "sparkle"}"></span></span>
            <span>${s2.label}</span>
          </div>`).join("")}
        </div>` : `
        <div class="jc-steps">
          ${["استماع", "الترديد", "اختبار الإتقان", "المكافأة"].map(l => `
          <div class="jc-step"><span class="jc-dot"><span class="ico" data-ico="sparkle"></span></span><span>${l}</span></div>`).join("")}
        </div>`}
        <button class="btn btn-gold btn-lg btn-block btn-pulse jc-cta" data-href="#/journey/${target.number}">
          ${sess ? "أكمل رحلتي" : "ابدأ رحلتي"}
          <span class="ico" data-ico="chevronLeft"></span>
        </button>
      </div>` : ""}

      <div class="section-head"><h2>عالمك</h2></div>
      <div class="quick-grid">
        <button class="quick-card" data-href="#/quran">
          <span class="quick-ico qi-green"><span class="ico" data-ico="book"></span></span>
          <span><span class="quick-title">مدينة القرآن</span><br><span class="quick-sub">حفظ وتلاوة وتكرار</span></span>
        </button>
        <button class="quick-card" data-href="#/review">
          <span class="quick-ico qi-turquoise"><span class="ico" data-ico="refresh"></span></span>
          ${dueCount ? `<span class="quick-badge">${App.arDigits(dueCount)}</span>` : ""}
          <span><span class="quick-title">وادي المراجعة</span><br><span class="quick-sub">ثبّت ما حفظت</span></span>
        </button>
        <button class="quick-card" data-href="#/stories">
          <span class="quick-ico qi-purple"><span class="ico" data-ico="bookOpen"></span></span>
          <span><span class="quick-title">واحة القصص</span><br><span class="quick-sub">قصص تنفعك</span></span>
        </button>
        <button class="quick-card" data-href="#/morals">
          <span class="quick-ico qi-green" style="background:linear-gradient(135deg,#57B98A,#2E8F63)"><span class="ico" data-ico="leaf"></span></span>
          <span><span class="quick-title">حديقة الأخلاق</span><br><span class="quick-sub">مواقف تربيك</span></span>
        </button>
        <button class="quick-card" data-href="#/challenges">
          <span class="quick-ico qi-gold"><span class="ico" data-ico="trophy"></span></span>
          <span><span class="quick-title">تحديات الإتقان</span><br><span class="quick-sub">ألعاب وتحديات</span></span>
        </button>
        <button class="quick-card" data-href="#/achievements">
          <span class="quick-ico qi-coral"><span class="ico" data-ico="medal"></span></span>
          <span><span class="quick-title">إنجازاتي</span><br><span class="quick-sub">نجومك وأوسمتك</span></span>
        </button>
      </div>

      ${vodHtml}

      <button class="install-banner hidden" data-install-btn data-action="app-install" style="width:100%">
        <span class="ico" data-ico="download" style="color:#3D6F94;width:26px;height:26px"></span>
        <span class="ib-txt">ثبّت التطبيق على جهازك<span>يعمل بدون إنترنت وبدون شريط متصفح</span></span>
        <span class="chip chip-blue">تثبيت</span>
      </button>

      <p class="center tiny text-faint mt-20">رفيق القرآن للأطفال — الإصدار ١.٠.٠</p>
      `,
      mount() {}
    };
  }

  /* ---------- المزيد ---------- */
  function pageMore() {
    const st = App.Storage.state;
    return {
      nav: "more",
      html: `
      <header class="screen-head">
        <div class="sh-title"><h1>المزيد</h1><p>كل أقسام التطبيق</p></div>
      </header>

      <div class="card" style="display:flex;align-items:center;gap:13px" data-href="#/more/settings">
        <span class="avatar-big" style="width:58px;height:58px">${App.avatarSvg(st.profile.avatar)}</span>
        <span class="grow">
          <span class="bold" style="font-size:1.05rem">${st.profile.name ? App.esc(st.profile.name) : "بطل القرآن"}</span><br>
          <span class="tiny text-soft">اضغط لتعديل الملف الشخصي</span>
        </span>
        <span class="ico" data-ico="chevronLeft" style="color:var(--c-text-faint)"></span>
      </div>

      <div class="more-list mt-16">
        <button class="more-item" data-href="#/streak">
          <span class="mi-ico" style="background:linear-gradient(135deg,#1F3A30,#163025);color:var(--c-gold)"><span class="ico" data-ico="flameBig"></span></span>
          <span class="mi-txt"><span class="mi-title">يوميات الانتظام</span><span class="mi-sub">تقويم رحلتك وملاحظاتك اليومية</span></span>
          <span class="ico mi-arrow" data-ico="chevronLeft"></span>
        </button>
        <button class="more-item" data-href="#/achievements">
          <span class="mi-ico" style="background:var(--grad-gold)"><span class="ico" data-ico="medal"></span></span>
          <span class="mi-txt"><span class="mi-title">إنجازاتي</span><span class="mi-sub">النجوم والنقاط والأوسمة</span></span>
          <span class="ico mi-arrow" data-ico="chevronLeft"></span>
        </button>
        <button class="more-item" data-href="#/stories">
          <span class="mi-ico" style="background:linear-gradient(135deg,#9B8CCB,#6F5FA8)"><span class="ico" data-ico="bookOpen"></span></span>
          <span class="mi-txt"><span class="mi-title">واحة القصص</span><span class="mi-sub">قصص قرآنية وأنبية</span></span>
          <span class="ico mi-arrow" data-ico="chevronLeft"></span>
        </button>
        <button class="more-item" data-href="#/morals">
          <span class="mi-ico" style="background:linear-gradient(135deg,#57B98A,#2E8F63)"><span class="ico" data-ico="leaf"></span></span>
          <span class="mi-txt"><span class="mi-title">حديقة الأخلاق</span><span class="mi-sub">مواقف واختيارات</span></span>
          <span class="ico mi-arrow" data-ico="chevronLeft"></span>
        </button>
        <button class="more-item" data-href="#/parent">
          <span class="mi-ico" style="background:linear-gradient(135deg,#86B9D8,#5A92B4)"><span class="ico" data-ico="chart"></span></span>
          <span class="mi-txt"><span class="mi-title">لوحة ولي الأمر</span><span class="mi-sub">تقارير وشهادات</span></span>
          <span class="ico mi-arrow" data-ico="chevronLeft"></span>
        </button>
        <button class="more-item" data-href="#/more/settings">
          <span class="mi-ico" style="background:linear-gradient(135deg,#8FA3A0,#5F6F68)"><span class="ico" data-ico="settings"></span></span>
          <span class="mi-txt"><span class="mi-title">الإعدادات</span><span class="mi-sub">القارئ والسرعة والخط</span></span>
          <span class="ico mi-arrow" data-ico="chevronLeft"></span>
        </button>
        <button class="more-item hidden" data-install-btn data-action="app-install">
          <span class="mi-ico" style="background:linear-gradient(135deg,#43C6B4,#23958A)"><span class="ico" data-ico="download"></span></span>
          <span class="mi-txt"><span class="mi-title">تثبيت التطبيق</span><span class="mi-sub">على الشاشة الرئيسية لجهازك</span></span>
          <span class="ico mi-arrow" data-ico="chevronLeft"></span>
        </button>
        <button class="more-item" data-action="about-app">
          <span class="mi-ico" style="background:var(--grad-primary)"><span class="ico" data-ico="heart"></span></span>
          <span class="mi-txt"><span class="mi-title">حول التطبيق</span><span class="mi-sub">رفيق القرآن للأطفال</span></span>
          <span class="ico mi-arrow" data-ico="chevronLeft"></span>
        </button>
      </div>`,
      mount() {}
    };
  }

  /* ---------- الإعدادات ---------- */
  function pageSettings() {
    const st = App.Storage.getSettings();
    const pf = App.Storage.getProfile();
    return {
      nav: "more",
      html: `
      <header class="screen-head">
        <button class="icon-btn btn-back" data-href="#/more"><span class="ico" data-ico="chevronRight"></span></button>
        <div class="sh-title"><h1>الإعدادات</h1><p>خصّص رحلتك</p></div>
      </header>

      <div class="card">
        <div class="card-title"><span class="ico" data-ico="user"></span> الملف الشخصي</div>
        <div class="field">
          <label for="setName">اسم البطل</label>
          <input type="text" id="setName" maxlength="20" value="${App.esc(pf.name)}" placeholder="اكتب اسمك هنا">
          <button class="btn btn-soft btn-block mt-8" data-action="save-name"><span class="ico" data-ico="check"></span> حفظ الاسم</button>
        </div>
        <label class="field" style="display:block">
          <label>شخصيتك</label>
          <div class="avatar-grid">
            ${Object.keys(App.AVATARS).map(id => `
            <button class="avatar-opt ${pf.avatar === id ? "on" : ""}" data-action="set-avatar" data-id="${id}">${App.avatarSvg(id)}</button>`).join("")}
          </div>
        </label>
      </div>

      <div class="card">
        <div class="card-title"><span class="ico" data-ico="headphones"></span> الصوت والتلاوة</div>
        <div class="field">
          <label>القارئ</label>
          <div class="seg-group">
            ${Object.keys(App.RECITERS).map(k => `<button class="seg-item ${st.reciter === k ? "on" : ""}" data-action="set-setting" data-k="reciter" data-v="${k}">${App.RECITERS[k]}</button>`).join("")}
          </div>
        </div>
        <div class="field">
          <label>سرعة التلاوة</label>
          <div class="seg-group">
            ${[[0.75, "بطيئة"], [1, "عادية"], [1.25, "هادئة"], [1.5, "سريعة"]].map(([v, l]) => `
            <button class="seg-item ${Number(st.speed) === v ? "on" : ""}" data-action="set-setting" data-k="speed" data-v="${v}">${l}</button>`).join("")}
          </div>
        </div>
        <div class="field">
          <label>عدد تكرار الآية الافتراضي</label>
          <div class="seg-group">
            ${[1, 3, 5, 7].map(v => `<button class="seg-item ${Number(st.repeatCount) === v ? "on" : ""}" data-action="set-setting" data-k="repeatCount" data-v="${v}">× ${App.arDigits(v)}</button>`).join("")}
          </div>
        </div>
        <div class="switch-row">
          <span class="sw-label">أصوات المكافآت والاهتزاز</span>
          <button class="switch ${st.soundEffects ? "on" : ""}" data-action="set-setting" data-k="soundEffects" data-v="${!st.soundEffects}" aria-label="تبديل"></button>
        </div>
        <div class="field mt-12">
          <label>اتجاه الحفظ</label>
          <div class="seg-group">
            <button class="seg-item ${(st.memorizationDirection || "backward") === "backward" ? "on" : ""}" data-action="set-setting" data-k="memorizationDirection" data-v="backward">من الناس ← يس</button>
            <button class="seg-item ${st.memorizationDirection === "forward" ? "on" : ""}" data-action="set-setting" data-k="memorizationDirection" data-v="forward">من يس ← الناس</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ico" data-ico="book"></span> حجم خط القرآن</div>
        <div class="seg-group">
          ${[["md", "متوسط"], ["lg", "كبير"]].map(([v, l]) => `
          <button class="seg-item ${st.quranFontSize === v ? "on" : ""}" data-action="set-setting" data-k="quranFontSize" data-v="${v}">${l}</button>`).join("")}
        </div>
        <div class="card mt-12 center" style="background:var(--c-primary-soft)">
          <div class="ayah-text md">وَرَتِّلِ ٱلْقُرْآنَ تَرْتِيلًا<span class="ayah-badge">٤</span></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ico" data-ico="download"></span> النسخ الاحتياطي</div>
        <div class="data-actions">
          <button class="btn btn-soft btn-block" data-action="parent-export"><span class="ico" data-ico="download"></span> تصدير بياناتي</button>
          <button class="btn btn-soft btn-block" data-action="parent-import"><span class="ico" data-ico="upload"></span> استيراد بياناتي</button>
          <input type="file" id="importFile" accept=".json,application/json" class="file-input-hidden">
        </div>
      </div>

      <div class="card">
        <div class="card-title" style="color:var(--c-danger)"><span class="ico" data-ico="trash" style="color:var(--c-danger)"></span> منطقة حذرة</div>
        <button class="btn btn-danger btn-block" data-action="parent-reset"><span class="ico" data-ico="trash"></span> إعادة تعيين كل التقدم</button>
      </div>`,
      mount(el) {
        const file = el.querySelector("#importFile");
        if (file) {
          file.addEventListener("change", (e) => {
            const f = e.target.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = () => {
              if (App.Storage.import(reader.result)) {
                App.toast("تم استيراد البيانات بنجاح", "success");
                App.Router.render();
              } else App.toast("ملف غير صالح", "error");
            };
            reader.readAsText(f);
          });
        }
      }
    };
  }

  /* ---------- أفعال عامة ---------- */
  App.actions["save-name"] = () => {
    const input = document.getElementById("setName");
    const name = input ? input.value.trim() : "";
    App.Storage.setProfile({ name: name || "بطل" });
    App.toast("تم حفظ الاسم يا " + (name || "بطل"), "success");
  };

  App.actions["set-avatar"] = (el) => {
    App.Storage.setProfile({ avatar: el.dataset.id });
    document.querySelectorAll(".avatar-opt").forEach(b => b.classList.toggle("on", b.dataset.id === el.dataset.id));
    App.toast("تم اختيار شخصيتك", "success");
  };
  App.actions["set-setting"] = (el) => {
    const k = el.dataset.k;
    let v = el.dataset.v;
    if (v === "true") v = true; else if (v === "false") v = false;
    else if (!isNaN(Number(v)) && k !== "reciter" && k !== "memorizationDirection") v = Number(v);
    App.Storage.setSetting(k, v);
    App.Router.render();
  };
  App.actions["about-app"] = () => {
    App.modal({
      title: "حول التطبيق",
      body: `
      <div class="center">
        <span class="ico" style="width:52px;height:52px;margin:0 auto 10px;color:var(--c-primary)" data-ico="book"></span>
        <div class="bold" style="font-size:1.1rem">رفيق القرآن للأطفال</div>
        <p class="small text-soft mt-8" style="line-height:2">
        تطبيق تفاعلي لحفظ جزء عمّ وتعلم القيم القرآنية، مصمم خصيصًا للأطفال.<br>
        الإصدار ١.٠.٠ — يعمل بدون إنترنت بعد أول تشغيل.<br>
        النص القرآني بالرسم العثماني، والتلاوات من كلٍّ من الشيخ مشاري العفاسي والشيخ محمود خليل الحصري.
        </p>
        <p class="tiny text-faint mt-8">«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»</p>
      </div>`,
      actions: [{ label: "رائع", action: "close-modal", primary: true }]
    });
  };

  /* ---------- الترحيب الأول ---------- */
  function showOnboarding() {
    App.modal({
      title: "أهلًا بك في رفيق القرآن!",
      closable: false,
      body: `
      <p class="small text-soft mb-12">قبل أن نبدأ رحلتنا… ما اسمك يا بطل؟ ومن أي شخصية تريد أن تكون؟</p>
      <div class="field">
        <label for="onbName">اسمك</label>
        <input type="text" id="onbName" maxlength="20" placeholder="مثال: أحمد">
      </div>
      <div class="avatar-grid">
        ${Object.keys(App.AVATARS).map((id, i) => `
        <button class="avatar-opt ${i === 0 ? "on" : ""}" data-onb-avatar="${id}">${App.avatarSvg(id)}</button>`).join("")}
      </div>`,
      actions: [{ label: "يلا نبدأ!", action: "onboarding-done", primary: true }]
    });
    App._onbAvatar = "falcon";
    document.getElementById("modalCard").addEventListener("click", (e) => {
      const av = e.target.closest("[data-onb-avatar]");
      if (!av) return;
      document.querySelectorAll("[data-onb-avatar]").forEach(b => b.classList.remove("on"));
      av.classList.add("on");
      App._onbAvatar = av.dataset.onbAvatar;
    });
  }

  App.actions["onboarding-done"] = () => {
    const name = (document.getElementById("onbName").value || "").trim();
    App.Storage.setProfile({ name: name || "بطل", avatar: App._onbAvatar || "falcon", onboarded: true });
    App.closeModal();
    App.confetti();
    App.toast(`أهلًا بك يا ${name || "بطل"}! رحلتك تبدأ الآن`, "success");
    App.Router.render();
  };

  /* ---------- تتبع وقت التعلم ---------- */
  function startTimeTracking() {
    setInterval(() => {
      if (document.visibilityState === "visible") {
        App.Storage.addLearningSec(15);
      }
    }, 15000);
    App.Storage.touchToday();
  }

  /* ================= التسجيل والبدء ================= */
  /* ---------- تطبيق الوضع الليلي ---------- */
  App.applyTheme = function () {
    const settings = App.Storage.getSettings();
    const theme = settings.theme || "auto";
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      // auto — احترم تفضيل النظام
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }
    // حدّث theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", theme === "dark" ? "#0F172A" : (theme === "light" ? "#1B7F5A" : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "#0F172A" : "#1B7F5A")));
    }
  };
  // استمع لتغييرات تفضيل النظام
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const settings = App.Storage.getSettings();
      if ((settings.theme || "auto") === "auto") App.applyTheme();
    };
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else if (mq.addListener) mq.addListener(handler);
  }

  function init() {
    App.Storage.load();
    App.applyTheme();

    // fill bottom nav icons
    App.fillIcons(document);
    App.bindDelegation();

    // routes
    App.Router.add("home", pageHome);
    App.Router.add("streak", () => pageStreak());
    App.Router.add("range", () => App.pageRange());
    App.Router.add("quran", () => App.Quran.pageQuran({}));
    App.Router.add("quran/:tab", (p) => App.Quran.pageQuran(p));
    App.Router.add("surah/:id", (p) => App.Quran.pageSurah(p));
    App.Router.add("recite/:id", (p) => App.Quran.pageMode({ kind: "recite", id: p.id }));
    App.Router.add("repeat/:id", (p) => App.Quran.pageMode({ kind: "repeat", id: p.id }));
    App.Router.add("journey/:id", (p) => App.Memorization.pageJourney(p));
    App.Router.add("review", () => App.Revision.pageReview());
    App.Router.add("review/session", () => App.Revision.pageSession());
    App.Router.add("challenges", () => App.Challenges.pageHub());
    App.Router.add("challenges/:type", (p) => App.Challenges.pageGame(p));
    App.Router.add("stories", () => App.Stories.pageStories());
    App.Router.add("story/:id", (p) => App.Stories.pageStory(p));
    App.Router.add("morals", () => App.Morals.pageMorals());
    App.Router.add("moral/:id", (p) => App.Morals.pageMoral(p));
    App.Router.add("achievements", () => App.Rewards.pageAchievements());
    App.Router.add("more", pageMore);
    App.Router.add("more/settings", pageSettings);
    App.Router.add("parent", () => App.Parent.pageGate());

    App.PWA.init();
    App.Router.start();
    startTimeTracking();

    // تحميل بيانات القرآن مسبقًا
    App.Quran.load().then(() => {
      // لو صفحة النطاق مفتوحة، اضبط القيم
      const sel = document.getElementById("rangeSurah");
      if (sel && !sel.value) {
        const r = App.Range.get();
        if (r) {
          sel.value = r.surah;
          window.dispatchEvent(new Event("range-ready"));
        }
      }
    }).catch(() => {});

    // الترحيب الأول
    if (!App.Storage.getProfile().onboarded) {
      setTimeout(showOnboarding, 400);
    }
  }

  /* ---------- شاشة نطاق الحفظ ---------- */
  App.pageRange = function () {
    if (!App.Quran.data) {
      return {
        nav: "more",
        html: App.loadingHtml(),
        mount() { App.Quran.load().then(() => App.Router.render()).catch(() => App.toast("تعذّر تحميل بيانات القرآن", "error")); }
      };
    }
    const current = App.Range.get();
    const allSurahs = App.Quran.all().slice().sort((a, b) => a.number - b.number);
    const surahOptions = allSurahs.map(s =>
      '<option value="' + s.number + '"' + (current && current.surah === s.number ? ' selected' : '') + '>سورة ' + s.name + ' — ' + App.arDigits(s.ayahsCount) + ' آية</option>'
    ).join("");
    const initialSurah = current ? current.surah : (allSurahs[0] ? allSurahs[0].number : 78);
    const initialFrom = current ? current.from : 1;
    const surahObj = App.Quran.surah(initialSurah);
    const initialAyahCount = surahObj ? surahObj.ayahsCount : 6;
    const initialTo = current ? current.to : Math.min(5, initialAyahCount);

    return {
      nav: "more",
      html: `
      <header class="screen-head">
        <button class="icon-btn btn-back" data-href="#/home" aria-label="رجوع"><span class="ico" data-ico="chevronRight"></span></button>
        <div class="sh-title">
          <h1>نطاق الحفظ</h1>
          <p>اختر الآيات التي تريد أن تتعلمها اليوم</p>
        </div>
      </header>

      <div class="card">
        <div class="card-title"><span class="ico" data-ico="book"></span> اختيار السورة</div>
        <div class="field" style="margin:0">
          <label for="rangeSurah">السورة</label>
          <select id="rangeSurah" aria-label="اختر السورة">
            ${surahOptions}
          </select>
          <p class="tiny text-soft mt-8" id="surahInfo" style="margin-top:6px"></p>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ico" data-ico="target"></span> نطاق الآيات</div>
        <div class="grid-2" style="gap:12px">
          <div class="field" style="margin:0">
            <label for="rangeFrom">من آية</label>
            <input type="number" id="rangeFrom" min="1" max="${initialAyahCount}" value="${initialFrom}" inputmode="numeric">
          </div>
          <div class="field" style="margin:0">
            <label for="rangeTo">إلى آية</label>
            <input type="number" id="rangeTo" min="1" max="${initialAyahCount}" value="${initialTo}" inputmode="numeric">
          </div>
        </div>
        <div id="rangeError" class="tiny mt-8" style="color:var(--c-danger);display:none" role="alert"></div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ico" data-ico="sparkle"></span> اختيارات سريعة</div>
        <div class="quick-presets" id="quickPresets" style="display:flex;flex-wrap:wrap;gap:8px"></div>
      </div>

      <div class="row mt-12" style="gap:10px">
        <button class="btn btn-soft grow" data-action="range-save-as" aria-label="حفظ الورد الحالي">
          <span class="ico" data-ico="bookmark"></span> حفظ كورد
        </button>
        <button class="btn btn-primary grow" data-action="range-start">
          <span class="ico" data-ico="rocket"></span> ابدأ الحفظ
        </button>
      </div>

      <div class="section-head"><h2>أورادي المحفوظة</h2></div>
      <div id="savedRanges" class="saved-ranges-list">
        ${App.Range.savedListHtml()}
      </div>
      `,
      mount(el) {
        const surahSel = el.querySelector("#rangeSurah");
        const fromInput = el.querySelector("#rangeFrom");
        const toInput = el.querySelector("#rangeTo");
        const infoP = el.querySelector("#surahInfo");
        const errDiv = el.querySelector("#rangeError");
        const presetsHost = el.querySelector("#quickPresets");

        function updateSurahInfo() {
          const n = Number(surahSel.value);
          const s = App.Quran.surah(n);
          if (!s) return;
          infoP.textContent = "السورة " + s.name + " — " + s.revelationType + " — " + App.arDigits(s.ayahsCount) + " آية";
          fromInput.max = s.ayahsCount;
          toInput.max = s.ayahsCount;
          if (Number(fromInput.value) > s.ayahsCount) fromInput.value = s.ayahsCount;
          if (Number(toInput.value) > s.ayahsCount) toInput.value = s.ayahsCount;
          renderPresets(n);
        }

        function renderPresets(n) {
          const presets = App.Range.quickPresets(n);
          presetsHost.innerHTML = presets.map(p =>
            '<button class="seg-item" data-preset-from="' + p.from + '" data-preset-to="' + p.to + '">' + p.label + '</button>'
          ).join("");
        }

        function showError(msg) {
          if (msg) {
            errDiv.textContent = msg;
            errDiv.style.display = "block";
          } else {
            errDiv.style.display = "none";
          }
        }

        surahSel.addEventListener("change", updateSurahInfo);
        fromInput.addEventListener("input", () => showError(""));
        toInput.addEventListener("input", () => showError(""));

        presetsHost.addEventListener("click", (e) => {
          const b = e.target.closest("[data-preset-from]");
          if (!b) return;
          fromInput.value = b.dataset.presetFrom;
          toInput.value = b.dataset.presetTo;
          showError("");
          App.haptic(15);
        });

        updateSurahInfo();
      }
    };
  };

  /* ---------- إجراء بدء النطاق ---------- */
  App.actions["range-start"] = () => {
    const surahSel = document.getElementById("rangeSurah");
    const fromInput = document.getElementById("rangeFrom");
    const toInput = document.getElementById("rangeTo");
    const errDiv = document.getElementById("rangeError");
    if (!surahSel || !fromInput || !toInput) return;

    const surah = surahSel.value;
    const from = fromInput.value;
    const to = toInput.value;

    const result = App.Range.set(surah, from, to);
    if (!result.ok) {
      if (errDiv) {
        errDiv.textContent = result.errors[0];
        errDiv.style.display = "block";
      }
      App.toast(result.errors[0], "error");
      return;
    }

    App.haptic(20);
    App.toast("تم ضبط نطاق الحفظ بنجاح", "success");
    App.Router.go("#/journey/" + surah);
  };

  /* ---------- حفظ النطاق الحالي كورد ---------- */
  App.actions["range-save-as"] = () => {
    const surahSel = document.getElementById("rangeSurah");
    const fromInput = document.getElementById("rangeFrom");
    const toInput = document.getElementById("rangeTo");
    if (!surahSel || !fromInput || !toInput) return;

    const surah = surahSel.value;
    const from = fromInput.value;
    const to = toInput.value;

    // تحقق من الصحة أولًا
    const errors = App.Range.validate(surah, from, to);
    if (errors.length) {
      App.toast(errors[0], "error");
      return;
    }

    // اسم افتراضي مقترح
    const s = App.Quran.surah(Number(surah));
    const suggested = "سورة " + s.name + " — من " + App.arDigits(from) + " إلى " + App.arDigits(to);

    App.modal({
      title: "حفظ الورد",
      body: `
        <p class="small text-soft mb-12">اختر اسمًا لوردك حتى تجده بسهولة لاحقًا</p>
        <div class="field" style="margin:0">
          <label for="rangeLabel">اسم الورد</label>
          <input type="text" id="rangeLabel" maxlength="40" value="${App.esc(suggested)}" placeholder="مثال: ورد الصباح">
        </div>`,
      actions: [
        { label: "إلغاء", action: "close-modal" },
        { label: "حفظ", action: "range-save-confirm", primary: true }
      ]
    });
    setTimeout(() => {
      const inp = document.getElementById("rangeLabel");
      if (inp) { inp.focus(); inp.select(); }
    }, 50);
  };

  App.actions["range-save-confirm"] = () => {
    const surahSel = document.getElementById("rangeSurah");
    const fromInput = document.getElementById("rangeFrom");
    const toInput = document.getElementById("rangeTo");
    const labelInput = document.getElementById("rangeLabel");
    if (!surahSel || !fromInput || !toInput) { App.closeModal(); return; }

    const surah = surahSel.value;
    const from = fromInput.value;
    const to = toInput.value;
    const label = labelInput ? labelInput.value : "";

    const result = App.Range.saveCurrentAs(label, surah, from, to);
    App.closeModal();
    if (!result.ok) {
      App.toast(result.errors[0], "error");
      return;
    }
    App.haptic(20);
    if (result.duplicate) {
      App.toast("هذا الورد موجود بالفعل، تم تحديثه", "info");
    } else {
      App.toast("تم حفظ الورد بنجاح", "success");
    }
    App.Router.render();
  };

  /* ---------- تفعيل ورد محفوظ ---------- */
  App.actions["range-activate"] = (el) => {
    const id = el.dataset.id;
    const result = App.Range.activateSaved(id);
    if (!result.ok) {
      App.toast(result.errors[0] || "تعذّر التفعيل", "error");
      return;
    }
    App.haptic(20);
    App.toast("تم تفعيل الورد", "success");
    // انتقل إلى رحلة الحفظ
    const r = App.Range.get();
    if (r) App.Router.go("#/journey/" + r.surah);
  };

  /* ---------- حذف ورد محفوظ ---------- */
  App.actions["range-delete"] = (el) => {
    const id = el.dataset.id;
    const label = el.dataset.label || "هذا الورد";
    App.confirm("حذف «" + label + "»؟ لا يمكن التراجع.", () => {
      const ok = App.Range.deleteSaved(id);
      if (ok) {
        App.haptic(20);
        App.toast("تم حذف الورد", "info");
        App.Router.render();
      } else {
        App.toast("تعذّر الحذف", "error");
      }
    });
  };

  /* ---------- إعادة تسمية ورد ---------- */
  App.actions["range-rename"] = (el) => {
    const id = el.dataset.id;
    const oldLabel = el.dataset.label || "";
    App.modal({
      title: "إعادة تسمية الورد",
      body: `
        <p class="small text-soft mb-12">اكتب الاسم الجديد للورد</p>
        <div class="field" style="margin:0">
          <label for="rangeNewLabel">الاسم الجديد</label>
          <input type="text" id="rangeNewLabel" maxlength="40" value="${App.esc(oldLabel)}" placeholder="اسم الورد">
        </div>`,
      actions: [
        { label: "إلغاء", action: "close-modal" },
        { label: "حفظ", action: "range-rename-confirm", primary: true, arg: id }
      ]
    });
    setTimeout(() => {
      const inp = document.getElementById("rangeNewLabel");
      if (inp) { inp.focus(); inp.select(); }
    }, 50);
  };

  App.actions["range-rename-confirm"] = (el) => {
    const id = el.dataset.modalArg;
    const inp = document.getElementById("rangeNewLabel");
    if (!inp) { App.closeModal(); return; }
    const result = App.Range.renameSaved(id, inp.value);
    if (!result.ok) {
      App.toast(result.errors[0], "error");
      return;
    }
    App.closeModal();
    App.haptic(20);
    App.toast("تم تحديث الاسم", "success");
    App.Router.render();
  };

  /* ---------- إجراء تبديل الوضع الليلي ---------- */
  App.actions["toggle-theme"] = () => {
    const st = App.Storage.getSettings();
    const cur = st.theme || "auto";
    let next;
    if (cur === "auto") next = "dark";
    else if (cur === "dark") next = "light";
    else next = "auto";
    App.Storage.setSetting("theme", next);
    App.applyTheme();
    App.Router.render();
    const label = next === "dark" ? "الوضع الليلي" : (next === "light" ? "الوضع النهاري" : "الوضع التلقائي");
    App.toast(label, "info");
  };

  /* ================= يوميات الانتظام (Streak Diary) ================= */
  /* حالة شاشة اليوميات: الشهر المعروض حاليًا */
  App._streakViewDate = null;

  function streakEncourage(n) {
    if (n === 0) return "ابدأ رحلتك اليوم! كل بداية تحتاج خطوة";
    if (n === 1) return "بداية موفقة! واصل غدًا";
    if (n <= 3) return "بداية جميلة، استمر يا بطل";
    if (n <= 6) return "ما شاء الله! أنت على الطريق الصحيح";
    if (n <= 9) return "رائع! الانتظام سر النجاح";
    if (n <= 13) return "أسبوعان من الانتظام! يا لك من بطل";
    if (n <= 20) return "ما شاء الله، أنت مثال للانتظام";
    if (n <= 29) return "اقتربت من الشهر! استمر";
    if (n <= 60) return "انتظام استثنائي! بارك الله فيك";
    return "أنت قدوة لكل من يحب القرآن";
  }

  /* أسماء الأشهر بالعربية */
  const AR_MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  /* أسماء أيام الأسبوع (مختصرة) - يبدأ الأسبوع بالسبت */
  const AR_DAYS = ["سبت","أحد","إثنين","ثلاثاء","أربعاء","خميس","جمعة"];

  function dateKey(y, m, d) {
    return y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }

  function pageStreak() {
    const st = App.Storage.state;
    const streak = App.Storage.streak();
    const longest = App.Storage.longestStreak();
    const totalDays = App.Storage.totalActiveDays();
    const totalSec = st.stats.learningSeconds || 0;
    const totalMin = Math.round(totalSec / 60);
    const todayNote = App.Storage.getDailyNote();
    const todayKey = App.Storage._todayKey();

    // شهر العرض الحالي
    const today = new Date();
    let viewDate = App._streakViewDate;
    if (!viewDate) {
      viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
      App._streakViewDate = viewDate;
    }
    const vy = viewDate.getFullYear();
    const vm = viewDate.getMonth();
    const daysInMonth = new Date(vy, vm + 1, 0).getDate();
    // اليوم الأول من الشهر: أيام الأسبوع نبدأ بها (السبت = 6 في JS، نريد السبت = 0)
    const firstDow = new Date(vy, vm, 1).getDay(); // 0=الأحد ... 6=السبت
    const offset = (firstDow + 1) % 7; // السبت = 0

    const activeSet = new Set(st.stats.activeDays || []);
    const notesSet = new Set(Object.keys(st.dailyNotes || {}));

    // بناء خلايا التقويم
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push({ empty: true });
    for (let d = 1; d <= daysInMonth; d++) {
      const k = dateKey(vy, vm, d);
      const isFuture = (new Date(vy, vm, d) > today) && k !== todayKey;
      cells.push({
        day: d,
        key: k,
        active: activeSet.has(k),
        hasNote: notesSet.has(k),
        isToday: k === todayKey,
        isFuture
      });
    }

    // آخر 7 أيام للعرض في الـ dots
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const dd = new Date(today.getTime() - i * 86400000);
      const k = dateKey(dd.getFullYear(), dd.getMonth(), dd.getDate());
      last7.push({ key: k, active: activeSet.has(k), isToday: k === todayKey });
    }

    // إحصائيات الوقت
    const hoursLabel = totalMin >= 60
      ? (App.arDigits(Math.floor(totalMin / 60)) + " س " + App.arDigits(totalMin % 60) + " د")
      : (App.arDigits(totalMin) + " دقيقة");

    return {
      nav: "more",
      html: `
      <header class="screen-head">
        <button class="icon-btn btn-back" data-href="#/home" aria-label="رجوع"><span class="ico" data-ico="chevronRight"></span></button>
        <div class="sh-title">
          <h1>يوميات الانتظام</h1>
          <p>رحلتك مع القرآن يومًا بيوم</p>
        </div>
      </header>

      <div class="streak-hero mt-8">
        <div class="streak-flame"><span class="ico" data-ico="flameBig"></span></div>
        <div class="streak-count">${App.arDigits(streak)}</div>
        <div class="streak-label">${streak === 1 ? "يوم متواصل" : "أيام متواصلة"}</div>
        <div class="streak-encourage">${streakEncourage(streak)}</div>
        <div class="streak-progress">
          ${last7.map(d => `<div class="streak-dot ${d.active ? "lit" : ""} ${d.isToday ? "today" : ""}"></div>`).join("")}
        </div>
      </div>

      <div class="grid-3 mt-12" style="gap:10px">
        <div class="stat-mini">
          <div class="sm-ico" style="background:var(--c-gold-light);color:var(--c-gold-deep)"><span class="ico" data-ico="trophy"></span></div>
          <div class="sm-val">${App.arDigits(longest)}</div>
          <div class="sm-label">أطول سلسلة</div>
        </div>
        <div class="stat-mini">
          <div class="sm-ico" style="background:var(--c-primary-light);color:var(--c-primary-dark)"><span class="ico" data-ico="calendar"></span></div>
          <div class="sm-val">${App.arDigits(totalDays)}</div>
          <div class="sm-label">يوم نشط</div>
        </div>
        <div class="stat-mini">
          <div class="sm-ico" style="background:var(--c-turquoise-light);color:#1E7E71"><span class="ico" data-ico="clock"></span></div>
          <div class="sm-val" style="font-size:1.05rem;line-height:1.2">${hoursLabel}</div>
          <div class="sm-label">زمن التعلم</div>
        </div>
      </div>

      <div class="card calendar-card mt-12">
        <div class="cal-head">
          <button class="cal-nav-btn" data-action="streak-prev-month" aria-label="الشهر السابق"><span class="ico" data-ico="chevronRight"></span></button>
          <div class="cal-month">${AR_MONTHS[vm]} ${App.arDigits(vy)}</div>
          <button class="cal-nav-btn" data-action="streak-next-month" aria-label="الشهر التالي"><span class="ico" data-ico="chevronLeft"></span></button>
        </div>
        <div class="cal-grid">
          ${AR_DAYS.map(d => `<div class="cal-day-name">${d}</div>`).join("")}
          ${cells.map(c => {
            if (c.empty) return `<div class="cal-cell empty"></div>`;
            const cls = ["cal-cell"];
            if (c.active) cls.push("active");
            if (c.isToday) cls.push("today");
            if (c.hasNote) cls.push("has-note");
            if (c.isFuture) cls.push("future");
            return `<button class="${cls.join(" ")}" data-cal-day="${c.key}" aria-label="${c.active ? "نشط" : ""} ${c.hasNote ? "وفيه ملاحظة" : ""} يوم ${App.arDigits(c.day)}">${App.arDigits(c.day)}</button>`;
          }).join("")}
        </div>
      </div>

      <div class="card note-card mt-12">
        <div class="card-title"><span class="ico" data-ico="pen"></span> ملاحظة اليوم</div>
        <p class="small text-soft mb-8">كيف كان وردك مع القرآن اليوم؟ اكتب شعورك أو ما تعلمته</p>
        <textarea class="note-area" id="noteArea" placeholder="مثال: اليوم حفظت آيات من سورة النبأ وكان سهلًا..." maxlength="280">${App.esc(todayNote)}</textarea>
        <button class="btn btn-primary btn-block mt-12" data-action="streak-save-note">
          <span class="ico" data-ico="check"></span> احفظ الملاحظة
        </button>
      </div>

      <p class="center tiny text-faint mt-16">اللهم اجعل القرآن ربيع قلوبنا</p>
      `,
      mount(el) {
        // فتح ملاحظة يوم محدد عند الضغط على خلية
        el.addEventListener("click", (e) => {
          const cell = e.target.closest("[data-cal-day]");
          if (!cell) return;
          const k = cell.dataset.calDay;
          const note = App.Storage.getDailyNote(k);
          const d = new Date(k + "T00:00:00");
          const label = AR_DAYS[(d.getDay() + 1) % 7] + " " + App.arDigits(d.getDate()) + " " + AR_MONTHS[d.getMonth()];
          const isToday = k === todayKey;
          if (note) {
            App.modal({
              title: label,
              body: `<p class="small text-soft">ملاحظتك في ${isToday ? "اليوم" : "ذلك اليوم"}:</p><p style="font-size:1rem;line-height:1.7;margin-top:8px;padding:10px 12px;background:var(--c-primary-soft);border-radius:10px">${App.esc(note)}</p>`,
              actions: [{ label: "تم", action: "close-modal", primary: true }]
            });
          } else if (isToday) {
            // ركّز على منطقة الملاحظة
            const area = el.querySelector("#noteArea");
            if (area) { area.focus(); area.scrollIntoView({ behavior: "smooth", block: "center" }); }
          } else {
            App.toast("لا توجد ملاحظة في هذا اليوم", "info");
          }
        });
      }
    };
  }

  /* ---------- إجراءات يوميات الانتظام ---------- */
  App.actions["streak-save-note"] = () => {
    const area = document.getElementById("noteArea");
    if (!area) return;
    const text = area.value.trim();
    App.Storage.setDailyNote(App.Storage._todayKey(), text);
    App.Storage.touchToday(); // سجل اليوم كنشط
    App.toast(text ? "تم حفظ ملاحظتك" : "تم مسح ملاحظة اليوم", "success");
    App.haptic(20);
    App.Router.render();
  };
  App.actions["streak-prev-month"] = () => {
    if (!App._streakViewDate) App._streakViewDate = new Date();
    App._streakViewDate = new Date(App._streakViewDate.getFullYear(), App._streakViewDate.getMonth() - 1, 1);
    App.Router.render();
  };
  App.actions["streak-next-month"] = () => {
    if (!App._streakViewDate) App._streakViewDate = new Date();
    const today = new Date();
    const next = new Date(App._streakViewDate.getFullYear(), App._streakViewDate.getMonth() + 1, 1);
    // منع الانتقال لأشهر مستقبلية
    if (next.getFullYear() > today.getFullYear() ||
        (next.getFullYear() === today.getFullYear() && next.getMonth() > today.getMonth())) {
      App.toast("لا يمكن عرض أشهر مستقبلية", "info");
      return;
    }
    App._streakViewDate = next;
    App.Router.render();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
