/* ============================================================
   رفيق القرآن للأطفال — tasmee.js
   التسميع الذكي: اختيار سورة + نطاق (من آية إلى آية) + نطق مباشر
   + مقارنة كلمة بكلمة بنفس شكل المصحف + نتيجة لطيفة للأطفال.
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
    _words: [],            // [{text, state: pending|next|correct|wrong}]
    _matched: 0,
    _wrong: 0,
    _attempts: 0,
    _lastResultAt: 0,
    _host: null,
    _surah: null,
    _range: null,         // {surah, from, to}
    _ayahIndex: 0,         // index within range
    _completed: 0,
    _startedAt: 0,
    _totalWords: 0,

    speechCtor() {
      return window.SpeechRecognition || window.webkitSpeechRecognition || null;
    },

    /** تطبيع النص للمقارنة (لا يغيّر النص المعروض) */
    normalize(text) {
      return String(text || "")
        .normalize("NFKC")
        .replace(/[\u064B-\u0652\u0670\u0640\u06D6-\u06ED\u0653-\u065F]/g, "")
        .replace(/[إأآٱ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ؤ/g, "و")
        .replace(/ئ/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/ـ/g, "")
        .replace(/[\u200F\u200E]/g, "")
        .replace(/[،؛؟!,.\-–—ـ…«»"“”'‘’():؛\u061B\u061F]/g, " ")
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

    /* ============================================================
       صفحة اختيار النطاق للتسميع
       ============================================================ */
    choose() {
      if (!App.Quran.data) {
        return {
          nav: "quran",
          html: App.loadingHtml(),
          mount() {
            App.Quran.load().then(() => App.Router.render()).catch(() => App.toast("تعذّر تحميل بيانات القرآن", "error"));
          }
        };
      }
      const surahs = App.Quran.all().slice().sort((a, b) => a.number - b.number);
      const last = App.Storage.state.lastAyah;
      const initialSurah = last && last.s ? last.s : 78;
      const s = App.Quran.surah(initialSurah) || surahs[0];
      const initialFrom = last && last.s === initialSurah ? last.a : 1;
      const initialTo = Math.min(s.ayahsCount, initialFrom + 4);

      return {
        nav: "quran",
        html: `
        <header class="screen-head">
          <button class="icon-btn btn-back" data-href="#/mushaf" aria-label="رجوع">
            <span class="ico" data-ico="chevronRight"></span>
          </button>
          <div class="sh-title">
            <h1>التسميع</h1>
            <p>اختار السورة والآيات وسمّع بصوتك</p>
          </div>
        </header>

        <div class="tasmee-intro">
          <div class="tasmee-intro-icon"><span class="ico" data-ico="mic"></span></div>
          <div>
            <strong>سمّع وأنا أساعدك</strong>
            <p>سأستمع لنطقك، وألوّن الكلمات الصحيحة بالأخضر، والكلمات التي تحتاج مراجعة بلون هادئ</p>
          </div>
        </div>

        <div class="card tasmee-selector-card">
          <div class="card-title"><span class="ico" data-ico="book"></span> اختيار السورة</div>
          <div class="field">
            <label for="tasmeeSurahSelect">السورة</label>
            <select id="tasmeeSurahSelect" data-tasmee-surah>
              ${surahs.map(s => `<option value="${s.number}" ${s.number === initialSurah ? "selected" : ""}>سورة ${s.name} — ${App.arDigits(s.ayahsCount)} آية</option>`).join("")}
            </select>
          </div>
          <div class="grid-2" style="gap:12px">
            <div class="field" style="margin:0">
              <label for="tasmeeFromSelect">من الآية</label>
              <select id="tasmeeFromSelect" data-tasmee-from></select>
            </div>
            <div class="field" style="margin:0">
              <label for="tasmeeToSelect">إلى الآية</label>
              <select id="tasmeeToSelect" data-tasmee-to></select>
            </div>
          </div>
          <div class="quick-presets" id="tasmeePresets" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px"></div>
          <button class="btn btn-primary btn-lg btn-block mt-12" data-action="tasmee-start-range">
            <span class="ico" data-ico="mic"></span>
            ابدأ التسميع
          </button>
        </div>

        <div class="card tasmee-rules">
          <div class="card-title"><span class="ico" data-ico="sparkle"></span> كيف يعمل التسميع؟</div>
          <div class="tasmee-help-grid">
            <span><b>١</b> اختر السورة والآيات</span>
            <span><b>٢</b> انطق الآية بصوت واضح</span>
            <span><b>٣</b> الصحيح يظهر بالأخضر</span>
            <span><b>٤</b> المحتاج مراجعة يظهر بلون هادئ</span>
          </div>
        </div>
        `,
        mount(el) {
          const surahSelect = el.querySelector("[data-tasmee-surah]");
          const fromSelect = el.querySelector("[data-tasmee-from]");
          const toSelect = el.querySelector("[data-tasmee-to]");
          const presetsHost = el.querySelector("#tasmeePresets");

          function fillAyahs(surahNo, from, to) {
            const s = App.Quran.surah(Number(surahNo));
            if (!s) return;
            fromSelect.innerHTML = "";
            toSelect.innerHTML = "";
            for (let i = 1; i <= s.ayahsCount; i++) {
              const f = document.createElement("option");
              f.value = i; f.textContent = "الآية " + App.arDigits(i);
              if (i === from) f.selected = true;
              fromSelect.appendChild(f);
              const t = document.createElement("option");
              t.value = i; t.textContent = "الآية " + App.arDigits(i);
              if (i === to) t.selected = true;
              toSelect.appendChild(t);
            }
          }

          function renderPresets(surahNo) {
            const s = App.Quran.surah(Number(surahNo));
            if (!s) return;
            const n = s.ayahsCount;
            const presets = [];
            if (n >= 5) presets.push({ label: "٥ آيات", from: 1, to: Math.min(5, n) });
            if (n >= 10) presets.push({ label: "١٠ آيات", from: 1, to: Math.min(10, n) });
            presets.push({ label: "السورة كاملة", from: 1, to: n });
            presetsHost.innerHTML = presets.map(p =>
              `<button class="seg-item" data-preset-from="${p.from}" data-preset-to="${p.to}">${p.label}</button>`
            ).join("");
          }

          surahSelect.addEventListener("change", () => {
            const n = Number(surahSelect.value);
            const s = App.Quran.surah(n);
            if (!s) return;
            const to = Math.min(s.ayahsCount, Number(fromSelect.value || 1) + 4);
            fillAyahs(n, 1, to);
            renderPresets(n);
          });

          fromSelect.addEventListener("change", () => {
            const f = Number(fromSelect.value);
            const t = Number(toSelect.value);
            if (t < f) toSelect.value = String(f);
          });

          presetsHost.addEventListener("click", (e) => {
            const b = e.target.closest("[data-preset-from]");
            if (!b) return;
            fromSelect.value = b.dataset.presetFrom;
            toSelect.value = b.dataset.presetTo;
            App.haptic(15);
          });

          fillAyahs(initialSurah, initialFrom, initialTo);
          renderPresets(initialSurah);
        }
      };
    },

    /* ============================================================
       صفحة التسميع الفعلي — نفس شكل المصحف + أدوات تحكم
       ============================================================ */
    page(params) {
      if (!App.Quran.data) {
        return {
          nav: "quran",
          html: App.loadingHtml(),
          mount() {
            App.Quran.load().then(() => App.Router.render()).catch(() => App.toast("تعذّر تحميل بيانات القرآن", "error"));
          }
        };
      }
      const Ctor = this.speechCtor();
      const surahNo = Number(params && params.surah);
      const from = Number(params && params.from) || 1;
      const to = Number(params && params.to) || from;
      const s = App.Quran.surah(surahNo);

      if (!s) return { nav: "quran", html: App.emptyHtml("السورة غير موجودة") };

      // التحقق من النطاق
      if (from < 1 || to < from || to > s.ayahsCount) {
        return { nav: "quran", html: App.emptyHtml("النطاق غير صحيح") };
      }

      const supported = !!Ctor;
      const showBismillah = App.Quran.startsWithBismillah(surahNo);
      const ayahs = App.Quran.ayahsForDisplay(surahNo).filter(a => a.number >= from && a.number <= to);
      const ayahNo = from;
      const ayah = ayahs[0] || s.ayahs.find(a => a.number === from);

      // بناء نص المصحف للآيات المختارة
      const mushafText = ayahs.map(a => {
        const isCurrent = a.number === ayahNo;
        return `<span class="ayah-segment tasmee-segment${isCurrent ? " current" : ""}" data-surah="${s.number}" data-ayah="${a.number}">${a.text}<span class="ayah-marker" data-surah="${s.number}" data-ayah="${a.number}" role="button" aria-label="الآية ${App.arDigits(a.number)}">${App.arDigits(a.number)}</span></span>`;
      }).join(" ");

      return {
        nav: "quran",
        html: `
        <header class="screen-head">
          <button class="icon-btn btn-back" data-href="#/tasmee" aria-label="رجوع">
            <span class="ico" data-ico="chevronRight"></span>
          </button>
          <div class="sh-title">
            <h1>تسميع — سورة ${s.name}</h1>
            <p>الآيات ${App.arDigits(from)} — ${App.arDigits(to)} · ${App.arDigits(to - from + 1)} آيات</p>
          </div>
          <button class="icon-btn" data-action="tasmee-reset" aria-label="إعادة">
            <span class="ico" data-ico="replay"></span>
          </button>
        </header>

        <div class="tasmee-status-row">
          <div class="tasmee-status" id="tasmeeStatus">
            <span class="status-dot"></span>
            <span>${supported ? "جاهز للتسميع — انطق الآية" : "التعرف الصوتي غير مدعوم في هذا المتصفح"}</span>
          </div>
        </div>

        <div class="mushaf-page tasmee-mushaf" id="tasmeeMushaf">
          <div class="mushaf-topline">
            <span>سورة ${s.name}</span>
            <span>الآيات ${App.arDigits(from)} — ${App.arDigits(to)}</span>
          </div>
          <div class="mushaf-ornament" aria-hidden="true">۞</div>
          ${showBismillah ? `<div class="mushaf-bismillah">${App.Quran.bismillah()}</div>` : ""}
          <div class="mushaf-text md tasmee-ayah" id="tasmeeAyah" dir="rtl">${mushafText}</div>
          <div class="tasmee-progress">
            <div class="tasmee-progress-track"><div class="tasmee-progress-fill" id="tasmeeProgress"></div></div>
            <span id="tasmeeProgressText">٠٪</span>
          </div>
        </div>

        <div class="tasmee-live-card">
          <div class="tasmee-transcript" id="tasmeeTranscript">صوتك سيظهر هنا أثناء التسميع…</div>
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

        <div class="card tasmee-encourage hidden" id="tasmeeEncourage">
          <span class="ico" data-ico="sparkle"></span>
          <span id="tasmeeEncourageText"></span>
        </div>
        `,
        mount(el) {
          T._host = el;
          T._surah = s;
          T._range = { surah: surahNo, from, to };
          T._ayahIndex = 0;
          T._completed = 0;
          T._attempts = 0;
          T._startedAt = Date.now();
          T._totalWords = 0;
          T._finalTranscript = "";
          T._interimTranscript = "";
          T._active = false;

          T._loadCurrentAyah();
          T.renderAyah();
          T.updateProgress();

          App.Router.onLeave(() => T.stop());
        }
      };
    },

    /** تحميل الآية الحالية في النطاق */
    _loadCurrentAyah() {
      if (!this._range || !this._surah) return;
      const { from, to } = this._range;
      const ayahs = App.Quran.ayahsForDisplay(this._surah.number).filter(a => a.number >= from && a.number <= to);
      const idx = Math.min(this._ayahIndex, ayahs.length - 1);
      const a = ayahs[idx];
      if (!a) return;
      this._target = this.displayTokens(a.text);
      this._words = this._target.map((text, i) => ({ text, state: i === 0 ? "next" : "pending" }));
      this._matched = 0;
      this._wrong = 0;
      this._finalTranscript = "";
      this._interimTranscript = "";
      this._totalWords += this._target.length;
    },

    renderAyah() {
      if (!this._host) return;
      const box = this._host.querySelector("#tasmeeAyah");
      if (!box) return;

      // أعد بناء النص فقط للآية الحالية (نُحدّث الكلمات inline)
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

    showEncourage(text) {
      const el = this._host && this._host.querySelector("#tasmeeEncourage");
      const txt = this._host && this._host.querySelector("#tasmeeEncourageText");
      if (el && txt) {
        txt.textContent = text;
        el.classList.remove("hidden");
        clearTimeout(this._encourageT);
        this._encourageT = setTimeout(() => el.classList.add("hidden"), 2600);
      }
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
        : (interim ? `<span class="interim">${App.esc(interim)}</span>` : "صوتك سيظهر هنا أثناء التسميع…");
    },

    compareFinal(text) {
      const spoken = this.tokens(text);
      if (!spoken.length) return;

      let cursor = this._matched;
      let progressed = false;

      for (const spokenWord of spoken) {
        if (cursor >= this._words.length) break;

        if (this.wordMatch(spokenWord, this._words[cursor].text)) {
          this._words[cursor].state = "correct";
          cursor++;
          this._matched = cursor;
          progressed = true;
          if (cursor < this._words.length) this._words[cursor].state = "next";
        } else {
          // بحث قريبًا في الكلمتين التاليتين (لو سقطت كلمة)
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
            progressed = true;
            if (cursor < this._words.length) this._words[cursor].state = "next";
          } else {
            // لا تطابق — نترك الكلمة كـ next ونتابع
            // لا نحسبها خطأ إلا لو انتهت الآية دون مطابقتها
          }
        }
      }

      this.renderAyah();
      this.updateProgress();

      // رسائل تشجيعية هادئة
      if (progressed) {
        if (this._matched === this._words.length) {
          this.showEncourage(this._wrong === 0 ? "ممتاز يا بطل" : "أحسنت، أكمل");
        } else if (this._matched > 0 && this._matched % 3 === 0) {
          this.showEncourage("بارك الله فيك");
        }
      }

      if (this._matched >= this._words.length) {
        this._advanceAyah();
      }
    },

    /** الانتقال للآية التالية في النطاق */
    _advanceAyah() {
      const { from, to } = this._range;
      const total = to - from + 1;
      if (this._ayahIndex < total - 1) {
        this._ayahIndex++;
        this._attempts++;
        this._loadCurrentAyah();
        this.renderAyah();
        this.updateProgress();
        this.updateTranscript();
        const a = App.Quran.ayahsForDisplay(this._surah.number).filter(x => x.number >= from && x.number <= to)[this._ayahIndex];
        this.setStatus(`الآية ${App.arDigits(a.number)} — انطقها`, "active");
        this.showEncourage("أحسنت، أكمل");
      } else {
        this.finishSuccess();
      }
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
        this.setStatus("بسم الله… أنا أسامعك", "active");
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
          ? "اسمح للمتصفح باستخدام الميكروفون لبدء التسميع"
          : event.error === "no-speech"
            ? "لم أسمع صوتك… قرب من الميكروفون وانطق بوضوح"
            : event.error === "aborted"
              ? "" // تجاهل
              : "حصلت مشكلة بسيطة في التعرف على الصوت";
        if (msg) this.setStatus(msg, event.error === "no-speech" ? "" : "error");
      };

      recognition.onend = () => {
        if (!this._active) return;
        // بعض المتصفحات تنهي الجلسة تلقائيًا؛ نعيدها طالما الطفل لم يضغط إيقاف
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
      if (this._matched < this._words.length) {
        this.setStatus("متوقف — تابع عندما تكون جاهزًا", "");
      }
    },

    reset() {
      this.stop();
      if (!this._host) return;
      this._ayahIndex = 0;
      this._completed = 0;
      this._attempts = 0;
      this._startedAt = Date.now();
      this._totalWords = 0;
      this._loadCurrentAyah();
      this.renderAyah();
      this.updateProgress();
      this.updateTranscript();
      this.setStatus("جاهز للتسميع — انطق الآية", "");
      const enc = this._host.querySelector("#tasmeeEncourage");
      if (enc) enc.classList.add("hidden");
    },

    /** نهاية النطاق — اعرض نتيجة لطيفة */
    finishSuccess() {
      this.stop();
      this._host.querySelectorAll(".tasmee-word").forEach(w => w.classList.remove("next", "pending"));
      this.updateProgress();
      this.setStatus("أتممت التسميع — أحسنت يا بطل", "success");
      App.haptic(35);
      if (App.SFX) App.SFX.play("success");

      const { from, to } = this._range;
      const totalAyahs = to - from + 1;
      const duration = Math.max(1, Math.round((Date.now() - this._startedAt) / 1000));
      const matchedWords = this._totalWords - this._wrong;
      const mastery = Math.max(0, Math.min(100, Math.round((matchedWords / Math.max(1, this._totalWords)) * 100)));

      const encourageMsg = mastery >= 90 ? "ممتاز يا بطل"
        : mastery >= 75 ? "أحسنت، أنت قريب جدًا"
        : mastery >= 50 ? "أحسنت — واصل التدريب"
        : "أحسنت المحاولة — حاول مرة أخرى";

      App.modal({
        title: "نتيجة التسميع",
        body: `
          <div class="tasmee-result">
            <div class="tr-encourage">${encourageMsg}</div>
            <div class="tr-stat-ring">
              <div class="ring ring-lg">${App.ringSvg(110, 8, mastery, mastery >= 75 ? "green" : "")}<span class="ring-center">${App.arDigits(mastery)}٪</span></div>
            </div>
            <div class="tr-grid">
              <div class="tr-stat">
                <div class="trs-ico" style="background:var(--c-primary-soft);color:var(--c-primary-dark)"><span class="ico" data-ico="book"></span></div>
                <div class="trs-val">${App.arDigits(totalAyahs)}</div>
                <div class="trs-label">آيات</div>
              </div>
              <div class="tr-stat">
                <div class="trs-ico" style="background:var(--c-gold-light);color:var(--c-gold-deep)"><span class="ico" data-ico="check"></span></div>
                <div class="trs-val">${App.arDigits(matchedWords)}</div>
                <div class="trs-label">كلمة صحيحة</div>
              </div>
              <div class="tr-stat">
                <div class="trs-ico" style="background:#FCE7E4;color:#B33A32"><span class="ico" data-ico="puzzle"></span></div>
                <div class="trs-val">${App.arDigits(this._wrong)}</div>
                <div class="trs-label">تحتاج مراجعة</div>
              </div>
            </div>
            <p class="tr-note">${mastery >= 90 ? "أحسنت! نطقك صحيح جدًا" : "أحسنت المحاولة — كرّر التسميع مرة أخرى حتى تتحسن"}</p>
          </div>
        `,
        actions: [
          { label: "إعادة", action: "tasmee-reset", primary: false },
          { label: "تم", action: "close-modal", primary: true }
        ]
      });
      if (App.fillIcons) App.fillIcons(document.getElementById("modalCard"));
    }
  };

  App.Tasmee = T;

  App.actions["tasmee-start"] = () => T.start();
  App.actions["tasmee-stop"] = () => T.stop();
  App.actions["tasmee-reset"] = () => T.reset();
  App.actions["tasmee-start-range"] = (el) => {
    const host = el.closest("#appMain") || document;
    const s = host.querySelector("[data-tasmee-surah]");
    const f = host.querySelector("[data-tasmee-from]");
    const t = host.querySelector("[data-tasmee-to]");
    if (!s || !f || !t) return;
    const surah = Number(s.value);
    const from = Number(f.value);
    const to = Number(t.value);
    if (to < from) {
      App.toast("الآية الأخيرة يجب أن تكون بعد الأولى", "error");
      return;
    }
    App.Router.go(`#/tasmee/${surah}/${from}/${to}`);
  };

  // توافق مع المسار القديم: tasmee/:id → اعرضه كنطاق آية واحدة
  App.actions["tasmee-open"] = (el) => {
    const host = el.closest("#appMain") || document;
    const s = host.querySelector("[data-tasmee-surah]");
    const a = host.querySelector("[data-tasmee-ayah]");
    if (!s || !a) return;
    const surah = Number(s.value);
    const ayah = Number(a.value);
    App.Router.go(`#/tasmee/${surah}/${ayah}/${ayah}`);
  };
})();
