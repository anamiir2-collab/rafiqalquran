/* ============================================================
   رفيق القرآن للأطفال — memorization.js
   رحلة الحفظ: استماع → ترديد (تسجيل صوتي) → اختبار → إتقان → مكافأة
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  const M = {
    _rec: null,
    _chunks: [],
    _stream: null,
    _recUrl: null,
    _recTimer: null,
    _recStart: 0,

    /* ---------- helpers ---------- */
    session() { return App.Storage.state.session; },

    startSession(surahNo, fromAyah) {
      const s = App.Quran.surah(surahNo);
      const st = App.Storage.state;
      const p = st.progress[surahNo] || { memorized: [] };
      const memorized = new Set(p.memorized || []);
      let start = fromAyah || 1;
      if (!fromAyah) {
        const firstNot = s.ayahs.find(a => !memorized.has(a.number));
        start = firstNot ? firstNot.number : 1;
      }
      let len;
      if (s.ayahsCount <= 10) len = s.ayahsCount - start + 1;
      else len = Math.min(5, s.ayahsCount - start + 1);
      const range = [start, Math.min(s.ayahsCount, start + len - 1)];
      st.session = {
        surah: surahNo,
        range,
        step: "listen",
        listened: [],
        recited: [],
        quizResult: null
      };
      App.Storage.save();
      return st.session;
    },

    saveSession() { App.Storage.save(); },

    rangeAyahs(sess) {
      const s = App.Quran.surah(sess.surah);
      return s.ayahs.filter(a => a.number >= sess.range[0] && a.number <= sess.range[1]);
    },

    /* ---------- الصفحة الرئيسية للرحلة ---------- */
    pageJourney(params) {
      if (!App.Quran.data) {
        App.Quran.load().then(() => App.Router.render()).catch(() => App.toast("تعذر تحميل البيانات", "error"));
        return { nav: "quran", html: App.loadingHtml() };
      }
      const raw = params.id || "";
      const [surahStr, query] = raw.split("?");
      const surahNo = Number(surahStr);
      const s = App.Quran.surah(surahNo);
      if (!s) return { nav: "quran", html: App.emptyHtml("السورة غير موجودة") };

      let fromAyah = null;
      if (query && query.includes("ayah=")) fromAyah = Number(query.split("ayah=")[1]);

      let sess = M.session();
      if (!sess || sess.surah !== surahNo) sess = M.startSession(surahNo, fromAyah);
      else if (fromAyah) sess.range = [fromAyah, Math.min(s.ayahsCount, fromAyah + (s.ayahsCount <= 10 ? s.ayahsCount - fromAyah : 4))];

      const steps = [
        { id: "listen", label: "استماع", icon: "headphones" },
        { id: "recite", label: "ترديد", icon: "mic" },
        { id: "quiz", label: "اختبار الإتقان", icon: "brain" },
        { id: "mastery", label: "الإتقان", icon: "medal" },
        { id: "reward", label: "المكافأة", icon: "trophy" }
      ];

      return {
        nav: "quran",
        html: `
        <header class="screen-head">
          <button class="icon-btn btn-back" data-href="#/surah/${s.number}"><span class="ico" data-ico="chevronRight"></span></button>
          <div class="sh-title"><h1>رحلة الحفظ</h1><p>سورة ${s.name}</p></div>
          <button class="icon-btn" data-action="journey-exit" aria-label="إنهاء"><span class="ico" data-ico="x"></span></button>
        </header>

        <div class="journey-hero">
          <div class="jh-surah">سورة ${s.name}</div>
          <div class="jh-sub" data-jh-sub></div>
          <div class="jh-range" data-jh-range>
            ${M.rangeChips(s)}
          </div>
        </div>

        <div class="journey-steps">
          ${steps.map(st => `
          <div class="jstep" data-step="${st.id}">
            <span class="jstep-dot"><span class="ico" data-ico="${st.icon}"></span></span>
            <div class="jstep-body">
              <div class="jstep-title">${st.label}</div>
              <div class="jstep-desc" data-jdesc="${st.id}"></div>
            </div>
          </div>`).join("")}
        </div>

        <div data-journey-content class="mt-16"></div>
        `,
        mount(el) {
          M.renderStep(el);
          App.Router.onLeave(() => M.cleanup());
        }
      };
    },

    rangeChips(s) {
      const sess = M.session();
      const mk = (a, b, label) => {
        const on = sess.range[0] === a && sess.range[1] === b;
        return `<span class="chip ${on ? "on" : ""}" data-action="journey-range" data-a="${a}" data-b="${b}">${label}</span>`;
      };
      if (s.ayahsCount <= 10) return mk(1, s.ayahsCount, `كل السورة (${App.arDigits(s.ayahsCount)} آيات)`);
      let html = mk(1, 5, "الآيات ١ - ٥");
      html += mk(1, 10, "الآيات ١ - ١٠");
      html += mk(1, s.ayahsCount, "كل السورة");
      return html;
    },

    /* ---------- عرض الخطوة الحالية ---------- */
    renderStep(rootEl) {
      const host = rootEl || document.getElementById("appMain");
      const sess = M.session();
      if (!sess) { App.Router.go("#/quran"); return; }
      const s = App.Quran.surah(sess.surah);

      // تحديث خطوات المسار
      const order = ["listen", "recite", "quiz", "mastery", "reward"];
      const idx = order.indexOf(sess.step);
      host.querySelectorAll(".jstep").forEach((el, i) => {
        el.classList.toggle("done", i < idx);
        el.classList.toggle("active", i === idx);
      });
      const descs = {
        listen: `${App.arDigits(sess.listened.length)} من ${App.arDigits(sess.range[1] - sess.range[0] + 1)} آية استمعت إليها`,
        recite: `${App.arDigits(sess.recited.length)} من ${App.arDigits(sess.range[1] - sess.range[0] + 1)} آية رددتها`,
        quiz: sess.quizResult ? `نتيجتك ${App.arDigits(sess.quizResult.correct)}/${App.arDigits(sess.quizResult.total)}` : "اختبر ما حفظت",
        mastery: sess.quizResult && sess.quizResult.passed ? "أتقنت هذه الآيات بحمد الله" : "أكمل الاختبار أولًا",
        reward: sess.rewarded ? "استلمت مكافأتك" : "في انتظارك"
      };
      order.forEach(k => {
        const d = host.querySelector(`[data-jdesc="${k}"]`);
        if (d) d.textContent = descs[k];
      });
      const sub = host.querySelector("[data-jh-sub]");
      if (sub) sub.textContent = `الآيات ${App.arDigits(sess.range[0])} - ${App.arDigits(sess.range[1])}`;

      const content = host.querySelector("[data-journey-content]");
      if (!content) return;

      if (sess.step === "listen") M.renderListen(content, sess, s);
      else if (sess.step === "recite") M.renderRecite(content, sess, s);
      else if (sess.step === "quiz") M.renderQuiz(content, sess, s);
      else if (sess.step === "mastery") M.renderMastery(content, sess, s);
      else M.renderReward(content, sess, s);
    },

    /* ---------- 1) الاستماع ---------- */
    renderListen(host, sess, s) {
      const ayahs = M.rangeAyahs(sess);
      const idx = Math.min(sess.listened.length, ayahs.length - 1);
      const a = ayahs[idx];
      const fs = App.Storage.getSettings().quranFontSize;

      host.innerHTML = `
      <div class="ayah-card">
        <div class="ayah-card-top">
          <span class="ayah-counter">الآية ${App.arDigits(a.number)} من ${App.arDigits(s.ayahsCount)}</span>
          <span class="rec-mirror">اسمع جيدًا ثم ردد</span>
        </div>
        <div class="ayah-text ${fs === "lg" ? "lg" : ""}">${a.text}<span class="ayah-badge">${App.arDigits(a.number)}</span></div>
        <div id="listenPlayer"></div>
        <button class="btn btn-primary btn-block mt-12" data-action="journey-listened" data-ayah="${a.number}">
          <span class="ico" data-ico="check"></span> ${sess.listened.includes(a.number) ? "الآية التالية" : "استمعت — احفظها في قلبي"}
        </button>
      </div>
      <p class="center small text-soft mt-12">${App.arDigits(sess.listened.length)} / ${App.arDigits(ayahs.length)} آيات استمعت إليها في هذه الرحلة</p>`;

      App.Player.renderPlayer(document.getElementById("listenPlayer"), {
        list: ayahs.map(x => ({ surah: s.number, ayah: x.number })),
        title: `سورة ${s.name} — للآية ${App.arDigits(a.number)}`,
        onComplete: () => App.toast("انتهت القائمة — كرر الاستماع لتثبيت الآيات", "info")
      });
      App.Player.play(idx);
    },

    /* ---------- 2) الترديد والتسجيل ---------- */
    renderRecite(host, sess, s) {
      const ayahs = M.rangeAyahs(sess);
      const idx = Math.min(sess.recited.length, ayahs.length - 1);
      const a = ayahs[idx];
      const fs = App.Storage.getSettings().quranFontSize;

      host.innerHTML = `
      <div class="ayah-card">
        <div class="ayah-card-top">
          <span class="ayah-counter">الآية ${App.arDigits(a.number)} من ${App.arDigits(s.ayahsCount)}</span>
          <span class="rec-mirror">ردد بصوت عالٍ</span>
        </div>
        <div class="ayah-text ${fs === "lg" ? "lg" : ""}">${a.text}<span class="ayah-badge">${App.arDigits(a.number)}</span></div>

        <div class="rec-panel" data-rec-panel>
          <div data-rec-idle>
            <button class="btn btn-primary" data-action="rec-start">
              <span class="ico" data-ico="mic"></span> ابدأ التسجيل
            </button>
            <p class="tiny text-faint mt-8">سجّل صوتك وردد الآية ثم استمع لنفسك</p>
          </div>
          <div data-rec-active class="hidden">
            <div class="bold"><span class="rec-dot"></span>جارٍ التسجيل… <span class="rec-time" data-rec-time>0:00</span></div>
            <button class="btn btn-danger mt-12" data-action="rec-stop">
              <span class="ico" data-ico="stop"></span> إيقاف التسجيل
            </button>
          </div>
          <div data-rec-done class="hidden">
            <div class="bold" style="color:var(--c-success)"><span class="ico" data-ico="check" style="width:16px;height:16px;vertical-align:-3px"></span> تم التسجيل!</div>
            <audio class="rec-audio" controls data-rec-audio></audio>
            <div class="modal-actions">
              <button class="btn btn-ghost" data-action="rec-restart"><span class="ico" data-ico="replay"></span> أعد التسجيل</button>
              <button class="btn btn-primary" data-action="journey-recited" data-ayah="${a.number}"><span class="ico" data-ico="check"></span> رددتها جيدًا</button>
            </div>
          </div>
          <div data-rec-error class="hidden">
            <p class="small bold" style="color:var(--c-danger)">لم نتمكن من استخدام الميكروفون</p>
            <p class="tiny text-soft mt-8">لا بأس أبدًا! يمكنك أن تُرّد بصوتك الآن بدون تسجيل، وواصل رحلتك بشكل طبيعي.</p>
            <button class="btn btn-soft mt-8" data-action="journey-recited" data-ayah="${a.number}"><span class="ico" data-ico="check"></span> رددتها بدون تسجيل</button>
          </div>
        </div>
      </div>
      <p class="center small text-soft mt-12">${App.arDigits(sess.recited.length)} / ${App.arDigits(ayahs.length)} آيات رددتها</p>`;

      M._recPanel = host.querySelector("[data-rec-panel]");
    },

    /* ---------- التسجيل ---------- */
    async recStart(panel) {
      const idle = panel.querySelector("[data-rec-idle]");
      const active = panel.querySelector("[data-rec-active]");
      const errBox = panel.querySelector("[data-rec-error]");
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        idle.classList.add("hidden");
        errBox.classList.remove("hidden");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        M._stream = stream;
        let mime = "";
        if (window.MediaRecorder && MediaRecorder.isTypeSupported) {
          if (MediaRecorder.isTypeSupported("audio/webm")) mime = "audio/webm";
          else if (MediaRecorder.isTypeSupported("audio/mp4")) mime = "audio/mp4";
        }
        M._chunks = [];
        M._rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
        M._rec.ondataavailable = e => { if (e.data.size) M._chunks.push(e.data); };
        M._rec.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(M._chunks, { type: M._rec.mimeType || "audio/webm" });
          if (M._recUrl) URL.revokeObjectURL(M._recUrl);
          M._recUrl = URL.createObjectURL(blob);
          active.classList.add("hidden");
          const done = panel.querySelector("[data-rec-done]");
          done.classList.remove("hidden");
          const audio = panel.querySelector("[data-rec-audio]");
          audio.src = M._recUrl;
          clearInterval(M._recTimer);
        };
        M._rec.start();
        idle.classList.add("hidden");
        active.classList.remove("hidden");
        M._recStart = Date.now();
        M._recTimer = setInterval(() => {
          const sec = Math.floor((Date.now() - M._recStart) / 1000);
          const t = panel.querySelector("[data-rec-time]");
          if (t) t.textContent = Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
        }, 500);
      } catch (e) {
        console.warn("recording denied", e);
        idle.classList.add("hidden");
        errBox.classList.remove("hidden");
      }
    },

    recStop() {
      if (M._rec && M._rec.state !== "inactive") M._rec.stop();
    },

    cleanup() {
      if (M._rec && M._rec.state !== "inactive") {
        try { M._rec.stop(); } catch (e) {}
      }
      if (M._stream) { M._stream.getTracks().forEach(t => t.stop()); M._stream = null; }
      clearInterval(M._recTimer);
    },

    /* ---------- 3) الاختبار ---------- */
    renderQuiz(host, sess, s) {
      const questions = App.Games.buildQuiz([s.number], 5, ["wordOrder", "missingWord", "completeAyah", "nextAyah"]);
      App.Games.mountQuiz(host, {
        questions,
        title: "اختبار الإتقان",
        passRate: 0.8,
        onFinish: (r) => {
          sess.quizResult = r;
          r.wrongList.forEach(q => App.Storage.addMistake(q.surah, q.ayah));
          App.Storage.bumpStat("quizCorrect", r.correct);
          App.Storage.bumpStat("quizWrong", r.total - r.correct);
          M.saveSession();
          if (r.passed) {
            sess.step = "mastery";
            M.saveSession();
            M.renderStep();
          } else {
            host.innerHTML = `
            <div class="card result-card">
              <div class="result-emoji-ring fail"><span class="ico" data-ico="refresh"></span></div>
              <div class="result-title">لا بأس، البطل يحتاج محاولة أخرى</div>
              <div class="result-sub">${App.arDigits(r.correct)} من ${App.arDigits(r.total)} — تحتاج ${App.arDigits(Math.ceil(r.total * 0.8))} إجابات صحيحة</div>
              <p class="small text-soft mt-8">ارجع واستمع للآيات مرة أخرى ثم أعِد الاختبار</p>
              <div class="modal-actions">
                <button class="btn btn-ghost" data-action="journey-back-listen"><span class="ico" data-ico="headphones"></span> استماع مرة أخرى</button>
                <button class="btn btn-primary" data-action="journey-retry-quiz"><span class="ico" data-ico="replay"></span> أعِد الاختبار</button>
              </div>
            </div>`;
            if (App.fillIcons) App.fillIcons(host);
          }
        }
      });
    },

    /* ---------- 4) الإتقان ---------- */
    renderMastery(host, sess, s) {
      const r = sess.quizResult || { correct: 0, total: 1, passed: false };
      const gained = Math.round((r.correct / r.total) * 100);
      host.innerHTML = `
      <div class="card mastery-card">
        <div class="ring mastery-ring">${App.ringSvg(120, 11, gained, "green")}
          <span class="ring-center" style="font-size:1.5rem">${App.arDigits(gained)}٪</span>
        </div>
        <div class="result-title">أتقنت الآيات!</div>
        <p class="small text-soft mt-8">سورة ${s.name} — الآيات ${App.arDigits(sess.range[0])} إلى ${App.arDigits(sess.range[1])}</p>
        <button class="btn btn-gold btn-lg btn-block mt-16 btn-pulse" data-action="journey-complete">
          <span class="ico" data-ico="trophy"></span> احفظ التقدم واطلب مكافأتي
        </button>
      </div>`;
      if (App.fillIcons) App.fillIcons(host);
    },

    completeJourney() {
      const sess = M.session();
      if (!sess) return;
      const s = App.Quran.surah(sess.surah);
      const r = sess.quizResult || { correct: 0, total: 1 };
      const p = App.Storage.ensureProg(sess.surah);

      // add memorized range
      const set = new Set(p.memorized || []);
      for (let i = sess.range[0]; i <= sess.range[1]; i++) set.add(i);
      p.memorized = Array.from(set).sort((a, b) => a - b);
      p.mastery = Math.max(p.mastery || 0, Math.round((r.correct / r.total) * 100));
      p.lastReview = Date.now();

      const complete = p.memorized.length >= s.ayahsCount;
      if (complete) {
        p.status = "mastered";
        p.completedAt = Date.now();
        p.interval = 1;
        p.nextReview = App.Storage._todayKey(new Date(Date.now() + 86400000));
      }
      App.Storage.setLastAyah(sess.surah, sess.range[1]);
      sess.rewarded = true;
      sess.step = "reward";
      M.saveSession();
      App.Storage.save();

      // rewards: 3★ perfect, 2★ ≥80%, 1★ pass
      const stars = r.correct === r.total ? 3 : (r.correct / r.total >= 0.8 ? 2 : 1);
      const points = r.correct * 10 + (complete ? 40 : 0);
      App.Rewards.grant({
        stars, points,
        reason: complete ? `أتقنت سورة ${s.name} كاملة!` : `أتقنت آيات ${App.arDigits(sess.range[0])}-${App.arDigits(sess.range[1])} من سورة ${s.name}`,
        title: complete ? "ما شاء الله! سورة كاملة" : "أحسنت! أتقنت الآيات"
      });
      M.renderStep();
    },

    /* ---------- 5) المكافأة ---------- */
    renderReward(host, sess, s) {
      const sura = App.Quran.surah(sess.surah);
      host.innerHTML = `
      <div class="card result-card">
        <div class="result-emoji-ring"><span class="ico" data-ico="trophy"></span></div>
        <div class="result-title">استلمت مكافأتك يا بطل!</div>
        <p class="small text-soft mt-8">اجعل القرآن رفيقك كل يوم</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" data-href="#/review"><span class="ico" data-ico="refresh"></span> وادي المراجعة</button>
          <button class="btn btn-primary" data-href="#/home"><span class="ico" data-ico="home"></span> الرئيسية</button>
        </div>
      </div>
      <div class="card mt-12">
        <div class="card-title"><span class="ico" data-ico="sparkle"></span> الخطوة التالية</div>
        ${M.nextSuggestionHtml(sess.surah)}
      </div>`;
      if (App.fillIcons) App.fillIcons(host);
    },

    nextSuggestionHtml(doneSurah) {
      const st = App.Storage.state;
      const p = st.progress[doneSurah];
      const s = App.Quran.surah(doneSurah);
      if (!p || p.memorized.length < s.ayahsCount) {
        const nextA = (p.memorized || []).length ? Math.max(...p.memorized) + 1 : 1;
        if (nextA <= s.ayahsCount) {
          return `
          <p class="small text-soft mb-12">تبقّى لك من سورة ${s.name} ${App.arDigits(s.ayahsCount - (p.memorized || []).length)} آية</p>
          <button class="btn btn-gold btn-block" data-action="journey-continue-surah" data-s="${s.number}">
            <span class="ico" data-ico="rocket"></span> أكمل باقي السورة
          </button>`;
        }
      }
      const next = App.Quran.suggestNext();
      return `
      <p class="small text-soft mb-12">اقتراحنا التالي: سورة ${next.name} (${App.arDigits(next.ayahsCount)} آية)</p>
      <button class="btn btn-gold btn-block" data-href="#/journey/${next.number}">
        <span class="ico" data-ico="rocket"></span> ابدأ رحلة جديدة
      </button>`;
    }
  };

  /* ================= الأفعال ================= */
  App.actions["journey-listened"] = (el) => {
    const sess = M.session();
    if (!sess) return;
    const ayah = Number(el.dataset.ayah);
    if (!sess.listened.includes(ayah)) sess.listened.push(ayah);
    App.Player.pause();
    const total = sess.range[1] - sess.range[0] + 1;
    if (sess.listened.length >= total) {
      sess.step = "recite";
      App.toast("أحسنت! حان وقت الترديد بصوتك", "success");
    }
    M.saveSession();
    M.renderStep();
  };

  App.actions["journey-recited"] = (el) => {
    const sess = M.session();
    if (!sess) return;
    const ayah = Number(el.dataset.ayah);
    if (!sess.recited.includes(ayah)) sess.recited.push(ayah);
    App.Storage.bumpStat("recordings", 1);
    M.cleanup();
    const total = sess.range[1] - sess.range[0] + 1;
    if (sess.recited.length >= total) {
      sess.step = "quiz";
      App.toast("رائع! الآن اختبر إتقانك", "success");
    }
    M.saveSession();
    M.renderStep();
  };

  App.actions["rec-start"] = (el) => {
    const panel = el.closest("[data-rec-panel]");
    M.recStart(panel);
  };
  App.actions["rec-stop"] = () => M.recStop();
  App.actions["rec-restart"] = (el) => {
    const panel = el.closest("[data-rec-panel]");
    panel.querySelector("[data-rec-done]").classList.add("hidden");
    panel.querySelector("[data-rec-idle]").classList.remove("hidden");
  };
  App.actions["journey-retry-quiz"] = () => M.renderStep();
  App.actions["journey-back-listen"] = () => {
    const sess = M.session();
    sess.step = "listen";
    M.saveSession();
    M.renderStep();
  };
  App.actions["journey-complete"] = () => M.completeJourney();
  App.actions["journey-exit"] = () => {
    M.cleanup();
    App.Router.go("#/surah/" + (M.session() ? M.session().surah : ""));
  };
  App.actions["journey-range"] = (el) => {
    const sess = M.session();
    sess.range = [Number(el.dataset.a), Number(el.dataset.b)];
    sess.listened = [];
    sess.recited = [];
    sess.step = "listen";
    M.saveSession();
    M.renderStep();
    App.Router.render();
  };
  App.actions["journey-continue-surah"] = (el) => {
    const sNo = Number(el.dataset.s);
    M.startSession(sNo);
    App.Router.go("#/journey/" + sNo);
  };

  App.Memorization = M;
})();
