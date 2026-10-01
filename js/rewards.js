/* ============================================================
   رفيق القرآن للأطفال — rewards.js
   Stars / Points / Badges / Levels / Achievements + الاحتفالات
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  const LEVELS = [
    { lvl: 1, min: 0, title: "مبتدئ مجتهد" },
    { lvl: 2, min: 100, title: "صاعد نحو الخير" },
    { lvl: 3, min: 250, title: "متقن صغير" },
    { lvl: 4, min: 450, title: "بطل الترديد" },
    { lvl: 5, min: 700, title: "نجم المراجعة" },
    { lvl: 6, min: 1000, title: "حافظ صغير" },
    { lvl: 7, min: 1400, title: "قائد الأبطال" }
  ];

  const BADGES = [
    { id: "first_surah", title: "حافظ جديد", desc: "أكمل أول سورة", icon: "medal" },
    { id: "ayahs_5", title: "خمس آيات", desc: "احفظ 5 آيات", icon: "book" },
    { id: "ayahs_20", title: "عشرون آية", desc: "احفظ 20 آية", icon: "book" },
    { id: "ayahs_50", title: "خمسون آية", desc: "احفظ 50 آية", icon: "bookOpen" },
    { id: "surahs_3", title: "ثلاث سور", desc: "أتقن 3 سور", icon: "trophy" },
    { id: "surahs_10", title: "عشر سور", desc: "أتقن 10 سور", icon: "crown" },
    { id: "juz_amma", title: "بطل جزء عمّ", desc: "أتقن كل السور", icon: "crown" },
    { id: "streak_3", title: "ثلاثة أيام", desc: "3 أيام متتالية", icon: "flame" },
    { id: "streak_7", title: "أسبوع كامل", desc: "7 أيام متتالية", icon: "flame" },
    { id: "recite_10", title: "بطل الترديد", desc: "سجل ترديدك 10 مرات", icon: "mic" },
    { id: "reviews_20", title: "مراجع مجتهد", desc: "أنجح 20 مراجعة", icon: "refresh" },
    { id: "quiz_50", title: "عبقري الاختبارات", desc: "50 إجابة صحيحة", icon: "brain" },
    { id: "perfect_quiz", title: "إتقان تام", desc: "اختبار كامل بلا خطأ", icon: "star" },
    { id: "stories_5", title: "قارئ القصص", desc: "اقرأ 5 قصص", icon: "bookOpen" },
    { id: "morals_7", title: "نجمة الأخلاق", desc: "أكمل 7 مواقف", icon: "leaf" },
    { id: "stars_50", title: "جامع النجوم", desc: "اجمع 50 نجمة", icon: "star" }
  ];

  const Rewards = {
    LEVELS,
    BADGES,

    levelInfo(points) {
      const p = points || 0;
      let cur = LEVELS[0];
      for (const l of LEVELS) if (p >= l.min) cur = l;
      const next = LEVELS.find(l => l.min > cur.min) || null;
      const span = next ? next.min - cur.min : 1;
      const prog = next ? Math.min(100, Math.round(((p - cur.min) / span) * 100)) : 100;
      return { level: cur.lvl, title: cur.title, next, progress: prog };
    },

    /** يمنح النقاط والنجوم ويفحص الأوسمة — ويعيد قائمة الجوائز الجديدة */
    grant({ stars = 0, points = 0, reason = "" }, silent) {
      const st = App.Storage.state;
      const beforeLevel = this.levelInfo(st.rewards.points).level;
      if (stars) App.Storage.addStars(stars);
      if (points) App.Storage.addPoints(points);
      App.Storage.touchToday();

      const newBadges = this.checkBadges();
      const afterLevel = this.levelInfo(st.rewards.points);
      const leveledUp = afterLevel.level > beforeLevel;

      if (!silent) {
        this.celebrate({ stars, points, reason, newBadges, leveledUp, levelInfo: afterLevel });
      }
      return { newBadges, leveledUp, levelInfo: afterLevel };
    },

    checkBadges() {
      const st = App.Storage.state;
      const ayahs = App.Storage.countMemorizedAyahs();
      const mastered = App.Storage.countMasteredSurahs();
      const streak = App.Storage.streak();
      const ctx = {
        first_surah: mastered >= 1,
        ayahs_5: ayahs >= 5,
        ayahs_20: ayahs >= 20,
        ayahs_50: ayahs >= 50,
        surahs_3: mastered >= 3,
        surahs_10: mastered >= 10,
        juz_amma: mastered >= 37,
        streak_3: streak >= 3,
        streak_7: streak >= 7,
        recite_10: st.stats.recordings >= 10,
        reviews_20: st.stats.reviewsDone >= 20,
        quiz_50: st.stats.quizCorrect >= 50,
        stories_5: st.stats.storiesRead.length >= 5,
        morals_7: st.stats.moralsDone.length >= 7,
        stars_50: st.rewards.stars >= 50
      };
      const newly = [];
      BADGES.forEach(b => {
        if (b.id !== "perfect_quiz" && ctx[b.id] && App.Storage.addBadge(b.id)) newly.push(b);
      });
      return newly;
    },

    badgeById(id) { return BADGES.find(b => b.id === id) || null; },

    /** نافذة الاحتفال */
    celebrate({ stars = 0, points = 0, reason = "", newBadges = [], leveledUp = false, levelInfo = null, title = "أحسنت!", sub = "" }) {
      if (App.Storage.getSettings().soundEffects) App.haptic(30);
      const starsHtml = stars > 0 ? `
        <div class="cele-stars">
          ${[1, 2, 3].map(i => `<span class="ico ${i <= Math.min(3, stars) ? "lit" : ""}" data-ico="star"></span>`).join("")}
        </div>` : "";

      const badgesHtml = newBadges.length ? `
        <div class="card mt-12" style="text-align:right">
          <div class="card-title"><span class="ico" data-ico="medal"></span> وسام جديد!</div>
          ${newBadges.map(b => `
          <div class="row mt-8">
            <span class="badge-ico" style="width:40px;height:40px"><span class="ico" data-ico="${b.icon}"></span></span>
            <span><span class="bold">${b.title}</span><br><span class="tiny text-soft">${b.desc}</span></span>
          </div>`).join("")}
        </div>` : "";

      const levelHtml = leveledUp && levelInfo ? `
        <div class="chip chip-gold mt-12" style="font-size:.9rem;padding:8px 16px">
          <span class="ico" data-ico="crown"></span> وصلت للمستوى ${App.arDigits(levelInfo.level)} — ${levelInfo.title}
        </div>` : "";

      App.modal({
        title: "",
        body: `
        <div class="celebrate">
          <div class="cele-ico"><span class="ico" data-ico="trophy"></span></div>
          <h3>${title}</h3>
          ${sub ? `<p>${sub}</p>` : (reason ? `<p>${reason}</p>` : "")}
          ${starsHtml}
          ${points > 0 ? `<div class="chip chip-turquoise" style="margin-top:10px">+ ${App.arDigits(points)} نقطة</div>` : ""}
          ${levelHtml}
          ${badgesHtml}
        </div>`,
        actions: [{ label: "رائع!", action: "close-modal", primary: true }]
      });
      App.confetti();
    },

    /* ---------- شاشة إنجازاتي ---------- */
    pageAchievements() {
      const st = App.Storage.state;
      const li = this.levelInfo(st.rewards.points);
      const unlocked = st.rewards.badges;

      const badgesHtml = BADGES.map(b => `
        <div class="badge-item ${unlocked.includes(b.id) ? "unlocked" : "locked"}">
          <span class="badge-ico"><span class="ico" data-ico="${b.icon}"></span></span>
          <div class="badge-name">${b.title}</div>
          <div class="badge-desc">${b.desc}</div>
        </div>`).join("");

      const levelsHtml = LEVELS.map(l => {
        const cls = l.lvl === li.level ? "current" : (st.rewards.points >= l.min ? "reached" : "");
        return `
        <div class="level-row ${cls}">
          <span class="level-num">${App.arDigits(l.lvl)}</span>
          <span class="grow bold" style="font-size:.88rem">${l.title}</span>
          <span class="tiny text-faint">${App.arDigits(l.min)}+ نقطة</span>
          ${cls === "current" ? '<span class="ico" data-ico="star" style="width:16px;height:16px;color:var(--c-gold-deep)"></span>' : ""}
        </div>`;
      }).join("");

      const achTimeline = st.rewards.achievements.slice().reverse().slice(0, 8).map(a => {
        const b = this.badgeById(a.id);
        const d = new Date(a.ts);
        return `<div class="tl-item">
          <div class="tl-title">${b ? b.title : a.id}</div>
          <div class="tl-date">${d.toLocaleDateString("ar-EG")}</div>
        </div>`;
      }).join("");

      return {
        nav: "more",
        html: `
        <header class="screen-head">
          <button class="icon-btn btn-back" data-href="#/more" aria-label="رجوع"><span class="ico" data-ico="chevronRight"></span></button>
          <div class="sh-title"><h1>إنجازاتي</h1><p>كل ما جمعته في رحلتك</p></div>
        </header>

        <div class="ach-hero">
          <div class="ach-stars-row"><span class="ico" data-ico="star"></span>${App.arDigits(st.rewards.stars)}</div>
          <div class="small mt-8" style="font-weight:700">نجمة</div>
          <div class="row-between mt-12" style="font-weight:800">
            <span>المستوى ${App.arDigits(li.level)} — ${li.title}</span>
            <span class="tiny">${li.next ? `التالي: ${li.next.title}` : "أعلى مستوى!"}</span>
          </div>
          <div class="progress-track mt-8" style="background:rgba(255,255,255,.35)">
            <div class="progress-fill" style="width:${li.progress}%"></div>
          </div>
        </div>

        <div class="grid-2 mb-12">
          <div class="card center"><div class="stat-value text-gold">${App.arDigits(st.rewards.points)}</div><div class="stat-label">نقطة</div></div>
          <div class="card center"><div class="stat-value" style="color:var(--c-turquoise)">${App.arDigits(unlocked.length)}</div><div class="stat-label">وسام من ${App.arDigits(BADGES.length)}</div></div>
        </div>

        <div class="section-head"><h2>أوسمتي</h2></div>
        <div class="badge-grid">${badgesHtml}</div>

        <div class="section-head"><h2>سلّم المستويات</h2></div>
        <div class="level-path">${levelsHtml}</div>

        ${achTimeline ? `
        <div class="section-head"><h2>آخر الإنجازات</h2></div>
        <div class="timeline">${achTimeline}</div>` : ""}
        `,
        mount() {}
      };
    }
  };

  App.Rewards = Rewards;
})();
