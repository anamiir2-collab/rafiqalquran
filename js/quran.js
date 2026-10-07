/* ============================================================
   رفيق القرآن للأطفال — quran.js
   مدينة القرآن: بيانات القرآن + قارئ المصحف الموحّد
   - الصفحة الرئيسية لمدينة القرآن: مدخل واحد "القرآن الكريم"
   - القارئ المتكامل: فهرس + بحث + متابعة + استماع + تسميع
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  /* ============================================================
     Q — طبقة بيانات القرآن الكريم (114 سورة)
     ============================================================ */
  const Q = {
    data: null,
    _loading: null,

    /** تحميل بيانات القرآن من الملف المحلي أولًا، ثم من CDN كاحتياط */
    load() {
      if (this.data) return Promise.resolve(this.data);
      if (this._loading) return this._loading;

      const CDN_URL = "https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran.json";
      const CACHE_NAME = "rafiq-quran-full-v2";

      const normalizeFull = (raw) => {
        const source = raw && Array.isArray(raw.chapters)
          ? raw.chapters
          : raw && Array.isArray(raw.surahs)
            ? raw.surahs
            : Array.isArray(raw)
              ? raw
              : [];

        // لو المصدر هو مصفوفة خام (quran-json الأصلية)، نطبّعها لصيغتنا الداخلية
        const isRawList = Array.isArray(raw) && raw.length && raw[0] && raw[0].verses;

        if (isRawList) {
          const BISMILLAH_VERSE = String(raw[0].verses[0].text || "").trim();
          const BISMILLAH_FULL = "بِسْمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ";
          const NO_HEADER = new Set([1, 9]);
          const normCmp = (s) => String(s || "").normalize("NFKC")
            .replace(/[\u064B-\u0652\u0670\u0640\u06D6-\u06ED\u0653-\u065F]/g, "")
            .replace(/\s+/g, "").trim();
          const bismNorm = normCmp(BISMILLAH_VERSE);
          const stripBism = (text) => {
            const t = String(text);
            if (!normCmp(t).startsWith(bismNorm)) return t;
            let i = 0, m = 0;
            while (i < t.length && m < bismNorm.length) {
              const ch = t[i];
              if (/[\u064B-\u0652\u0670\u0640\u06D6-\u06ED\u0653-\u065F]/.test(ch) || /\s/.test(ch)) { i++; continue; }
              if (normCmp(ch) !== bismNorm[m]) return t;
              i++; m++;
            }
            if (m === bismNorm.length) {
              while (i < t.length && /\s/.test(t[i])) i++;
              return t.slice(i);
            }
            return t;
          };
          const surahs = raw.map((s, idx) => {
            const number = Number(s.id || s.number || idx + 1);
            const verses = Array.isArray(s.verses) ? s.verses : (Array.isArray(s.ayahs) ? s.ayahs : []);
            const hasHeader = !NO_HEADER.has(number);
            const ayahs = verses.map((v, i) => {
              const num = Number(v.id || v.number || i + 1);
              let text = String(v.text || "");
              if (num === 1 && hasHeader) text = stripBism(text);
              return { number: num, text };
            });
            return {
              number,
              name: String(s.name || s.name_ar || ""),
              englishName: String(s.transliteration || s.englishName || ""),
              revelationType: String(s.type || s.revelationType || "").toLowerCase().includes("mad") ? "مدنية" : "مكية",
              ayahsCount: Number(s.total_verses || s.verses_count || ayahs.length),
              basmala: hasHeader,
              ayahs
            };
          }).filter(s => s.number >= 1 && s.number <= 114 && s.ayahs.length);

          return {
            meta: {
              app: "رفيق القرآن للأطفال",
              edition: "quran-uthmani (quran-json 3.1.2)",
              source: "Quran JSON / The Noble Qur'an Encyclopedia",
              range: "القرآن الكريم كاملًا — من الفاتحة إلى الناس",
              surahsCount: surahs.length,
              ayahsCount: surahs.reduce((sum, s) => sum + s.ayahs.length, 0),
              bismillah: BISMILLAH_FULL,
              bismillahVerse: BISMILLAH_VERSE
            },
            surahs
          };
        }

        // صيغة داخلية محفوظة (data/quran.json بعد البناء)
        const surahs = source.map((s, index) => {
          const number = Number(s.id || s.number || index + 1);
          const verses = Array.isArray(s.verses) ? s.verses : (Array.isArray(s.ayahs) ? s.ayahs : []);
          return {
            number,
            name: s.name || s.name_ar || "",
            englishName: s.transliteration || s.englishName || "",
            revelationType: String(s.type || s.revelationType || "").toLowerCase().includes("mad") ? "مدنية" : "مكية",
            ayahsCount: Number(s.total_verses || s.verses_count || s.ayahsCount || verses.length),
            basmala: s.basmala !== false && number !== 1 && number !== 9,
            ayahs: verses.map((a, i) => ({
              number: Number(a.id || a.number || i + 1),
              text: String(a.text || a.text_ar || "")
            }))
          };
        }).filter(s => s.number >= 1 && s.number <= 114 && s.ayahs.length);

        return {
          meta: {
            app: "رفيق القرآن للأطفال",
            edition: "quran-uthmani",
            source: "Quran JSON / The Noble Qur'an Encyclopedia",
            range: "القرآن الكريم كاملًا",
            surahsCount: surahs.length,
            ayahsCount: surahs.reduce((sum, s) => sum + s.ayahs.length, 0),
            bismillah: "بِسْمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ"
          },
          surahs
        };
      };

      const getLocal = () => fetch("./data/quran.json", { cache: "no-cache" }).then(r => {
        if (!r.ok) throw new Error("quran.json HTTP " + r.status);
        return r.json();
      });

      const getFull = async () => {
        try {
          if ("caches" in window) {
            const cached = await caches.match(CDN_URL);
            if (cached) {
              const raw = await cached.json();
              const full = normalizeFull(raw);
              if (full.surahs.length === 114) return full;
            }
          }
        } catch (e) { console.warn("cached full Quran unavailable", e); }

        const response = await fetch(CDN_URL, { mode: "cors", cache: "no-cache" });
        if (!response.ok) throw new Error("full Quran HTTP " + response.status);
        const copy = response.clone();
        const raw = await response.json();
        try {
          if ("caches" in window) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(CDN_URL, copy);
          }
        } catch (e) { console.warn("full Quran cache write failed", e); }

        const full = normalizeFull(raw);
        if (full.surahs.length !== 114) throw new Error("full Quran validation failed: expected 114 surahs");
        return full;
      };

      this._loading = getLocal()
        .then(async local => {
          if (local && local.surahs && local.surahs.length === 114) {
            this.data = local;
            return local;
          }
          try {
            const full = await getFull();
            this.data = full;
            return full;
          } catch (e) {
            console.warn("full Quran download failed; using local Quran data", e);
            this.data = local;
            return local;
          }
        })
        .catch(e => {
          console.error("quran data load failed", e);
          this._loading = null;
          throw e;
        });

      return this._loading;
    },

    surah(n) {
      if (!this.data) return null;
      return this.data.surahs.find(s => s.number === Number(n)) || null;
    },
    all() { return this.data ? this.data.surahs : []; },
    bismillah() {
      if (!this.data) return "بِسْمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ";
      return this.data.meta.bismillahVerse || this.data.meta.bismillah || "بِسْمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ";
    },

    /** هل السورة تبدأ بـ"بسم الله" كرأس سورة مستقل؟ (لا للفاتحة ولا للتوبة) */
    startsWithBismillah(n) {
      const s = this.surah(n);
      if (!s) return false;
      if (s.basmala === false) return false;
      if (s.basmala === true) return true;
      return n !== 1 && n !== 9;
    },

    /** الآيات للعرض — بدون البسملة المدمجة في الآية الأولى إن وُجدت كرأس */
    ayahsForDisplay(n) {
      const s = this.surah(n);
      if (!s) return [];
      const bism = this.bismillah();
      const normalize = (str) => String(str)
        .normalize("NFKC")
        .replace(/[\u064B-\u0652\u0670\u0640\u06D6-\u06ED\u0653-\u065F]/g, "")
        .replace(/\s+/g, "")
        .trim();
      const bismNorm = normalize(bism);

      const stripBismillah = (text) => {
        const source = String(text);
        const sourceNorm = normalize(source);
        if (!bismNorm || !sourceNorm.startsWith(bismNorm)) return source;
        let i = 0, matched = 0;
        while (i < source.length && matched < bismNorm.length) {
          const ch = source[i];
          if (/[\u064B-\u0652\u0670\u0640\u06D6-\u06ED\u0653-\u065F]/.test(ch) || /\s/.test(ch)) { i++; continue; }
          if (normalize(ch) !== bismNorm[matched]) return source;
          i++; matched++;
        }
        if (matched === bismNorm.length) {
          while (i < source.length && /\s/.test(source[i])) i++;
          return source.slice(i);
        }
        return source;
      };

      return s.ayahs.map(a => {
        let text = a.text;
        if (a.number === 1 && this.startsWithBismillah(n)) {
          text = stripBismillah(text);
        }
        return { number: a.number, text };
      });
    },

    /** تطبيع عربي للبحث والمقارنة فقط (لا يغيّر النص الأصلي المعروض) */
    normalizeArabic(text) {
      return String(text || "")
        .normalize("NFKC")
        .replace(/[\u064B-\u0652\u0670\u0640\u06D6-\u06ED\u0653-\u065F]/g, "") // إزالة التشكيل والعلامات
        .replace(/[إأآٱ]/g, "ا")        // توحيد الهمزات
        .replace(/ى/g, "ي")              // الألف المقصورة → ياء
        .replace(/ؤ/g, "و")
        .replace(/ئ/g, "ي")
        .replace(/ة/g, "ه")              // التاء المربوطة → هاء
        .replace(/ـ/g, "")               // الكشيدة
        .replace(/[\u200F\u200E]/g, "")  // علامات RTL/LTR الضمنية
        .replace(/[،؛؟!,.\-–—ـ…«»"“”'‘’():؛\u061B\u061F]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    },

    /** بحث في آيات القرآن — يرجع نتائج [{surah, ayah, surahName, text, normText}] */
    search(query, limit) {
      const q = this.normalizeArabic(query);
      if (!q || q.length < 2) return [];
      const tokens = q.split(/\s+/).filter(Boolean);
      const results = [];
      const all = this.all();
      for (const s of all) {
        const display = this.ayahsForDisplay(s.number);
        for (const a of display) {
          const nText = this.normalizeArabic(a.text);
          if (!nText) continue;
          // المطابقة: إما النص يحوي الاستعلام كاملًا، أو كل كلمات الاستعلام تظهر بنفس الترتيب
          let hit = false;
          if (nText.includes(q)) hit = true;
          else if (tokens.length > 1) {
            // ترتيب الكلمات: تحقق من أن كل token يأتي بعد السابق
            let pos = 0, allFound = true;
            for (const tk of tokens) {
              const idx = nText.indexOf(tk, pos);
              if (idx < 0) { allFound = false; break; }
              pos = idx + tk.length;
            }
            if (allFound) hit = true;
          }
          if (hit) {
            results.push({
              surah: s.number,
              ayah: a.number,
              surahName: s.name,
              revelationType: s.revelationType,
              text: a.text,
              normText: nText
            });
            if (results.length >= (limit || 60)) return results;
          }
        }
      }
      return results;
    },

    suggestNext() {
      const st = App.Storage.state;
      const surahs = this.all();
      const direction = (st.settings && st.settings.memorizationDirection) || "backward";
      const sorted = surahs.slice().sort((a, b) =>
        direction === "backward" ? b.number - a.number : a.number - b.number
      );
      for (const s of sorted) {
        const p = st.progress[s.number];
        if (p && p.status === "learning" && (p.memorized || []).length < s.ayahsCount) return s;
      }
      const notMastered = sorted.filter(s => {
        const p = st.progress[s.number];
        return !p || p.status !== "mastered";
      }).sort((a, b) => a.ayahsCount - b.ayahsCount);
      return notMastered[0] || sorted[0];
    },

    progressOf(n) {
      const st = App.Storage.state;
      const p = st.progress[n];
      const s = this.surah(n);
      if (!s) return { pct: 0, memorized: 0, status: "new", mastery: 0 };
      const memorized = p ? (p.memorized || []).length : 0;
      return {
        pct: Math.round((memorized / s.ayahsCount) * 100),
        memorized,
        status: p ? p.status : "new",
        mastery: p ? (p.mastery || 0) : 0
      };
    },

    /* ============================================================
       مدخل مدينة القرآن — بطاقة واحدة فقط: "القرآن الكريم"
       ============================================================ */
    pageQuranCity() {
      if (!this.data) {
        return {
          nav: "quran",
          html: App.loadingHtml(),
          mount() {
            App.Quran.load().then(() => App.Router.render()).catch(() => App.toast("تعذّر تحميل بيانات القرآن", "error"));
          }
        };
      }
      const last = App.Storage.state.lastAyah;
      const lastS = last && last.s ? Q.surah(last.s) : null;
      const surahsCount = Q.all().length;

      return {
        nav: "quran",
        html: `
        <header class="screen-head">
          <div class="sh-title">
            <h1>مدينة القرآن</h1>
            <p>${App.arDigits(surahsCount)} سورة · ${App.arDigits(Q.data.meta.ayahsCount)} آية</p>
          </div>
        </header>

        <button class="quran-city-card btn-block" data-href="#/mushaf" aria-label="افتح المصحف">
          <div class="qcc-bg" aria-hidden="true">
            <div class="qcc-pattern"></div>
            <div class="qcc-ornament">۞</div>
          </div>
          <div class="qcc-content">
            <span class="qcc-icon"><span class="ico" data-ico="bookOpen"></span></span>
            <span class="qcc-title">القرآن الكريم</span>
            <span class="qcc-sub">افتح المصحف</span>
            ${lastS ? `<span class="qcc-resume"><span class="ico" data-ico="bookmark"></span> آخر قراءتك: سورة ${lastS.name} — الآية ${App.arDigits(last.a)}</span>` : `<span class="qcc-resume"><span class="ico" data-ico="sparkle"></span> ابدأ من الفاتحة</span>`}
          </div>
        </button>

        <p class="center tiny text-faint mt-16">${Q.bismillah()}</p>
        `,
        mount() {}
      };
    },

    /* ============================================================
       قارئ المصحف الموحّد — الصفحة الرئيسية للقرآن
       ============================================================ */
    pageMushaf(params) {
      // انتظر تحميل بيانات القرآن أولًا
      if (!this.data) {
        return {
          nav: "quran",
          html: App.loadingHtml(),
          mount() {
            this._mountMushafLoading = true;
            App.Quran.load().then(() => App.Router.render()).catch(() => App.toast("تعذّر تحميل بيانات القرآن", "error"));
          }
        };
      }
      // اختيار السورة: من المسار، أو آخر موضع، أو الفاتحة
      let surahNo = Number(params && params.surah);
      if (!surahNo) {
        const last = App.Storage.state.lastAyah;
        if (last && last.s) surahNo = last.s;
        else surahNo = 1;
      }
      const ayahNo = Number(params && params.ayah) || (surahNo === App.Storage.state.lastAyah.s ? App.Storage.state.lastAyah.a : 1) || 1;

      const s = Q.surah(surahNo);
      if (!s) return { nav: "quran", html: App.emptyHtml("السورة غير موجودة") };

      const showBismillah = Q.startsWithBismillah(surahNo);
      const ayahs = Q.ayahsForDisplay(surahNo);
      const fs = App.Storage.getSettings().quranFontSize === "lg" ? "lg" : "md";
      const last = App.Storage.state.lastAyah;
      const isContinuing = last && last.s === surahNo && last.a && last.a > 1 && !params.ayah;

      // بناء نص المصحف (الآيات مدمجة في صفحة واحدة، مع علامات الآيات)
      const mushafText = ayahs.map(a => {
        const isCurrent = a.number === ayahNo;
        return `<span class="ayah-segment${isCurrent ? " current" : ""}" data-surah="${s.number}" data-ayah="${a.number}" data-ayah-text="${App.esc(a.text)}">${a.text}<span class="ayah-marker${isCurrent ? " current" : ""}" data-surah="${s.number}" data-ayah="${a.number}" role="button" aria-label="الآية ${App.arDigits(a.number)}">${App.arDigits(a.number)}</span></span>`;
      }).join(" ");

      // ترقيم صفحات المصحف الحقيقي (تقريبي — يقسم السورة على ~15 آية لكل صفحة)
      const pageNumber = Math.ceil(ayahNo / 15) || 1;

      return {
        nav: "quran",
        html: `
        <header class="mushaf-head" id="mushafHead">
          <button class="icon-btn" data-action="mushaf-index" aria-label="فهرس القرآن">
            <span class="ico" data-ico="list"></span>
          </button>
          <div class="mushaf-head-title">
            <div class="mht-name">سورة ${s.name}</div>
            <div class="mht-meta">${s.revelationType} · ${App.arDigits(s.ayahsCount)} آية</div>
          </div>
          <button class="icon-btn" data-action="mushaf-search" aria-label="بحث في القرآن">
            <span class="ico" data-ico="search"></span>
          </button>
        </header>

        ${isContinuing ? `
        <div class="mushaf-resume-hint">
          <span class="ico" data-ico="bookmark"></span>
          <span>تتابع من الآية ${App.arDigits(ayahNo)}</span>
          <button class="mr-link" data-href="#/mushaf/${surahNo}/1">البداية</button>
        </div>` : ""}

        <div class="mushaf-page mushaf-page-reader" id="mushafPage">
          <span class="mushaf-corner-tl" aria-hidden="true"><svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"><path d="M2 2 L18 2 M2 2 L2 18 M2 2 Q10 4 14 8 Q18 12 18 18 M2 2 Q8 6 10 10 Q12 14 12 18" fill="none" stroke="#A88445" stroke-width="1.2" stroke-linecap="round"/><circle cx="6" cy="6" r="2" fill="#A88445" opacity="0.5"/></svg></span>
          <span class="mushaf-corner-tr" aria-hidden="true"><svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"><path d="M2 2 L18 2 M2 2 L2 18 M2 2 Q10 4 14 8 Q18 12 18 18 M2 2 Q8 6 10 10 Q12 14 12 18" fill="none" stroke="#A88445" stroke-width="1.2" stroke-linecap="round"/><circle cx="6" cy="6" r="2" fill="#A88445" opacity="0.5"/></svg></span>
          <span class="mushaf-corner-bl" aria-hidden="true"><svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"><path d="M2 2 L18 2 M2 2 L2 18 M2 2 Q10 4 14 8 Q18 12 18 18 M2 2 Q8 6 10 10 Q12 14 12 18" fill="none" stroke="#A88445" stroke-width="1.2" stroke-linecap="round"/><circle cx="6" cy="6" r="2" fill="#A88445" opacity="0.5"/></svg></span>
          <span class="mushaf-corner-br" aria-hidden="true"><svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"><path d="M2 2 L18 2 M2 2 L2 18 M2 2 Q10 4 14 8 Q18 12 18 18 M2 2 Q8 6 10 10 Q12 14 12 18" fill="none" stroke="#A88445" stroke-width="1.2" stroke-linecap="round"/><circle cx="6" cy="6" r="2" fill="#A88445" opacity="0.5"/></svg></span>
          <div class="mushaf-topline">
            <span>الجزء ${App.arDigits(Q.surahJuz(surahNo))}</span>
            <span>سُورَةُ ${s.name}</span>
          </div>
          <div class="mushaf-ornament" aria-hidden="true">۞</div>
          <div class="mushaf-surah-name">${s.name}</div>
          ${showBismillah ? `<div class="mushaf-bismillah">${Q.bismillah()}</div>` : ""}
          <div class="mushaf-text ${fs}" id="mushafText">${mushafText}</div>
          <div class="mushaf-page-number">${App.arDigits(pageNumber)}</div>
        </div>

        <div class="mushaf-toolbar" id="mushafToolbar">
          <button class="mt-btn" data-action="mushaf-prev-ayah" aria-label="السابق">
            <span class="ico" data-ico="prev"></span>
          </button>
          <button class="mt-btn mt-play" data-action="mushaf-play" aria-label="تشغيل التلاوة">
            <span class="ico" data-ico="play"></span>
          </button>
          <button class="mt-btn mt-mic" data-action="mushaf-tasmee" aria-label="التسميع">
            <span class="ico" data-ico="mic"></span>
          </button>
          <button class="mt-btn" data-action="mushaf-next-ayah" aria-label="التالي">
            <span class="ico" data-ico="next"></span>
          </button>
        </div>
        `,
        mount(el) {
          Q._mountMushaf(el, { surah: surahNo, ayah: ayahNo });
        }
      };
    },

    /** تقسيم تقريبي للجزء من رقم السورة — لعرض الترويسة فقط */
    surahJuz(n) {
      const map = {1:1,2:1,3:2,4:4,5:6,6:7,7:8,8:9,9:10,10:11,11:11,12:12,13:13,14:15,15:16,16:16,17:17,18:18,19:19,20:20,21:21,22:22,23:23,24:24,25:25,26:26,27:27,28:28,29:28,30:29,31:30,32:30,33:33,34:34,35:35,36:36,37:37,38:38,39:39,40:40,41:41,42:42,43:43,44:44,45:45,46:46,47:47,48:48,49:49,50:50,51:51,52:52,53:53,54:54,55:55,56:56,57:57,58:58,59:59,60:60,61:61,62:62,63:63,64:64,65:65,66:66,67:67,68:68,69:69,70:70,71:71,72:72,73:73,74:74,75:75,76:76,77:77,78:78,79:79,80:80,81:81,82:82,83:83,84:84,85:85,86:86,87:87,88:88,89:89,90:90,91:91,92:92,93:93,94:94,95:95,96:96,97:97,98:98,99:99,100:100,101:101,102:102,103:103,104:104,105:105,106:106,107:107,108:108,109:109,110:110,111:111,112:112,113:113,114:114};
      return map[n] || 1;
    },

    /* ============================================================
       منطق تثبيت قارئ المصحف — التمرير للآية الحالية + ربط الصوت
       ============================================================ */
    _mountMushaf(el, opts) {
      const surahNo = opts.surah;
      let ayahNo = opts.ayah;
      const s = Q.surah(surahNo);
      if (!s) return;

      // حفظ الموضع الحالي
      App.Storage.setLastAyah(surahNo, ayahNo);
      App.Storage.touchToday();

      // التمرير للآية الحالية
      setTimeout(() => {
        const cur = el.querySelector(`.ayah-segment.current`);
        if (cur) {
          try { cur.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
        }
      }, 100);

      // ضبط مشغل المصحف
      const list = s.ayahs.map(a => ({ surah: s.number, ayah: a.number }));
      const settings = App.Storage.getSettings();
      if (settings.reciter !== "Minshawy_Murattal_128kbps") {
        App.Storage.setSetting("reciter", "Minshawy_Murattal_128kbps");
      }

      App.Player.renderMushafPlayer(el, {
        list,
        loop: false,
        scopeAutoplay: true,
        title: "سورة " + s.name,
        autoStart: false,
        mode: "tilawah"
      }, el);

      // ربط تحديثات حالة المشغل بالآية الحالية
      const unsub = App.Player.onState((state) => {
        if (!state.item) return;
        el.querySelectorAll(".ayah-segment").forEach(seg => seg.classList.remove("current"));
        el.querySelectorAll(".ayah-marker").forEach(m => m.classList.remove("current", "playing"));
        const cur = el.querySelector(`.ayah-segment[data-surah="${state.item.surah}"][data-ayah="${state.item.ayah}"]`);
        const curMarker = el.querySelector(`.ayah-marker[data-surah="${state.item.surah}"][data-ayah="${state.item.ayah}"]`);
        if (cur) {
          cur.classList.add("current");
          if (state.playing) cur.classList.add("playing");
          if (curMarker) {
            curMarker.classList.add("current");
            if (state.playing) curMarker.classList.add("playing");
          }
          try { cur.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
          // تحديث الموضع المخزّن
          if (state.playing) App.Storage.setLastAyah(state.item.surah, state.item.ayah);
        }
        // تحديث زر التشغيل
        const playBtn = el.querySelector(".mt-play .ico");
        if (playBtn) playBtn.innerHTML = App.icons[state.loading ? "loader" : (state.playing ? "pause" : "play")];
      });
      App.Router.onLeave(unsub);

      // النقر على آية: شغّلها مباشرة
      el.addEventListener("click", (e) => {
        const marker = e.target.closest(".ayah-marker");
        if (!marker) return;
        e.preventDefault();
        const ayah = Number(marker.dataset.ayah);
        App.Storage.setLastAyah(surahNo, ayah);
        const idx = list.findIndex(it => it.surah === surahNo && it.ayah === ayah);
        if (idx >= 0) {
          App.Player.play(idx);
        }
      });
    }
  };

  /* ============================================================
     الأفعال الخاصة بقارئ المصحف
     ============================================================ */

  // فهرس القرآن — Bottom Sheet Drawer
  App.actions["mushaf-index"] = () => {
    Q._openIndex();
  };

  App.actions["mushaf-search"] = () => {
    Q._openSearch();
  };

  App.actions["mushaf-play"] = () => {
    if (App.Player && App.Player.audio) {
      App.Player.toggle();
    } else {
      // ابدأ من الآية الحالية
      const last = App.Storage.state.lastAyah;
      if (last && last.s) {
        const s = Q.surah(last.s);
        if (s) {
          const list = s.ayahs.filter(a => a.number >= last.a).map(a => ({ surah: last.s, ayah: a.number }));
          App.Player.load(list, { scopeAutoplay: true });
          App.Player.play(0);
        }
      }
    }
  };

  App.actions["mushaf-prev-ayah"] = () => {
    const last = App.Storage.state.lastAyah;
    if (!last || !last.s) return;
    const s = Q.surah(last.s);
    if (!s) return;
    const prev = Math.max(1, last.a - 1);
    App.Router.go(`#/mushaf/${last.s}/${prev}`);
  };

  App.actions["mushaf-next-ayah"] = () => {
    const last = App.Storage.state.lastAyah;
    if (!last || !last.s) return;
    const s = Q.surah(last.s);
    if (!s) return;
    const next = Math.min(s.ayahsCount, last.a + 1);
    App.Router.go(`#/mushaf/${last.s}/${next}`);
  };

  App.actions["mushaf-tasmee"] = () => {
    const last = App.Storage.state.lastAyah;
    if (!last || !last.s) {
      App.Router.go("#/tasmee");
      return;
    }
    // اذهب إلى صفحة اختيار نطاق التسميع مع السورة الحالية
    App.Router.go(`#/tasmee`);
  };

  App.actions["mushaf-index-pick"] = (el) => {
    const n = Number(el.dataset.surah);
    App.Router.go(`#/mushaf/${n}/1`);
    Q._closeIndex();
  };

  App.actions["mushaf-search-result"] = (el) => {
    const surah = Number(el.dataset.surah);
    const ayah = Number(el.dataset.ayah);
    App.Router.go(`#/mushaf/${surah}/${ayah}`);
    Q._closeSearch();
  };

  App.actions["mushaf-search-run"] = () => {
    const inp = document.getElementById("mushafSearchInput");
    if (!inp) return;
    const q = inp.value.trim();
    Q._renderSearchResults(q);
  };

  App.actions["close-mushaf-index"] = () => Q._closeIndex();
  App.actions["close-mushaf-search"] = () => Q._closeSearch();

  /* ============================================================
     دوائر الفهرس والبحث
     ============================================================ */
  Q._openIndex = function () {
    let drawer = document.getElementById("mushafIndexDrawer");
    if (!drawer) {
      drawer = document.createElement("div");
      drawer.id = "mushafIndexDrawer";
      drawer.className = "mushaf-drawer-backdrop hidden";
      drawer.innerHTML = `
        <div class="mushaf-drawer" role="dialog" aria-modal="true" aria-label="فهرس القرآن">
          <div class="md-head">
            <span class="md-title">فهرس القرآن</span>
            <button class="icon-btn" data-action="close-mushaf-index" aria-label="إغلاق"><span class="ico" data-ico="x"></span></button>
          </div>
          <div class="md-search-mini">
            <input type="search" id="indexFilter" placeholder="ابحث باسم السورة..." aria-label="بحث في الفهرس">
          </div>
          <div class="md-list" id="mushafIndexList"></div>
        </div>`;
      document.body.appendChild(drawer);
      App.fillIcons(drawer);

      // ربط إغلاق بالنقر على الخلفية
      drawer.addEventListener("click", (e) => {
        if (e.target === drawer) Q._closeIndex();
      });

      // ربط حقل البحث
      const filter = drawer.querySelector("#indexFilter");
      filter.addEventListener("input", () => {
        const v = Q.normalizeArabic(filter.value);
        const items = drawer.querySelectorAll(".md-surah");
        items.forEach(it => {
          const name = Q.normalizeArabic(it.dataset.name || "");
          const num = String(it.dataset.number || "");
          if (!v || name.includes(v) || num === v) {
            it.classList.remove("hidden");
          } else {
            it.classList.add("hidden");
          }
        });
      });
    }

    // تعبئة القائمة
    const list = drawer.querySelector("#mushafIndexList");
    const surahs = Q.all().slice().sort((a, b) => a.number - b.number);
    const last = App.Storage.state.lastAyah;
    list.innerHTML = surahs.map(s => {
      const isActive = last && last.s === s.number;
      return `
      <button class="md-surah${isActive ? " active" : ""}" data-action="mushaf-index-pick" data-surah="${s.number}" data-name="${App.esc(s.name)}" data-number="${App.arDigits(s.number)}">
        <span class="md-surah-num">${App.arDigits(s.number)}</span>
        <span class="md-surah-info">
          <span class="md-surah-name">سورة ${s.name}</span>
          <span class="md-surah-meta">${s.revelationType} · ${App.arDigits(s.ayahsCount)} آية</span>
        </span>
        ${isActive ? '<span class="md-active-dot" aria-hidden="true"></span>' : ''}
      </button>`;
    }).join("");
    App.fillIcons(list);

    drawer.classList.remove("hidden");
    // التمرير للسورة الحالية
    if (last && last.s) {
      const active = list.querySelector(`.md-surah.active`);
      if (active) {
        try { active.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
      }
    }
  };

  Q._closeIndex = function () {
    const drawer = document.getElementById("mushafIndexDrawer");
    if (drawer) drawer.classList.add("hidden");
  };

  Q._openSearch = function () {
    let panel = document.getElementById("mushafSearchPanel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "mushafSearchPanel";
      panel.className = "mushaf-drawer-backdrop hidden";
      panel.innerHTML = `
        <div class="mushaf-drawer mushaf-search-panel" role="dialog" aria-modal="true" aria-label="بحث في القرآن">
          <div class="md-head">
            <span class="md-title">بحث في القرآن</span>
            <button class="icon-btn" data-action="close-mushaf-search" aria-label="إغلاق"><span class="ico" data-ico="x"></span></button>
          </div>
          <div class="md-search-box">
            <input type="search" id="mushafSearchInput" placeholder="اكتب كلمة أو جملة..." enterkeyhint="search" aria-label="بحث">
            <button class="btn btn-primary" data-action="mushaf-search-run">
              <span class="ico" data-ico="search"></span> بحث
            </button>
          </div>
          <div class="md-results" id="mushafSearchResults">
            <div class="md-results-empty">اكتب كلمة مثل «الحمد لله» للبحث في القرآن الكريم</div>
          </div>
        </div>`;
      document.body.appendChild(panel);
      App.fillIcons(panel);

      panel.addEventListener("click", (e) => {
        if (e.target === panel) Q._closeSearch();
      });

      const input = panel.querySelector("#mushafSearchInput");
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          App.actions["mushaf-search-run"]();
        }
      });

      // بحث حي مع تأخير
      let t = null;
      input.addEventListener("input", () => {
        clearTimeout(t);
        t = setTimeout(() => Q._renderSearchResults(input.value.trim()), 350);
      });
    }
    panel.classList.remove("hidden");
    setTimeout(() => {
      const input = panel.querySelector("#mushafSearchInput");
      if (input) input.focus();
    }, 100);
  };

  Q._closeSearch = function () {
    const panel = document.getElementById("mushafSearchPanel");
    if (panel) panel.classList.add("hidden");
  };

  Q._renderSearchResults = function (query) {
    const box = document.getElementById("mushafSearchResults");
    if (!box) return;
    if (!query || query.length < 2) {
      box.innerHTML = '<div class="md-results-empty">اكتب كلمتين على الأقل للبحث</div>';
      return;
    }
    box.innerHTML = '<div class="md-results-loading">جارٍ البحث…</div>';
    setTimeout(() => {
      const results = Q.search(query, 60);
      if (!results.length) {
        box.innerHTML = '<div class="md-results-empty">لا توجد نتائج مطابقة — جرّب كلمات أخرى أو اكتب بدون تشكيل</div>';
        return;
      }
      box.innerHTML = `
        <div class="md-results-count">${App.arDigits(results.length)} نتيجة</div>
        ${results.map(r => `
          <button class="md-result" data-action="mushaf-search-result" data-surah="${r.surah}" data-ayah="${r.ayah}">
            <div class="mr-head">
              <span class="mr-surah">سورة ${r.surahName}</span>
              <span class="mr-ayah">الآية ${App.arDigits(r.ayah)}</span>
            </div>
            <div class="mr-text">${Q._highlightMatch(r.text, query)}</div>
          </button>`).join("")}
      `;
      App.fillIcons(box);
    }, 30);
  };

  /** إبراز الكلمات المطابقة في نص النتيجة */
  Q._highlightMatch = function (text, query) {
    const norm = (s) => Q.normalizeArabic(s);
    const tokens = norm(query).split(/\s+/).filter(Boolean);
    if (!tokens.length) return App.esc(text);
    // قسّم النص الأصلي للكلمات مع الحفاظ على المسافات
    const words = String(text).split(/(\s+)/);
    return words.map(w => {
      if (/^\s+$/.test(w)) return w;
      const wn = norm(w);
      const hit = tokens.some(tk => wn.includes(tk) || tk.includes(wn));
      if (hit && wn.length >= 2) return `<mark class="mr-mark">${App.esc(w)}</mark>`;
      return App.esc(w);
    }).join("");
  };

  /* ============================================================
     أفعال متوافقة مع المسارات القديمة (redirects)
     ============================================================ */
  App.actions["ayah-play"] = (el) => {
    const surah = Number(el.dataset.surah);
    const ayah = Number(el.dataset.ayah);
    App.Router.go(`#/mushaf/${surah}/${ayah}`);
    setTimeout(() => App.actions["mushaf-play"](), 200);
  };

  App.actions["surah-play"] = (el) => {
    App.Router.go("#/mushaf/" + el.dataset.surah);
  };

  App.actions["ayah-replay"] = (el) => {
    const tb = el.closest("#ayahToolbar");
    if (!tb) return;
    const surah = Number(tb.dataset.surah);
    const ayah = Number(tb.dataset.ayah);
    App.Router.go(`#/mushaf/${surah}/${ayah}`);
    setTimeout(() => App.actions["mushaf-play"](), 200);
  };

  App.actions["ayah-memorize"] = (el) => {
    const tb = el.closest("#ayahToolbar");
    if (!tb) return;
    const surah = Number(tb.dataset.surah);
    const ayah = Number(tb.dataset.ayah);
    const s = Q.surah(surah);
    if (!s) return;
    const end = Math.min(s.ayahsCount, ayah + 4);
    App.Range.set(surah, ayah, end);
    App.Router.go("#/journey/" + surah);
  };

  App.actions["ayah-recite"] = (el) => {
    const tb = el.closest("#ayahToolbar");
    if (!tb) return;
    const surah = Number(tb.dataset.surah);
    const ayah = Number(tb.dataset.ayah);
    App.Router.go(`#/mushaf/${surah}/${ayah}`);
    setTimeout(() => App.actions["mushaf-play"](), 200);
  };

  App.actions["recite-jump"] = () => {
    Q._openIndex();
  };

  App.Quran = Q;
})();
