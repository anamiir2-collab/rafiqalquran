/* ============================================================
   رفيق القرآن للأطفال — tasmee.js
   التسميع الذكي: اختيار سورة/آية + نطق مباشر + مقارنة صوتية
   يعتمد على Web Speech API عند توفرها، بدون خادم أو API خارجي.
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  const T = {
    _recognition: null,
    _active: false,
    _finalTranscript: "",
    _interimTranscript: "",
    _words: [],
    _matched: 0,
    _wrong: 0,
    _lastResultAt: 0,
    _host: null,
    _target: null,
    _surah: null,
    _ayah: null,

    speechCtor() {
      return window.SpeechRecognition || window.webkitSpeechRecognition || null;
    },

    normalize(text) {
      return String(text || "")
        .normalize("NFKC")
        .replace(/[\u064B-\u0652\u0670\u0640\u06D6-\u06ED]/g, "")
        .replace(/[إأآٱ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ؤ/g, "و")
        .replace(/ئ/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/ـ/g, "")
        .replace(/[\u200F\u200E]/g, "")
        .replace(/[،؛؟!,.\-–—ـ…«»"“”'‘’():؛]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    },

    tokens(text) {
      const n = this.normalize(text);
      return n ? n.split(" ").filter(Boolean) : [];
    },

    displayTokens(text) {
      return String(text || "")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(Boolean);
    },

    wordMatch(a, b) {
      const x = this.normalize(a);
      const y = this.normalize(b);
      if (!x || !y) return false;
      if (x === y) return true;
      // التسامح مع اختلافات شائعة في ناتج التعرف الصوتي
      const simplify = v => v
        .replace(/ا/g, "")
        .replace(/ه$/g, "")
        .replace(/ي$/g, "");
      return simplify(x) === simplify(y) && Math.min(x.length, y.length) >= 2;
    },

    page(params) {
      const Ctor = this.speechCtor();
      const n = Number(params && params.id);
      const s = App.Quran.surah(n);

      if (!s) return { nav: "quran", html: App.emptyHtml("السورة غير موجودة") };

      const ayahNo = Number(params && params.ayah) || 1;
      const ayah = s.ayahs.find(a => a.number === ayahNo) || s.ayahs[0];
      const displayed = App.Quran.ayahsForDisplay(n).find(a => a.number === ayah.number) || ayah;
      const supported = !!Ctor;

      return {
        nav: "quran",
        html: `
        <header class="screen-head">
          <button class="icon-btn btn-back" data-href="#/quran/tasmee" aria-label="رجوع">
            <span class="ico" data-ico="chevronRight"></span>
          </button>
          <div class="sh-title">
            <h1>تسميع — سورة ${s.name}</h1>
            <p>الآية ${App.arDigits(ayah.number)} · انطق الآية بصوتك</p>
          </div>
          <button class="icon-btn" data-action="tasmee-reset" aria-label="إعادة">
            <span class="ico" data-ico="replay"></span>
          </button>
        </header>

        <div class="tasmee-intro">
          <div class="tasmee-intro-icon"><span class="ico" data-ico="mic"></span></div>
          <div>
            <strong>تسميع حي</strong>
            <p>${supported ? "اتكلم بصوت واضح، والكلمات هتظهر وتتحقق مع نطقك" : "المتصفح الحالي لا يدعم التعرف الصوتي المباشر"}</p>
          </div>
        </div>

        <div class="mushaf-page tasmee-mushaf">
          <div class="mushaf-topline">
            <span>سورة ${s.name}</span>
            <span>الآية ${App.arDigits(ayah.number)}</span>
          </div>
          <div class="mushaf-ornament" aria-hidden="true">۞</div>
          <div class="tasmee-ayah" id="tasmeeAyah" dir="rtl"></div>
          <div class="tasmee-progress">
            <div class="tasmee-progress-track"><div class="tasmee-progress-fill" id="tasmeeProgress"></div></div>
            <span id="tasmeeProgressText">٠٪</span>
          </div>
        </div>

        <div class="tasmee-live-card">
          <div class="tasmee-status" id="tasmeeStatus">
            <span class="status-dot"></span>
            <span>${supported ? "جاهز للتسميع" : "التعرف الصوتي غير مدعوم هنا"}</span>
          </div>
          <div class="tasmee-transcript" id="tasmeeTranscript">صوتك هيظهر هنا أثناء التسميع…</div>
          <div class="tasmee-actions">
            <button class="btn btn-primary btn-lg btn-block" data-action="tasmee-start" ${supported ? "" : "disabled"}>
              <span class="ico" data-ico="mic"></span>
              ابدأ التسميع
            </button>
            <button class="btn btn-ghost btn-block hidden" data-action="tasmee-stop">
              <span class="ico" data-ico="stop"></span>
              إيقاف
            </button>
          </div>
        </div>

        <div class="tasmee-help card">
          <div class="card-title"><span class="ico" data-ico="sparkle"></span> إزاي هيشتغل؟</div>
          <div class="tasmee-help-grid">
            <span><b>١</b> انطق الآية</span>
            <span><b>٢</b> الكلمة الصحيحة تظهر باللون الأخضر</span>
            <span><b>٣</b> الخطأ يظهر بالأحمر عشان تراجعه</span>
          </div>
        </div>
        `,
        mount(el) {
          T._host = el;
          T._surah = s;
          T._ayah = displayed;
          T._target = T.displayTokens(displayed.text);
          T._words = T._target.map((text, i) => ({ text, state: i === 0 ? "next" : "pending" }));
          T._matched = 0;
          T._wrong = 0;
          T._finalTranscript = "";
          T._interimTranscript = "";
          T._active = false;
          T.renderAyah();
          T.updateProgress();

          App.Router.onLeave(() => T.stop());
        }
      };
    },

    renderAyah() {
      if (!this._host) return;
      const box = this._host.querySelector("#tasmeeAyah");
      if (!box) return;

      box.innerHTML = this._words.map((w, i) => {
        const cls = "tasmee-word " + w.state;
        return `<span class="${cls}" data-word-index="${i}">${App.esc(w.text)}</span>`;
      }).join(" ");

      const next = this._host.querySelector(".tasmee-word.next");
      if (next) {
        try { next.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" }); } catch (e) {}
      }
      if (App.fillIcons) App.fillIcons(this._host);
    },

    setStatus(text, type) {
      const el = this._host && this._host.querySelector("#tasmeeStatus");
      if (!el) return;
      el.className = "tasmee-status " + (type || "");
      el.innerHTML = `<span class="status-dot"></span><span>${App.esc(text)}</span>`;
    },

    updateProgress() {
      if (!this._host) return;
      const total = this._words.length || 1;
      const pct = Math.min(100, Math.round((this._matched / total) * 100));
      const fill = this._host.querySelector("#tasmeeProgress");
      const txt = this._host.querySelector("#tasmeeProgressText");
      if (fill) fill.style.width = pct + "%";
      if (txt) txt.textContent = App.arDigits(pct) + "٪";
    },

    updateTranscript() {
      if (!this._host) return;
      const box = this._host.querySelector("#tasmeeTranscript");
      if (!box) return;
      const finalText = this._finalTranscript.trim();
      const interim = this._interimTranscript.trim();
      box.innerHTML = finalText
        ? `<span class="final">${App.esc(finalText)}</span>${interim ? ` <span class="interim">${App.esc(interim)}</span>` : ""}`
        : (interim ? `<span class="interim">${App.esc(interim)}</span>` : "صوتك هيظهر هنا أثناء التسميع…");
    },

    compareFinal(text) {
      const spoken = this.tokens(text);
      if (!spoken.length) return;

      let cursor = this._matched;
      for (const spokenWord of spoken) {
        if (cursor >= this._words.length) break;

        if (this.wordMatch(spokenWord, this._words[cursor].text)) {
          this._words[cursor].state = "correct";
          cursor++;
          this._matched = cursor;
          if (cursor < this._words.length) this._words[cursor].state = "next";
        } else {
          // لو الطفل كرر نفس الكلمة أو حصل خطأ في كلمة واحدة، نبحث قريبًا في الكلمتين التاليين.
          let found = -1;
          for (let j = cursor + 1; j <= Math.min(cursor + 2, this._words.length - 1); j++) {
            if (this.wordMatch(spokenWord, this._words[j].text)) { found = j; break; }
          }

          if (found >= 0) {
            for (let j = cursor; j < found; j++) {
              if (this._words[j].state !== "correct") {
                this._words[j].state = "wrong";
                this._wrong++;
              }
            }
            this._words[found].state = "correct";
            cursor = found + 1;
            this._matched = cursor;
            if (cursor < this._words.length) this._words[cursor].state = "next";
          } else {
            this._words[cursor].state = "wrong";
            this._wrong++;
            cursor++;
            this._matched = cursor;
            if (cursor < this._words.length) this._words[cursor].state = "next";
          }
        }
      }

      this.renderAyah();
      this.updateProgress();

      if (this._matched >= this._words.length) this.finishSuccess();
    },

    start() {
      const Ctor = this.speechCtor();
      if (!Ctor) {
        this.setStatus("المتصفح لا يدعم التعرف الصوتي. جرّب Chrome على الهاتف.", "error");
        return;
      }
      if (this._active) return;

      const recognition = new Ctor();
      this._recognition = recognition;
      recognition.lang = "ar-SA";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        this._active = true;
        this.setStatus("بسم الله… أنا سامعك", "active");
        const start = this._host.querySelector('[data-action="tasmee-start"]');
        const stop = this._host.querySelector('[data-action="tasmee-stop"]');
        if (start) start.classList.add("hidden");
        if (stop) stop.classList.remove("hidden");
      };

      recognition.onresult = (event) => {
        let interim = "";
        let finalText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0] ? event.results[i][0].transcript : "";
          if (event.results[i].isFinal) finalText += " " + chunk;
          else interim += " " + chunk;
        }
        if (finalText.trim()) {
          this._finalTranscript += " " + finalText.trim();
          this._lastResultAt = Date.now();
          this.compareFinal(finalText);
        }
        this._interimTranscript = interim.trim();
        this.updateTranscript();
      };

      recognition.onerror = (event) => {
        const msg = event.error === "not-allowed"
          ? "اسمح للمتصفح باستخدام الميكروفون عشان نبدأ التسميع"
          : event.error === "no-speech"
            ? "مش سامع صوتك… قرب من الميكروفون واتكلم بوضوح"
            : "حصلت مشكلة بسيطة في التعرف على الصوت";
        this.setStatus(msg, "error");
      };

      recognition.onend = () => {
        if (!this._active) return;
        // بعض المتصفحات تنهي الجلسة تلقائيًا؛ نعيدها طالما الطفل لم يضغط إيقاف.
        try { recognition.start(); } catch (e) {}
      };

      try {
        recognition.start();
      } catch (e) {
        this.setStatus("تعذر بدء الميكروفون", "error");
      }
    },

    stop() {
      this._active = false;
      if (this._recognition) {
        try { this._recognition.onend = null; this._recognition.stop(); } catch (e) {}
        this._recognition = null;
      }
      if (this._host) {
        const start = this._host.querySelector('[data-action="tasmee-start"]');
        const stop = this._host.querySelector('[data-action="tasmee-stop"]');
        if (start) start.classList.remove("hidden");
        if (stop) stop.classList.add("hidden");
      }
      if (this._matched < this._words.length) this.setStatus("التسميع متوقف — تقدر تكمل لما تكون جاهز", "");
    },

    reset() {
      this.stop();
      if (!this._host) return;
      const displayed = this._ayah;
      this._target = this.displayTokens(displayed.text);
      this._words = this._target.map((text, i) => ({ text, state: i === 0 ? "next" : "pending" }));
      this._matched = 0;
      this._wrong = 0;
      this._finalTranscript = "";
      this._interimTranscript = "";
      this.renderAyah();
      this.updateProgress();
      this.updateTranscript();
      this.setStatus("جاهز للتسميع", "");
    },

    finishSuccess() {
      this.stop();
      this._host.querySelectorAll(".tasmee-word").forEach(w => w.classList.remove("next", "wrong", "pending"));
      this._host.querySelectorAll(".tasmee-word").forEach(w => w.classList.add("correct"));
      this.updateProgress();
      this.setStatus(this._wrong ? "أحسنت! راجع الكلمات الحمراء" : "ما شاء الله! الآية صحيحة", this._wrong ? "warn" : "success");
      App.haptic(35);
      if (App.SFX) App.SFX.play("success");

      const msg = this._wrong
        ? "وصلت لنهاية الآية، لكن فيه كلمات محتاجة مراجعة."
        : "ما شاء الله عليك! سمّعت الآية بشكل ممتاز.";
      App.toast(msg, this._wrong ? "info" : "success");
    },

    choose() {
      const surahs = App.Quran.all().slice().sort((a,b) => a.number - b.number);
      return {
        nav: "quran",
        html: `
        <header class="screen-head">
          <div class="sh-title">
            <h1>التسميع</h1>
            <p>اختار السورة والآية وابدأ التسميع بصوتك</p>
          </div>
        </header>
        <div class="tasmee-choice-hero">
          <span class="ico" data-ico="mic"></span>
          <strong>اختبر حفظك بصوتك</strong>
          <span>الآية قدامك، وصوتك بيتقارن معاها كلمة بكلمة</span>
        </div>
        <div class="tasmee-surah-list">
          ${surahs.map(s => `
            <div class="tasmee-surah-card">
              <div class="tasmee-surah-head">
                <span class="surah-num">${App.arDigits(s.number)}</span>
                <span class="surah-info"><b>سورة ${s.name}</b><small>${App.arDigits(s.ayahsCount)} آية</small></span>
              </div>
              <div class="tasmee-ayahs">
                ${s.ayahs.map(a => `
                  <button class="tasmee-ayah-btn" data-href="#/tasmee/${s.number}/${a.number}">
                    الآية ${App.arDigits(a.number)}
                  </button>`).join("")}
              </div>
            </div>
          `).join("")}
        </div>
        `
      };
    }
  };

  App.Tasmee = T;

  App.actions["tasmee-start"] = () => T.start();
  App.actions["tasmee-stop"] = () => T.stop();
  App.actions["tasmee-reset"] = () => T.reset();
})();
