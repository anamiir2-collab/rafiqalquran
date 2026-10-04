/* ============================================================
   رفيق القرآن للأطفال — stories.js
   تحميل القصص من data/stories/ مع احتفاظ بالنسخة القديمة
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  const S = {
    data: null,

    load() {
      if (this.data) return Promise.resolve(this.data);
      const primary = fetch("./data/stories/index.json")
        .then(r => {
          if (!r.ok) throw new Error("stories index missing");
          return r.json();
        })
        .then(json => {
          const files = Array.isArray(json) ? json : (json.files || []);
          return Promise.all(files.map(f => fetch(`./data/stories/${f}`).then(r => {
            if (!r.ok) throw new Error("story fetch failed: " + f);
            return r.json();
          })));
        })
        .then(list => {
          this.data = list.filter(Boolean);
          return this.data;
        })
        .catch(() => fetch("./data/stories.json")
          .then(r => r.json())
          .then(json => {
            this.data = (json.stories || []).filter(Boolean);
            return this.data;
          })
        );
      return primary;
    },

    byId(id) { return (this.data || []).find(s => s.id === id); },

    ensure(fn) {
      if (this.data) { fn(); return; }
      this.load().then(() => App.Router.render()).catch(() => App.toast("تعذر تحميل القصص", "error"));
    },

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
        <div class="stories-grid">
        ${this.data.map(st => `
        <button class="story-card ${read.includes(st.id) ? "is-read" : ""}" data-href="#/story/${st.id}" aria-label="فتح قصة ${App.esc(st.title)}">
          <span class="story-thumb">${S.thumbVisual(st)}</span>
          ${read.includes(st.id) ? '<span class="story-read-mark" aria-label="تمت القراءة"><span class="ico" data-ico="check"></span></span>' : ""}
          <span class="story-info">
            <span class="story-title">${st.title}</span>
            <span class="story-excerpt">${st.description || st.excerpt || "قصة من قصص القرآن فيها عبرة وفائدة"}</span>
            <span class="story-meta">
              <span class="chip ${st.category === "أنبياء" ? "chip-turquoise" : "chip-gold"}">${st.category || "قصص قرآنية"}</span>
              ${read.includes(st.id)
                ? '<span class="chip chip-success">قرأتها</span>'
                : `<span class="chip story-stars">★ +${App.arDigits(st.stars || 3)}</span>`}
            </span>
          </span>
        </button>`).join("")}
        </div>
        `,
        mount() {}
      };
    },

    thumbVisual(st) {
      if (st.cover) {
        return `<img src="${st.cover}" alt="${App.esc(st.title)}" loading="lazy" onerror="this.outerHTML=S.thumbSvg(S.byId('${st.id}'))">`;
      }
      return S.thumbSvg(st);
    },

    thumbSvg(st) {
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

    pageStory(params) {
      if (!this.data) { S.ensure(); return { nav: "more", html: App.loadingHtml() }; }
      const st = S.byId(params.id);
      if (!st) return { nav: "more", html: App.emptyHtml("القصة غير موجودة") };

      const idx = this.data.findIndex(s => s.id === st.id);
      const prevIdx = idx > 0 ? idx - 1 : this.data.length - 1;
      const nextIdx = idx < this.data.length - 1 ? idx + 1 : 0;
      const prevStory = this.data[prevIdx];
      const nextStory = this.data[nextIdx];
      const pages = st.pages || [{ text: st.paragraphs ? st.paragraphs.join(" ") : (st.story || "") }];
      const cover = st.cover || "";

      return {
        nav: "more",
        html: `
        <header class="screen-head">
          <button class="icon-btn btn-back" data-href="#/stories" aria-label="رجوع"><span class="ico" data-ico="chevronRight"></span></button>
          <div class="sh-title"><h1>${st.title}</h1><p>${st.category} — ${st.sources && st.sources[0] ? st.sources[0] : st.ayahRef || ""}</p></div>
        </header>

        <div class="story-reader-img">${cover ? `<img src="${cover}" alt="${App.esc(st.title)}" onerror="this.style.display='none'">` : `<div class="story-img-placeholder">${S.thumbSvg(st)}</div>`}</div>

        <div class="card">
          <div class="story-body">
            ${pages.map(p => `<p>${p.text || p}</p>`).join("")}
          </div>
          ${st.lesson ? `<div class="lesson-box"><b>العبرة:</b> ${st.lesson}</div>` : ""}
        </div>

        <div class="section-head"><h2>أسئلة القصة</h2><span class="tiny text-faint">أجب لتكسب ${App.arDigits(st.stars || 3)} نجوم</span></div>
        <div data-story-quiz></div>

        <div class="story-nav-rtl mt-16">
          <button class="btn btn-soft story-nav-prev" data-href="#/story/${prevStory.id}" aria-label="القصة السابقة">
            <span class="ico" data-ico="chevronRight"></span>
            <span class="sn-text">
              <span class="sn-label">السابق</span>
              <span class="sn-title">${prevStory.title}</span>
            </span>
          </button>
          <button class="btn btn-soft story-nav-next" data-href="#/story/${nextStory.id}" aria-label="القصة التالية">
            <span class="sn-text">
              <span class="sn-label">التالي</span>
              <span class="sn-title">${nextStory.title}</span>
            </span>
            <span class="ico" data-ico="chevronLeft"></span>
          </button>
        </div>
        `,
        mount(el) {
          const quizHost = el.querySelector("[data-story-quiz]");
          const questions = (st.questions || []).map(q => ({
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
      const text = st.title + ". " + (st.pages || []).map(p => p.text || p).join(" ");
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
