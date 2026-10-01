/* ============================================================
   رفيق القرآن للأطفال — stories.js
   واحة القصص: قصص قرآنية وأنبية مع استماع وأسئلة ومكافآت
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  const S = {
    data: null,

    load() {
      if (this.data) return Promise.resolve(this.data);
      return fetch("./data/stories.json")
        .then(r => r.json())
        .then(json => { this.data = json.stories; return json; })
        .catch(e => { console.error("stories load failed", e); throw e; });
    },

    byId(id) { return (this.data || []).find(s => s.id === id); },

    ensure(fn) {
      if (this.data) { fn(); return; }
      this.load().then(() => App.Router.render()).catch(() => App.toast("تعذر تحميل القصص", "error"));
    },

    /* ---------- القائمة ---------- */
    pageStories() {
      if (!this.data) { S.ensure(); return { nav: "more", html: App.loadingHtml() }; }
      const read = App.Storage.state.stats.storiesRead;
      return {
        nav: "more",
        html: `
        <header class="screen-head">
          <button class="icon-btn btn-back" data-href="#/more"><span class="ico" data-ico="chevronRight"></span></button>
          <div class="sh-title"><h1>واحة القصص</h1><p>قصص من القرآن تكبر معك</p></div>
          <span class="chip chip-gold">${App.arDigits(read.length)}/${App.arDigits(this.data.length)}</span>
        </header>
        <div class="card journey-card" style="margin-bottom:14px">
          <div class="jc-head">
            <span class="jc-ico" style="background:linear-gradient(135deg,#9B8CCB,#6F5FA8)"><span class="ico" data-ico="bookOpen"></span></span>
            <span class="grow" style="text-align:right">
              <span class="jc-title">كل قصة فيها عبرة</span>
              <span class="jc-sub">اقرأ القصة وأجب عن الأسئلة لتكسب النجوم</span>
            </span>
          </div>
        </div>
        ${this.data.map(st => `
        <button class="story-card" data-href="#/story/${st.id}">
          <span class="story-thumb">${S.thumbSvg(st)}</span>
          <span class="story-info">
            <span class="story-title">${st.title}</span>
            <span class="story-excerpt">${st.excerpt}</span>
            <span class="row" style="gap:6px">
              <span class="chip ${st.category === "أنبياء" ? "chip-turquoise" : "chip-gold"}">${st.category}</span>
              ${read.includes(st.id) ? '<span class="chip chip-success">قرأتها</span>' : `<span class="chip">+${App.arDigits(st.stars)} نجوم</span>`}
            </span>
          </span>
        </button>`).join("")}
        `,
        mount() {}
      };
    },

    thumbSvg(st) {
      // غلاف SVG بسيط واحترافي لكل قصة
      const c1 = st.colors ? st.colors[0] : "#0C7A5C";
      const c2 = st.colors ? st.colors[1] : "#2FB5A3";
      return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs><linearGradient id="g${st.id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
        </linearGradient></defs>
        <rect width="100" height="100" fill="url(#g${st.id})"/>
        <circle cx="76" cy="22" r="12" fill="#F5C063" opacity=".9"/>
        <path d="M10 78 Q30 58 50 74 T90 72 V100 H10 Z" fill="#FFFFFF" opacity=".22"/>
        <path d="M10 86 Q35 70 55 82 T90 82 V100 H10 Z" fill="#FFFFFF" opacity=".3"/>
        <text x="50" y="48" font-size="26" text-anchor="middle" fill="#FFF6E2" font-family="serif" opacity=".95">﴿﴾</text>
      </svg>`;
    },

    /* ---------- القارئ ---------- */
    pageStory(params) {
      if (!this.data) { S.ensure(); return { nav: "more", html: App.loadingHtml() }; }
      const st = S.byId(params.id);
      if (!st) return { nav: "more", html: App.emptyHtml("القصة غير موجودة") };

      return {
        nav: "more",
        html: `
        <header class="screen-head">
          <button class="icon-btn btn-back" data-href="#/stories"><span class="ico" data-ico="chevronRight"></span></button>
          <div class="sh-title"><h1>${st.title}</h1><p>${st.category} — ${st.ayahRef || ""}</p></div>
        </header>

        <div class="story-reader-img">${S.thumbSvg(st)}</div>

        <div class="card">
          <div class="modal-actions" style="margin-top:0;margin-bottom:12px">
            <button class="btn btn-primary grow" data-action="story-listen">
              <span class="ico" data-ico="headphones"></span> <span data-tts-label>استمع للقصة</span>
            </button>
            <button class="btn btn-soft" data-action="story-stop-listen" aria-label="إيقاف"><span class="ico" data-ico="stop"></span></button>
          </div>
          <div class="story-body">
            ${st.paragraphs.map(p => `<p>${p}</p>`).join("")}
          </div>
          <div class="lesson-box"><b>العبرة:</b> ${st.lesson}</div>
        </div>

        <div class="section-head"><h2>أسئلة القصة</h2><span class="tiny text-faint">أجب لتكسب ${App.arDigits(st.stars)} نجوم</span></div>
        <div data-story-quiz></div>
        `,
        mount(el) {
          const quizHost = el.querySelector("[data-story-quiz]");
          const questions = st.questions.map(q => ({
            type: "story",
            surahName: st.title,
            prompt: q.q,
            options: q.options,
            answer: q.correct
          }));
          App.Games.mountQuiz(quizHost, {
            questions,
            title: "أسئلة " + st.title,
            passRate: 0.6,
            onFinish: (r) => {
              if (!App.Storage.state.stats.storiesRead.includes(st.id)) {
                App.Storage.addStoryRead(st.id);
                App.Rewards.grant({ stars: r.stars + (st.stars || 2), points: 15, reason: `قرأت قصة ${st.title}` });
              } else {
                App.Storage.bumpStat("quizCorrect", r.correct);
              }
              quizHost.innerHTML = App.Games.resultView(r, { type: "story" });
              if (App.fillIcons) App.fillIcons(quizHost);
            }
          });
          App.Router.onLeave(() => S.ttsStop());
        }
      };
    },

    /* ---------- الاستماع (SpeechSynthesis) ---------- */
    ttsVoice: null,
    ttsGetVoice() {
      if (!("speechSynthesis" in window)) return null;
      const voices = speechSynthesis.getVoices();
      return voices.find(v => v.lang && v.lang.startsWith("ar")) || null;
    },
    ttsPlay(storyId) {
      const st = S.byId(storyId);
      if (!st) return;
      if (!("speechSynthesis" in window)) {
        App.toast("الاستماع الصوتي غير مدعوم على هذا الجهاز — يمكنك القراءة", "info");
        return;
      }
      speechSynthesis.cancel();
      const text = st.title + ". " + st.paragraphs.join(" ");
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ar-SA";
      u.rate = 0.92;
      const v = S.ttsGetVoice();
      if (v) u.voice = v;
      else speechSynthesis.onvoiceschanged = () => {
        const vv = S.ttsGetVoice();
        if (vv) u.voice = vv;
      };
      speechSynthesis.speak(u);
      App.toast("جارٍ قراءة القصة…", "info");
    },
    ttsStop() {
      if ("speechSynthesis" in window) speechSynthesis.cancel();
    }
  };

  App.actions["story-listen"] = (el) => {
    const id = location.hash.replace("#/story/", "");
    const label = document.querySelector("[data-tts-label]");
    S.ttsPlay(id);
    if (label) label.textContent = "جارٍ القراءة…";
  };
  App.actions["story-stop-listen"] = () => S.ttsStop();

  App.Stories = S;
})();
