/* ============================================================
   رفيق القرآن للأطفال — revision.js
   وادي المراجعة: مراجعة اليوم + الآيات القديمة + الأخطاء + الإتقان
   نظام مراجعة بسيط (تكرار متباعد) مخزّن محليًا
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  const R = {

    /** السور المستحقة للمراجعة اليوم */
    dueSurahs() {
      const today = App.todayKey();
      const st = App.Storage.state;
      return Object.keys(st.progress)
        .map(Number)
        .filter(n => {
          const p = st.progress[n];
          const s = App.Quran.surah(n);
          if (!s) return false;
          if (p.status === "mastered") return !p.nextReview || p.nextReview <= today;
          return (p.memorized || []).length >= s.ayahsCount && (!p.nextReview || p.nextReview <= today);
        })
        .map(n => Number(n));
    },

    /** سور تحتاج تثبيت (إتقان متوسط) */
    needsConsolidation() {
      const st = App.Storage.state;
      return Object.keys(st.progress)
        .map(Number)
        .filter(n => {
          const p = st.progress[n];
          const s = App.Quran.surah(n);
          return s && p.status !== "new" && p.mastery >= 40 && p.mastery < 80;
        });
    },

    overallMastery() {
      const st = App.Storage.state;
      let sum = 0, count = 0;
      Object.keys(st.progress).forEach(k => {
        const p = st.progress[k];
        const s = App.Quran.surah(k);
        if (s && (p.memorized || []).length > 0) {
          sum += p.mastery || 0;
          count++;
        }
      });
      return count ? Math.round(sum / count) : 0;
    },

    /* ---------- صفحة الوادي ---------- */
    pageReview() {
      if (!App.Quran.data) {
        App.Quran.load().then(() => App.Router.render()).catch(() => App.toast("تعذر تحميل البيانات", "error"));
        return { nav: "review", html: App.loadingHtml() };
      }

      const due = R.dueSurahs();
      const mistakes = App.Storage.getMistakes();
      const consolidation = R.needsConsolidation();
      const mastery = R.overallMastery();
      const st = App.Storage.state;

      const masteredList = Object.keys(st.progress)
        .map(Number)
        .filter(n => st.progress[n].status === "mastered")
        .sort((a, b) => a - b);

      const dueHtml = due.length ? `
        <div class="card journey-card">
          <div class="jc-head">
            <span class="jc-ico" style="background:linear-gradient(135deg,#43C6B4,#23958A)"><span class="ico" data-ico="refresh"></span></span>
            <span class="grow" style="text-align:right">
              <span class="jc-title">مراجعة اليوم</span>
              <span class="jc-sub">${App.arDigits(due.length)} ${due.length === 1 ? "سورة جاهزة للمراجعة" : "سور جاهزة للمراجعة"}</span>
            </span>
          </div>
          <div class="wrap mt-12" style="display:flex;flex-wrap:wrap;gap:6px">
            ${due.slice(0, 6).map(n => `<span class="chip chip-turquoise">${App.Quran.surah(n).name}</span>`).join("")}
            ${due.length > 6 ? `<span class="chip">+${App.arDigits(due.length - 6)}</span>` : ""}
          </div>
          <button class="btn btn-primary btn-block mt-12" data-action="review-start">
            <span class="ico" data-ico="rocket"></span> ابدأ مراجعة اليوم
          </button>
        </div>` : `
        <div class="card center" style="padding:24px 16px">
          <span class="ico" style="width:48px;height:48px;margin:0 auto 10px;color:var(--c-success)" data-ico="check"></span>
          <div class="bold">رائع! لا توجد مراجعات مستحقة اليوم</div>
          <p class="small text-soft mt-8">عد غدًا لتثبيت الحفظ، أو جرّب "مراجعة إضافية" الآن</p>
          <button class="btn btn-soft mt-12" data-action="review-start" data-extra="1">
            <span class="ico" data-ico="sparkle"></span> مراجعة إضافية اختيارية
          </button>
        </div>`;

      const mistakesHtml = mistakes.length ? mistakes.slice(0, 8).map(m => {
        const s = App.Quran.surah(m.s);
        return `
        <div class="report-row">
          <div class="rr-name">${s ? "سورة " + s.name : ""} — آية ${App.arDigits(m.a)}
            <div class="rr-meta">أخطأت فيها ${App.arDigits(m.count)} ${m.count === 1 ? "مرة" : "مرات"}</div>
          </div>
          <button class="btn btn-sm btn-soft" data-action="practice-mistake" data-s="${m.s}" data-a="${m.a}">تدرب الآن</button>
        </div>`;
      }).join("") : `<div class="empty-state" style="padding:18px"><p>لا توجد أخطاء مسجلة — بارك الله فيك!</p></div>`;

      const consolHtml = consolidation.length ? consolidation.slice(0, 6).map(n => {
        const s = App.Quran.surah(n);
        const p = App.Storage.prog(n);
        return `
        <div class="report-row">
          <div class="rr-name">سورة ${s.name}<div class="rr-meta">مستوى التثبيت ${App.arDigits(p.mastery)}٪</div></div>
          <div class="progress-track rr-bar"><div class="progress-fill turquoise" style="width:${p.mastery}%"></div></div>
          <button class="btn btn-sm btn-ghost" data-href="#/journey/${n}">ثبّت</button>
        </div>`;
      }).join("") : `<div class="empty-state" style="padding:18px"><p>كل السور المحفوظة مثبتة جيدًا</p></div>`;

      const oldHtml = masteredList.length ? masteredList.slice(0, 10).map(n => {
        const s = App.Quran.surah(n);
        const p = App.Storage.prog(n);
        const last = p.lastReview ? new Date(p.lastReview).toLocaleDateString("ar-EG") : "—";
        return `
        <div class="report-row">
          <div class="rr-name">سورة ${s.name}<div class="rr-meta">آخر مراجعة: ${last} — ${App.arDigits(p.reviewCount || 0)} مرات</div></div>
          <span class="chip chip-success">إتقان ${App.arDigits(p.mastery)}٪</span>
        </div>`;
      }).join("") : `<div class="empty-state" style="padding:18px"><p>أكمل أول سورة لتظهر هنا في قائمة المراجعة الدورية</p></div>`;

      return {
        nav: "review",
        html: `
        <header class="screen-head">
          <div class="sh-title"><h1>وادي المراجعة</h1><p>المراجعة تُثبّت القرآن في القلب</p></div>
        </header>

        <div class="card mastery-card">
          <div class="ring mastery-ring">${App.ringSvg(110, 10, mastery, "green")}
            <span class="ring-center" style="font-size:1.4rem">${App.arDigits(mastery)}٪</span>
          </div>
          <div class="bold">مستوى الإتقان العام</div>
          <p class="small text-soft mt-8">${App.arDigits(App.Storage.countMasteredSurahs())} سورة مكتملة — ${App.arDigits(App.Storage.countMemorizedAyahs())} آية محفوظة</p>
        </div>

        <div class="mt-16">${dueHtml}</div>

        <div class="section-head"><h2>الآيات التي أخطأت فيها</h2></div>
        <div class="card">${mistakesHtml}</div>

        <div class="section-head"><h2>سور تحتاج تثبيت</h2></div>
        <div class="card">${consolHtml}</div>

        <div class="section-head"><h2>الآيات القديمة (المراجعة الدورية)</h2></div>
        <div class="card">${oldHtml}</div>
        `,
        mount() {}
      };
    },

    /* ---------- جلسة المراجعة ---------- */
    startSession(extra) {
      let due = R.dueSurahs();
      if (extra || !due.length) {
        const all = Object.keys(App.Storage.state.progress).map(Number).filter(n => (App.Storage.prog(n).memorized || []).length > 0);
        due = all.length ? App.sample(all, Math.min(4, all.length)) : DEFAULT_R;
      }
      if (!due.length) {
        App.toast("احفظ أول سورة أولًا ثم عُد للمراجعة", "info");
        App.Router.go("#/quran");
        return;
      }
      App.Router.go("#/review/session?extra=" + (extra ? "1" : "0"));
      // render session into host
      setTimeout(() => {
        const host = document.getElementById("reviewHost");
        if (!host) return;
        const questions = App.Games.buildQuiz(due, Math.min(10, due.length * 2));
        const surahScores = {};
        App.Games.mountQuiz(host, {
          questions,
          title: "مراجعة اليوم",
          passRate: 0.7,
          onFinish: (r) => {
            // update schedules per surah
            const perSurah = {};
            r.wrongList.forEach(q => {
              perSurah[q.surah] = perSurah[q.surah] || { ok: 0, bad: 0 };
              perSurah[q.surah].bad++;
            });
            questions.forEach(q => {
              if (!r.wrongList.includes(q)) {
                perSurah[q.surah] = perSurah[q.surah] || { ok: 0, bad: 0 };
                perSurah[q.surah].ok++;
              }
            });
            let successCount = 0;
            Object.keys(perSurah).forEach(n => {
              const sc = perSurah[n];
              const ok = sc.ok > sc.bad;
              R.updateSchedule(Number(n), ok);
              if (ok) successCount++;
            });
            App.Storage.bumpStat("reviewsDone", successCount);
            App.Rewards.grant({
              stars: r.stars,
              points: successCount * 8,
              reason: `أتممت مراجعة ${App.arDigits(successCount)} ${successCount === 1 ? "سورة" : "سور"}`
            }, r.passed ? false : true);
            host.innerHTML = App.Games.resultView(r, { type: "review" });
            if (App.fillIcons) App.fillIcons(host);
          }
        });
      }, 60);
    },

    updateSchedule(surahNo, ok) {
      const p = App.Storage.ensureProg(surahNo);
      const today = new Date();
      if (ok) {
        p.interval = Math.min(30, Math.max(1, (p.interval || 1) * 2));
        p.mastery = Math.min(100, (p.mastery || 60) + 5);
      } else {
        p.interval = 1;
        p.mastery = Math.max(40, (p.mastery || 60) - 15);
      }
      const next = new Date(today.getTime() + p.interval * 86400000);
      p.nextReview = App.Storage._todayKey(next);
      p.lastReview = Date.now();
      p.reviewCount = (p.reviewCount || 0) + 1;
      App.Storage.save();
    },

    pageSession() {
      return { nav: "review", html: `<div id="reviewHost"></div>` };
    }
  };

  const DEFAULT_R = [112, 108, 113, 114];

  App.actions["review-start"] = (el) => R.startSession(el.dataset.extra === "1");
  App.actions["practice-mistake"] = (el) => {
    const s = Number(el.dataset.s), a = Number(el.dataset.a);
    App.Router.go("#/journey/" + s + "?ayah=" + a);
  };

  App.Revision = R;
})();
