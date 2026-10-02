/* ============================================================
   رفيق القرآن للأطفال — storage.js
   طبقة التخزين المحلي: حالة واحدة (single state) في localStorage
   مصممة بحيث يمكن استبدالها لاحقًا بـ Supabase بدون إعادة بناء.
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};
App.version = "1.0.0";

(function () {
  "use strict";

  const KEY = "rafiq_state_v1";

  function todayKey(d) {
    const t = d || new Date();
    return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
  }

  function defaults() {
    return {
      v: 1,
      createdAt: Date.now(),
      profile: {
        name: "",
        avatar: "falcon",
        onboarded: false
      },
      settings: {
        reciter: "Minshawi_Murattal_128kbps",
        speed: 1,
        repeatCount: 3,
        quranFontSize: "md",
        soundEffects: true,
        uiSounds: true,        // مؤثرات الواجهة فقط (ضغط/انتقال) — منفصلة عن القرآن
        showTranslationless: true,
        autoPlay: true,
        theme: "auto",        // "light" | "dark" | "auto"
        memorizationDirection: "backward"  // "backward" (من الناس → يس) | "forward" (من يس → الناس)
      },
      progress: {},          // { "<surahNo>": SurahProg }
      session: null,         // رحلة الحفظ الجارية
      mistakeBank: [],       // [{s, a, count, ts}]
      rewards: {
        stars: 0,
        points: 0,
        badges: [],          // badge ids
        achievements: []     // [{id, ts}]
      },
      stats: {
        learningSeconds: 0,
        dailySeconds: {},    // {"YYYY-MM-DD": sec}
        activeDays: [],      // ["YYYY-MM-DD"]
        quizCorrect: 0,
        quizWrong: 0,
        recordings: 0,
        reviewsDone: 0,
        storiesRead: [],
        moralsDone: []
      },
      dailyNotes: {},        // {"YYYY-MM-DD": "نص ملاحظة"} — يوميات الطفل
      ranges: [],            // [{id,label,surah,from,to,createdAt,lastUsedAt}] — أوراد محفوظة
      lastAyah: { s: 112, a: 1 }
    };
  }

  /* SurahProg shape:
     {
       status: "new" | "learning" | "mastered",
       memorized: [ayahNo...],
       mastery: 0..100,
       interval: days, nextReview: "YYYY-MM-DD",
       lastReview: ts, reviewCount: 0,
       completedAt: ts|null
     } */

  const Storage = {
    state: null,
    _saveTimer: null,

    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.state = Object.assign(defaults(), parsed);
          this.state.settings = Object.assign(defaults().settings, parsed.settings || {});
          this.state.rewards = Object.assign(defaults().rewards, parsed.rewards || {});
          this.state.stats = Object.assign(defaults().stats, parsed.stats || {});
          this.state.profile = Object.assign(defaults().profile, parsed.profile || {});
          this.state.v = 1; // migration point for future versions
        } else {
          this.state = defaults();
        }
      } catch (e) {
        console.warn("storage load failed, using defaults", e);
        this.state = defaults();
      }
      return this.state;
    },

    save() {
      clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(() => {
        try {
          localStorage.setItem(KEY, JSON.stringify(this.state));
        } catch (e) {
          console.warn("storage save failed", e);
        }
      }, 220);
    },

    saveNow() {
      clearTimeout(this._saveTimer);
      try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch (e) { /* full */ }
    },

    /* ---------- profile / settings ---------- */
    getProfile() { return this.state.profile; },
    setProfile(patch) {
      Object.assign(this.state.profile, patch);
      this.save();
    },
    getSettings() { return this.state.settings; },
    setSetting(k, v) {
      this.state.settings[k] = v;
      this.save();
    },

    /* ---------- progress per surah ---------- */
    prog(surahNo) {
      return this.state.progress[surahNo] || null;
    },
    ensureProg(surahNo) {
      if (!this.state.progress[surahNo]) {
        this.state.progress[surahNo] = {
          status: "learning",
          memorized: [],
          mastery: 0,
          interval: 1,
          nextReview: null,
          lastReview: null,
          reviewCount: 0,
          completedAt: null
        };
      }
      return this.state.progress[surahNo];
    },
    updateProg(surahNo, patch) {
      const p = this.ensureProg(surahNo);
      Object.assign(p, patch);
      this.save();
      return p;
    },

    /* ---------- rewards ---------- */
    getRewards() { return this.state.rewards; },
    addStars(n) { this.state.rewards.stars += n; this.save(); },
    addPoints(n) { this.state.rewards.points = Math.max(0, this.state.rewards.points + n); this.save(); },
    addBadge(id) {
      if (!this.state.rewards.badges.includes(id)) {
        this.state.rewards.badges.push(id);
        this.state.rewards.achievements.push({ id, ts: Date.now() });
        this.save();
        return true;
      }
      return false;
    },
    hasBadge(id) { return this.state.rewards.badges.includes(id); },

    /* ---------- mistakes bank ---------- */
    addMistake(surahNo, ayahNo) {
      const found = this.state.mistakeBank.find(m => m.s === surahNo && m.a === ayahNo);
      if (found) { found.count++; found.ts = Date.now(); }
      else this.state.mistakeBank.push({ s: surahNo, a: ayahNo, count: 1, ts: Date.now() });
      this.save();
    },
    resolveMistake(surahNo, ayahNo) {
      const i = this.state.mistakeBank.findIndex(m => m.s === surahNo && m.a === ayahNo);
      if (i > -1) {
        this.state.mistakeBank[i].count--;
        if (this.state.mistakeBank[i].count <= 0) this.state.mistakeBank.splice(i, 1);
        this.save();
      }
    },
    getMistakes() { return this.state.mistakeBank.slice().sort((x, y) => y.ts - x.ts); },

    /* ---------- stats ---------- */
    bumpStat(field, n) {
      this.state.stats[field] = (this.state.stats[field] || 0) + n;
      this.save();
    },
    touchToday() {
      const t = todayKey();
      if (!this.state.stats.activeDays.includes(t)) {
        this.state.stats.activeDays.push(t);
        // keep last 400 days
        if (this.state.stats.activeDays.length > 400) this.state.stats.activeDays.shift();
        this.save();
      }
    },
    addLearningSec(sec) {
      this.state.stats.learningSeconds += sec;
      const t = todayKey();
      this.state.stats.dailySeconds[t] = (this.state.stats.dailySeconds[t] || 0) + sec;
      // prune daily map to 60 days
      const keys = Object.keys(this.state.stats.dailySeconds);
      if (keys.length > 60) {
        keys.sort().slice(0, keys.length - 60).forEach(k => delete this.state.stats.dailySeconds[k]);
      }
      this.save();
    },
    addStoryRead(id) {
      if (!this.state.stats.storiesRead.includes(id)) {
        this.state.stats.storiesRead.push(id);
        this.save();
      }
    },
    addMoralDone(id) {
      if (!this.state.stats.moralsDone.includes(id)) {
        this.state.stats.moralsDone.push(id);
        this.save();
      }
    },

    /* ---------- last position ---------- */
    setLastAyah(s, a) {
      this.state.lastAyah = { s, a };
      this.save();
    },

    /* ---------- الأوراد المحفوظة (saved ranges) ---------- */
    getRanges() {
      // مرتبة حسب آخر استخدام
      return (this.state.ranges || []).slice().sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0));
    },
    getRangeById(id) {
      return (this.state.ranges || []).find(r => r.id === id) || null;
    },
    saveRange({ label, surah, from, to }) {
      const s = Number(surah);
      const f = Number(from);
      const t = Number(to);
      const id = "r_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
      const entry = {
        id,
        label: (label || "").trim() || "ورد بدون اسم",
        surah: s,
        from: f,
        to: t,
        createdAt: Date.now(),
        lastUsedAt: 0
      };
      this.state.ranges = this.state.ranges || [];
      // حدّ أقصى للأوراد المحفوظة (٢٠ وردًا)
      if (this.state.ranges.length >= 20) {
        // احذف الأقدم استخدامًا
        const sorted = this.state.ranges.slice().sort((a, b) => (a.lastUsedAt || 0) - (b.lastUsedAt || 0));
        this.state.ranges = this.state.ranges.filter(r => r.id !== sorted[0].id);
      }
      this.state.ranges.push(entry);
      this.save();
      return entry;
    },
    updateRange(id, patch) {
      const r = this.getRangeById(id);
      if (!r) return false;
      Object.assign(r, patch);
      this.save();
      return true;
    },
    deleteRange(id) {
      const before = (this.state.ranges || []).length;
      this.state.ranges = (this.state.ranges || []).filter(r => r.id !== id);
      const after = this.state.ranges.length;
      if (before !== after) { this.save(); return true; }
      return false;
    },
    touchRange(id) {
      const r = this.getRangeById(id);
      if (r) { r.lastUsedAt = Date.now(); this.save(); }
    },

    /* ---------- يوميات الانتظام (daily notes) ---------- */
    setDailyNote(dateKey, text) {
      const k = dateKey || todayKey();
      const t = (text || "").trim();
      if (t) this.state.dailyNotes[k] = t;
      else delete this.state.dailyNotes[k];
      // تنظيف الملاحظات القديمة (نحتفظ بـ 90 يومًا)
      const keys = Object.keys(this.state.dailyNotes);
      if (keys.length > 90) {
        keys.sort().slice(0, keys.length - 90).forEach(k2 => delete this.state.dailyNotes[k2]);
      }
      this.save();
    },
    getDailyNote(dateKey) {
      const k = dateKey || todayKey();
      return this.state.dailyNotes[k] || "";
    },

    /* ---------- أطول سلسلة (longest streak) ---------- */
    longestStreak() {
      const days = (this.state.stats.activeDays || []).slice().sort();
      if (!days.length) return 0;
      let longest = 1, current = 1;
      for (let i = 1; i < days.length; i++) {
        const a = new Date(days[i] + "T00:00:00");
        const b = new Date(days[i - 1] + "T00:00:00");
        if (Math.round((a - b) / 86400000) === 1) {
          current++;
          if (current > longest) longest = current;
        } else {
          current = 1;
        }
      }
      return longest;
    },

    /* ---------- ثواني يوم محدد ---------- */
    daySeconds(dateKey) {
      return (this.state.stats.dailySeconds[dateKey] || 0);
    },

    /* ---------- عدد الأيام النشطة الكلي ---------- */
    totalActiveDays() {
      return (this.state.stats.activeDays || []).length;
    },

    /* ---------- derived ---------- */
    countMemorizedAyahs() {
      let n = 0;
      Object.values(this.state.progress).forEach(p => { n += (p.memorized || []).length; });
      return n;
    },
    countMasteredSurahs() {
      return Object.values(this.state.progress).filter(p => p.status === "mastered").length;
    },
    streak() {
      const days = this.state.stats.activeDays.slice().sort();
      if (!days.length) return 0;
      const last = new Date(days[days.length - 1] + "T00:00:00");
      const now = new Date(todayKey() + "T00:00:00");
      const diff = Math.round((now - last) / 86400000);
      if (diff > 1) return 0;
      let count = 1;
      for (let i = days.length - 1; i > 0; i--) {
        const a = new Date(days[i] + "T00:00:00");
        const b = new Date(days[i - 1] + "T00:00:00");
        if (Math.round((a - b) / 86400000) === 1) count++;
        else break;
      }
      return diff === 0 ? count : count;
    },

    /* ---------- backup ---------- */
    export() {
      return JSON.stringify({ app: "rafiq-alquran", exportedAt: new Date().toISOString(), state: this.state }, null, 2);
    },
    import(jsonText) {
      try {
        const parsed = JSON.parse(jsonText);
        const st = parsed.state || parsed;
        if (!st || typeof st !== "object" || !("progress" in st)) return false;
        this.state = Object.assign(defaults(), st);
        this.saveNow();
        return true;
      } catch (e) {
        return false;
      }
    },
    reset() {
      this.state = defaults();
      this.saveNow();
    },

    _todayKey: todayKey
  };

  App.Storage = Storage;
  App.todayKey = todayKey;
})();
