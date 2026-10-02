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

      // المراجعة تعتمد على نطاق الحفظ الحالي — إذا لم يوجد نطاق، اطلب من الطفل تحديده
      if (!App.Range.isValid()) {
        return {
          nav: "review",
          html: `
          <header class="screen-head">
            <div class="sh-title"><h1>وادي المراجعة</h1><p>المراجعة تُثبّت القرآن في القلب</p></div>
          </header>
          ${App.Range.emptyHtml()}
          `,
          mount() {}
        };
      }

      const range = App.Range.get();
      const surah = App.Quran.surah(range.surah);
      const mistakes = App.Storage.getMistakes().filter(m => m.s === range.surah && m.a >= range.from && m.a <= range.to);

      const startCard = `
        <div class="card journey-card">
          <div class="jc-head">
            <span class="jc-ico" style="background:linear-gradient(135deg,#43C6B4,#23958A)"><span class="ico" data-ico="refresh"></span></span>
            <span class="grow" style="text-align:right">
              <span class="jc-title">مراجعة اليوم</span>
              <span class="jc-sub">سورة ${surah.name} — من الآية ${App.arDigits(range.from)} إلى الآية ${App.arDigits(range.to)}</span>
            </span>
          </div>
          <button class="btn btn-primary btn-block mt-12" data-action="review-start">
            <span class="ico" data-ico="rocket"></span> ابدأ مراجعة اليوم
          </button>
        </div>`;

      const mistakesHtml = mistakes.length ? mistakes.slice(0, 8).map(m => {
        return `
        <div class="report-row">
          <div class="rr-name">سورة ${surah.name} — آية ${App.arDigits(m.a)}
            <div class="rr-meta">اخترت التدرب عليها</div>
          </div>
          <button class="btn btn-sm btn-soft" data-action="practice-mistake" data-s="${m.s}" data-a="${m.a}">تدرب الآن</button>
        </div>`;
      }).join("") : `<div class="empty-state" style="padding:18px"><p>لا توجد أخطاء مسجلة — بارك الله فيك!</p></div>`;

      return {
        nav: "review",
        html: `
        <header class="screen-head">
          <div class="sh-title"><h1>وادي المراجعة</h1><p>المراجعة تُثبّت القرآن في القلب</p></div>
        </header>

        <div class="mt-8">${startCard}</div>

        <div class="section-head"><h2>الآيات التي تحتاج تدريبًا</h2></div>
        <div class="card">${mistakesHtml}</div>
        `,
        mount() {}
      };
    },

    /* ---------- جلسة المراجعة ---------- */
    startSession(extra) {
      // المراجعة تعتمد على نطاق الحفظ الحالي فقط
      if (!App.Range.isValid()) {
        App.toast("حدد نطاق الحفظ أولًا لبدء المراجعة", "info");
        App.Router.go("#/range");
        return;
      }
      const range = App.Range.get();
      // بناء قائمة من السورة الواحدة (نطاق الحفظ الحالي)
      const due = [range.surah];
      App.Router.go("#/review/session?extra=" + (extra ? "1" : "0"));
      // render session into host
      setTimeout(() => {
        const host = document.getElementById("reviewHost");
        if (!host) return;
        // تمرير النطاق إلى buildQuiz عبر options لإجبار الأسئلة على استخدام النطاق فقط
        const questions = App.Games.buildQuiz(due, Math.min(10, due.length * 2), null, { rangeFrom: range.from, rangeTo: range.to });
        App.Games.mountQuiz(host, {
          questions,
          title: "مراجعة اليوم",
          passRate: 0.7,
          onFinish: (r) => {
            // حدّث جدولة السورة
            const ok = r.passed;
            R.updateSchedule(Number(range.surah), ok);
            App.Storage.bumpStat("reviewsDone", ok ? 1 : 0);
            App.Rewards.grant({
              stars: r.stars,
              points: (r.passed ? 8 : 3),
              reason: "أتممت مراجعة نطاقك"
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
