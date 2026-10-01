/* ============================================================
   رفيق القرآن للأطفال — quran.js
   مدينة القرآن: بيانات جزء عمّ + التبويبات + عرض السور والآيات
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  const Q = {
    data: null,
    _loading: null,

    load() {
      if (this.data) return Promise.resolve(this.data);
      if (this._loading) return this._loading;
      this._loading = fetch("./data/quran.json")
        .then(r => {
          if (!r.ok) throw new Error("quran.json HTTP " + r.status);
          return r.json();
        })
        .then(json => {
          this.data = json;
          return json;
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
    bismillah() { return this.data ? this.data.meta.bismillah : "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"; },

    /** السورة التالية المقترحة للحفظ: أول سورة غير مكتملة (مفضلة القصير) */
    suggestNext() {
      const st = App.Storage.state;
      const surahs = this.all();
      // first: incomplete started surah
      for (const s of surahs) {
        const p = st.progress[s.number];
        if (p && p.status === "learning" && (p.memorized || []).length < s.ayahsCount) return s;
      }
      // then: shortest not mastered
      const notMastered = surahs.filter(s => {
        const p = st.progress[s.number];
        return !p || p.status !== "mastered";
      }).sort((a, b) => a.ayahsCount - b.ayahsCount);
      return notMastered[0] || surahs[0];
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

    /* ================= مدينة القرآن ================= */
    pageQuran(params) {
      const tab = (params && params.tab) || "memorize";
      const bism = Q.bismillah();
      const last = App.Storage.state.lastAyah;
      const lastS = Q.surah(last.s);
      const suggest = Q.suggestNext();

      const tabs = [
        { id: "memorize", label: "حفظ جديد" },
        { id: "surahs", label: "السور" },
        { id: "recite", label: "التلاوة" },
        { id: "repeat", label: "التكرار" }
      ];

      let body = "";
      if (tab === "memorize") body = Q.tabMemorize(suggest);
      else if (tab === "surahs") body = Q.tabSurahs();
      else if (tab === "recite") body = Q.tabPick("recite", "التلاوة", "استمع للسورة كاملة بتلاوة جميلة");
      else body = Q.tabPick("repeat", "التكرار", "كرر الآيات حتى تثبت في قلبك");

      return {
        nav: "quran",
        html: `
        <header class="screen-head">
          <div class="sh-title">
            <h1>مدينة القرآن</h1>
            <p>جزء عمّ كامل — ${App.arDigits(37)} سورة</p>
          </div>
          <button class="icon-btn" data-href="#/more/settings" aria-label="الإعدادات"><span class="ico" data-ico="settings"></span></button>
        </header>

        ${lastS ? `
        <button class="card journey-card btn-block" data-href="#/journey/${lastS.number}" style="margin-top:2px">
          <div class="jc-head">
            <span class="jc-ico"><span class="ico" data-ico="bookmark"></span></span>
            <span class="grow" style="text-align:right">
              <span class="jc-title">آخر آية كنت عليها</span>
              <span class="jc-sub">${lastS.name} — الآية ${App.arDigits(last.a)}</span>
            </span>
            <span class="ico" data-ico="chevronLeft" style="color:var(--c-text-faint)"></span>
          </div>
        </button>` : ""}

        <div class="quran-tabs mt-16" role="tablist">
          ${tabs.map(t => `<button class="q-tab ${t.id === tab ? "on" : ""}" role="tab" aria-selected="${t.id === tab}" data-href="#/quran/${t.id}">${t.label}</button>`).join("")}
        </div>

        ${body}

        <p class="center tiny text-faint mt-16">${Q.bismillah()}</p>
        `,
        mount() {}
      };
    },

    tabMemorize(suggest) {
      const pr = Q.progressOf(suggest.number);
      return `
      <div class="card">
        <div class="card-title"><span class="ico" data-ico="sparkle"></span> اقتراح اليوم</div>
        <div class="row-between">
          <div>
            <div class="bold" style="font-size:1.15rem;color:var(--c-primary-deep)">سورة ${suggest.name}</div>
            <div class="small text-soft">${suggest.revelationType} — ${App.arDigits(suggest.ayahsCount)} آية</div>
          </div>
          <button class="btn btn-gold" data-href="#/journey/${suggest.number}">
            <span class="ico" data-ico="rocket"></span> ابدأ الحفظ
          </button>
        </div>
        ${pr.memorized > 0 ? `
        <div class="mt-12">
          <div class="row-between tiny text-soft mb-8"><span>تقدمك</span><span>${App.arDigits(pr.memorized)} / ${App.arDigits(suggest.ayahsCount)}</span></div>
          <div class="progress-track"><div class="progress-fill" style="width:${pr.pct}%"></div></div>
        </div>` : ""}
      </div>
      <div class="section-head"><h2>سور قصيرة مثالية للبداية</h2></div>
      ${Q.surahListHtml(Q.all().filter(s => s.ayahsCount <= 6).slice(0, 6), true)}
      `;
    },

    tabSurahs() {
      const surahs = Q.all().slice().sort((a, b) => a.number - b.number);
      return `<div class="section-head" style="margin-top:0"><h2>سور جزء عمّ</h2><span class="chip chip-gold">${App.arDigits(37)} سورة</span></div>${Q.surahListHtml(surahs, false)}`;
    },

    tabPick(kind, title, sub) {
      const surahs = Q.all().slice().sort((a, b) => a.number - b.number);
      return `
      <div class="card">
        <div class="card-title"><span class="ico" data-ico="${kind === "recite" ? "headphones" : "loop"}"></span> ${title}</div>
        <p class="small text-soft">${sub}</p>
      </div>
      <div class="mt-12">
      ${surahs.map(s => `
        <button class="surah-item" data-href="#/${kind}/${s.number}">
          <span class="surah-num">${App.arDigits(s.number)}</span>
          <span class="surah-info">
            <span class="surah-name">سورة ${s.name}</span>
            <span class="surah-meta">${s.revelationType} — ${App.arDigits(s.ayahsCount)} آية</span>
          </span>
          <span class="ico" data-ico="${kind === "recite" ? "play" : "loop"}" style="color:var(--c-primary)"></span>
        </button>`).join("")}
      </div>`;
    },

    surahListHtml(surahs, simple) {
      return surahs.map(s => {
        const pr = Q.progressOf(s.number);
        const cls = pr.status === "mastered" ? "done" : (pr.memorized > 0 ? "learning" : "");
        const statusTxt = pr.status === "mastered" ? "أتقنتها" : (pr.memorized > 0 ? `حفظت ${App.arDigits(pr.memorized)}` : "جديدة");
        const chipCls = pr.status === "mastered" ? "chip-success" : (pr.memorized > 0 ? "chip-gold" : "");
        const ring = pr.status === "mastered" || pr.memorized > 0
          ? `<div class="ring ring-sm">${App.ringSvg(40, 4, pr.pct, pr.status === "mastered" ? "green" : "")}<span class="ring-center">${App.arDigits(pr.pct)}</span></div>`
          : "";
        return `
        <button class="surah-item ${cls}" data-href="#/surah/${s.number}">
          <span class="surah-num">${App.arDigits(s.number)}</span>
          <span class="surah-info">
            <span class="surah-name">سورة ${s.name} <span class="chip ${chipCls} status-chip">${statusTxt}</span></span>
            <span class="surah-meta">${s.revelationType} — ${App.arDigits(s.ayahsCount)} آية</span>
            ${pr.memorized > 0 && pr.status !== "mastered" ? `<div class="progress-track surah-prog"><div class="progress-fill" style="width:${pr.pct}%"></div></div>` : ""}
          </span>
          ${ring}
        </button>`;
      }).join("");
    },

    /* ================= تفاصيل السورة ================= */
    pageSurah(params) {
      const n = Number(params.id);
      const s = Q.surah(n);
      if (!s) return { nav: "quran", html: App.emptyHtml("السورة غير موجودة") };

      const pr = Q.progressOf(n);
      const fsClass = App.Storage.getSettings().quranFontSize === "sm" ? "md" : (App.Storage.getSettings().quranFontSize === "lg" ? "lg" : "");

      const ayahsHtml = s.ayahs.map(a => `
        <button class="ayah-row" data-action="ayah-play" data-surah="${s.number}" data-ayah="${a.number}">
          <div class="ayah-text ${fsClass}">${a.text}<span class="ayah-badge">${App.arDigits(a.number)}</span></div>
        </button>`).join("");

      return {
        nav: "quran",
        html: `
        <header class="screen-head">
          <button class="icon-btn btn-back" data-href="#/quran" aria-label="رجوع"><span class="ico" data-ico="chevronRight"></span></button>
          <div class="sh-title"><h1>سورة ${s.name}</h1><p>${s.revelationType} — ${App.arDigits(s.ayahsCount)} آية</p></div>
        </header>

        <div class="surah-header-card">
          <div class="shc-name">سُورَةُ ${s.name}</div>
          <div class="shc-meta">
            <span class="chip">${s.revelationType}</span>
            <span class="chip">جزء عمّ</span>
            <span class="chip">${App.arDigits(s.ayahsCount)} آية</span>
          </div>
        </div>

        <div class="bismillah">${Q.bismillah()}</div>

        <div class="card">
          ${pr.memorized > 0 ? `
          <div class="row-between mb-8">
            <span class="small bold text-soft">تقدمك في الحفظ</span>
            <span class="chip chip-gold">${App.arDigits(pr.pct)}٪</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${pr.pct}%"></div></div>` : ""}
          <div class="ayah-actions">
            <button class="btn btn-gold grow" data-href="#/journey/${s.number}">
              <span class="ico" data-ico="rocket"></span> ${pr.status === "mastered" ? "أعد رحلة الإتقان" : (pr.memorized > 0 ? "أكمل الحفظ" : "ابدأ رحلة الحفظ")}
            </button>
            <button class="btn btn-soft" data-action="surah-play" data-surah="${s.number}">
              <span class="ico" data-ico="headphones"></span> تلاوة
            </button>
            <button class="btn btn-soft" data-action="surah-loop" data-surah="${s.number}">
              <span class="ico" data-ico="loop"></span> تكرار
            </button>
          </div>
        </div>

        <div class="section-head"><h2>الآيات</h2><span class="tiny text-faint">اضغط على الآية للاستماع</span></div>
        ${ayahsHtml}
        `,
        mount(el) {}
      };
    },

    /* ================= التلاوة / التكرار للسورة كاملة ================= */
    pageMode(params) {
      const kind = params.kind || "recite";
      const n = Number(params.id);
      const s = Q.surah(n);
      if (!s) return { nav: "quran", html: App.emptyHtml("السورة غير موجودة") };
      const isRecite = kind === "recite";

      return {
        nav: "quran",
        html: `
        <header class="screen-head">
          <button class="icon-btn btn-back" data-href="#/quran" aria-label="رجوع"><span class="ico" data-ico="chevronRight"></span></button>
          <div class="sh-title"><h1>${isRecite ? "تلاوة" : "تكرار"} — سورة ${s.name}</h1><p>${App.arDigits(s.ayahsCount)} آية</p></div>
        </header>
        <div class="card">
          <div id="modePlayer"></div>
        </div>
        <div class="card">
          <div class="bismillah" style="margin-bottom:6px">${Q.bismillah()}</div>
          <div class="ayah-text md">${s.ayahs.map(a => `${a.text}<span class="ayah-badge">${App.arDigits(a.number)}</span>`).join(" ")}</div>
        </div>
        `,
        mount(el) {
          const host = el.querySelector("#modePlayer");
          App.Player.renderPlayer(host, {
            list: s.ayahs.map(a => ({ surah: s.number, ayah: a.number })),
            loop: !isRecite,
            title: "سورة " + s.name
          });
        }
      };
    }
  };

  /* ---------- actions ---------- */
  App.actions["ayah-play"] = (el) => {
    const surah = Number(el.dataset.surah);
    const ayah = Number(el.dataset.ayah);
    const s = Q.surah(surah);
    App.Player.renderAndPlayFloating(surah, ayah, s ? s.name : "");
    document.querySelectorAll(".ayah-row").forEach(r => r.classList.remove("current"));
    el.classList.add("current");
    App.Player.onState(() => {
      if (App.Player.currentItem() && App.Player.currentItem().ayah !== ayah) el.classList.remove("current");
    });
  };

  App.actions["surah-play"] = (el) => {
    App.Router.go("#/recite/" + el.dataset.surah);
  };
  App.actions["surah-loop"] = (el) => {
    App.Router.go("#/repeat/" + el.dataset.surah);
  };

  App.Quran = Q;
})();
