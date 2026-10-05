/* ============================================================
   رفيق القرآن للأطفال — audio.js
   مشغل صوت احترافي: تشغيل/إيقاف/إعادة/تالي/سابق/سرعة/تكرار
   المصدر: everyayah.com (بلا مفاتيح API) + كاش في Service Worker
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  const RECITERS = {
    Alafasy_128kbps: "مشاري العفاسي",
    Husary_128kbps: "محمود خليل الحصري",
    Minshawy_Murattal_128kbps: "محمد صديق المنشاوي"
  };

  function ayahUrl(reciter, surah, ayah) {
    return `https://everyayah.com/data/${reciter}/${String(surah).padStart(3, "0")}${String(ayah).padStart(3, "0")}.mp3`;
  }

  const Player = {
    audio: null,
    list: [],
    idx: 0,
    opts: {},
    _repeatLeft: 0,
    _repeatAyah: false,
    _speed: 1,
    _stateCbs: [],
    _floatingHost: null,
    _errorShown: 0,

    _ensureAudio() {
      if (!this.audio) {
        this.audio = new Audio();
        this.audio.preload = "auto";
        this.audio.addEventListener("ended", () => this._onEnded());
        this.audio.addEventListener("timeupdate", () => this._emit());
        this.audio.addEventListener("play", () => this._emit());
        this.audio.addEventListener("pause", () => this._emit());
        this.audio.addEventListener("error", () => this._onError());
        this.audio.addEventListener("waiting", () => this._emit());
        this.audio.addEventListener("canplay", () => this._emit());
      }
      return this.audio;
    },

    onState(cb) { this._stateCbs.push(cb); return () => {
      this._stateCbs = this._stateCbs.filter(f => f !== cb);
    }; },

    _emit() {
      const st = this.state();
      this._stateCbs.forEach(cb => { try { cb(st); } catch (e) {} });
      this._syncFloating(st);
    },

    state() {
      const a = this.audio;
      return {
        playing: a ? !a.paused && !a.ended : false,
        loading: a ? a.readyState < 3 && !a.paused : false,
        currentTime: a ? a.currentTime : 0,
        duration: a && isFinite(a.duration) ? a.duration : 0,
        speed: this._speed,
        item: this.currentItem(),
        idx: this.idx,
        total: this.list.length,
        repeatAyah: !!this._repeatAyah
      };
    },

    currentItem() { return this.list[this.idx] || null; },

    load(list, opts) {
      this.list = list || [];
      this.opts = opts || {};
      this.idx = 0;
      this._repeatLeft = 0;
      this._repeatAyah = false;
    },

    /* ---------- Mushaf Player (مشغل المصحف المخفي) ----------
       في شاشة المصحف لا نعرض toolbar كبير، فقط شريط تحكم بسيط يطفو في الأسفل.
       المستخدم يضغط على علامة الآية لتشغيلها. */
    renderMushafPlayer(rootEl, opts, scrollRoot) {
      const p = this;
      if (this._uiUnsubs) this._uiUnsubs.forEach(u => u());
      this._uiUnsubs = [];
      p.load(opts.list, { loop: !!opts.loop, onComplete: opts.onComplete, scopeAutoplay: opts.scopeAutoplay !== false });

      // أنشئ شريط تحكم بسيط عائم في أسفل الشاشة
      let bar = rootEl.querySelector(".mushaf-control-bar");
      if (!bar) {
        bar = document.createElement("div");
        bar.className = "mushaf-control-bar hidden";
        bar.innerHTML = `
          <button class="mc-play" data-action="mc-toggle" aria-label="تشغيل أو إيقاف مؤقت"><span class="ico" data-ico="play"></span><span class="mc-play-label">تشغيل</span></button>
          <div class="mc-info">
            <div class="mc-title">سورة ...</div>
            <div class="mc-seek"><div class="mc-seek-fill"></div></div>
          </div>
          <button class="mc-btn mc-repeat" data-action="mc-repeat" aria-label="تكرار الآية" aria-pressed="false"><span class="ico" data-ico="loop"></span><span class="mc-label">تكرار</span></button>
          <button class="mc-btn" data-action="mc-prev" aria-label="الآية السابقة"><span class="ico" data-ico="prev"></span><span class="mc-label">السابق</span></button>
          <button class="mc-btn" data-action="mc-next" aria-label="الآية التالية"><span class="ico" data-ico="next"></span><span class="mc-label">التالي</span></button>
          <button class="mc-btn mc-stop" data-action="mc-stop" aria-label="إيقاف الصوت"><span class="ico" data-ico="stop"></span><span class="mc-label">إيقاف</span></button>`;
        rootEl.appendChild(bar);
        if (App.fillIcons) App.fillIcons(bar);
        // Local click handler
        bar.addEventListener("click", (e) => {
          const b = e.target.closest("[data-action]");
          if (!b) return;
          e.stopPropagation();
          const act = b.dataset.action;
          if (act === "mc-toggle") p.toggle();
          else if (act === "mc-repeat") p.toggleRepeatAyah();
          else if (act === "mc-prev") p.prev();
          else if (act === "mc-next") p.next();
          else if (act === "mc-stop") p.stop();
          else if (act === "mc-close") { p.stopAll(); bar.classList.add("hidden"); }
        });
      }
      bar.classList.remove("hidden");

      // اشتراك الـ state
      const unsub = p.onState((st) => {
        const playIco = bar.querySelector(".mc-play .ico");
        if (playIco && App.icons) {
          playIco.innerHTML = App.icons[st.loading ? "loader" : (st.playing ? "pause" : "play")];
          const playLabel = bar.querySelector(".mc-play-label");
          if (playLabel) playLabel.textContent = st.playing ? "إيقاف مؤقت" : "تشغيل";
        }
        const title = bar.querySelector(".mc-title");
        if (title && st.item) {
          const s = App.Quran.surah(st.item.surah);
          title.textContent = (s ? "سورة " + s.name + " — " : "") + "الآية " + App.arDigits(st.item.ayah);
        }
        const seek = bar.querySelector(".mc-seek-fill");
        if (seek && st.duration) seek.style.width = (st.currentTime / st.duration * 100) + "%";
        const repeat = bar.querySelector(".mc-repeat");
        if (repeat) {
          repeat.classList.toggle("on", !!st.repeatAyah);
          repeat.setAttribute("aria-pressed", String(!!st.repeatAyah));
        }
      });
      this._uiUnsubs.push(unsub);
      App.Router.onLeave(unsub);

      // في وضع التلاوة مع autoStart: شغّل أول آية تلقائيًا (بعد تفاعل المستخدم الأول)
      if (opts.autoStart) {
        // نضعّم autoplay flag ليُتاح الانتقال التلقائي بين الآيات
        this._pendingAutoStart = true;
      }
    },

    play(idx) {
      if (!this.list.length) return;
      if (typeof idx === "number") this.idx = Math.max(0, Math.min(idx, this.list.length - 1));
      const item = this.currentItem();
      if (!item) return;
      const a = this._ensureAudio();
      const settings = App.Storage.getSettings();
      this._speed = settings.speed || 1;
      a.src = ayahUrl(settings.reciter, item.surah, item.ayah);
      a.playbackRate = this._speed;
      a.play().catch(() => this._onError());
      this._emit();
    },

    toggle() {
      const a = this.audio;
      if (!a || !a.src) { this.play(0); return; }
      if (a.paused) a.play().catch(() => this._onError());
      else a.pause();
      this._emit();
    },

    pause() { if (this.audio && !this.audio.paused) { this.audio.pause(); this._emit(); } },

    stop() {
      if (this.audio) {
        this.audio.pause();
        try { this.audio.currentTime = 0; } catch (e) {}
      }
      this._emit();
    },

    toggleRepeatAyah() {
      this._repeatAyah = !this._repeatAyah;
      if (this._repeatAyah && !this.state().playing && this.currentItem()) this.play(this.idx);
      this._emit();
      App.toast(this._repeatAyah ? "تم تفعيل تكرار الآية الحالية" : "تم إيقاف تكرار الآية", "info");
    },

    next() { if (this.idx < this.list.length - 1) this.play(this.idx + 1); },
    prev() { if (this.idx > 0) this.play(this.idx - 1); },
    restart() { if (this.audio) { this.audio.currentTime = 0; this.play(this.idx); } },

    seekBy(sec) {
      if (this.audio && isFinite(this.audio.duration)) {
        this.audio.currentTime = Math.max(0, Math.min(this.audio.duration - .2, this.audio.currentTime + sec));
        this._emit();
      }
    },

    setSpeed(v) {
      this._speed = v;
      App.Storage.setSetting("speed", v);
      if (this.audio) this.audio.playbackRate = v;
      this._emit();
    },

    _onEnded() {
      // تكرار الآية الحالية بشكل مستمر حتى يضغط الطفل على التكرار مرة أخرى
      if (this._repeatAyah) {
        setTimeout(() => this.play(this.idx), 180);
        return;
      }
      // كرر الآية إذا كان هناك عدد تكرار متبقٍ
      if (this._repeatLeft > 0) {
        this._repeatLeft--;
        this.play(this.idx);
        return;
      }
      const loop = this.opts.loop;
      // الوضع Loop (وضع التكرار) — تنقّل دائقي بين الآيات
      if (loop && this.idx < this.list.length - 1) {
        this.idx++;
        setTimeout(() => this.play(this.idx), 650);
        return;
      }
      if (loop && this.idx >= this.list.length - 1) {
        this.idx = 0;
        setTimeout(() => this.play(this.idx), 900);
        return;
      }
      // scopeAutoplay = التشغيل التلقائي داخل النطاق (التلاوة فقط)
      // إذا لم يُفعّل: توقف عند نهاية الآية (الطفل يضغط التالي بنفسه)
      if (this.opts.scopeAutoplay && this.idx < this.list.length - 1) {
        this.idx++;
        setTimeout(() => this.play(this.idx), 650);
        return;
      }
      // عند نهاية النطاق أو إيقاف التشغيل التلقائي
      if (this.opts.onComplete) {
        try { this.opts.onComplete(); } catch (e) { console.warn(e); }
        return;
      }
      this._emit();
    },

    /* ---------- التشغيل التلقائي Scoped (يُستخدم في شاشة المصحف فقط) ---------- */
    _isAutoPlayEnabled() {
      try {
        const s = App.Storage.getSettings();
        return s.autoPlay !== false;
      } catch (e) { return true; }
    },
    setAutoPlay(on) {
      App.Storage.setSetting("autoPlay", !!on);
      this._emit();
    },

    _onError() {
      if (Date.now() - this._errorShown > 4000) {
        this._errorShown = Date.now();
        App.toast("تعذّر تشغيل الصوت — تأكد من اتصالك بالإنترنت ثم أعد المحاولة", "error");
      }
      this._emit();
    },

    stopAll() {
      if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
      }
      this.list = [];
      this.idx = 0;
      this._stateCbs = this._stateCbs.filter(cb => cb._persistent);
      this._hideFloating();
      this._repeatAyah = false;
      this._repeatLeft = 0;
      this._emit();
    },

    /* ---------- UI ---------- */
    renderPlayer(host, opts) {
      const p = this;
      // إزالة اشتراكات المشغلات القديمة (منع التسريب)
      if (this._uiUnsubs) this._uiUnsubs.forEach(u => u());
      this._uiUnsubs = [];
      // scopeAutoplay: في التلاوة فقط نسمح بالانتقال التلقائي بين الآيات
      // hideAutoplayBtn: في الحفظ نخفي زر "تلقائي" تمامًا
      p.load(opts.list, {
        loop: !!opts.loop,
        onComplete: opts.onComplete,
        scopeAutoplay: opts.scopeAutoplay === true  // false افتراضيًا (الحفظ/الترديد لا autoplay)
      });
      const st = App.Storage.getSettings();
      const hideAuto = opts.hideAutoplayBtn === true;
      const autoOn = !hideAuto && st.autoPlay !== false;
      const autoBtnHtml = hideAuto ? "" :
        `<button class="pc-btn auto-btn ${autoOn ? "on" : ""}" data-action="p-autoplay" aria-label="تشغيل تلقائي" aria-pressed="${autoOn}"><span class="ico" data-ico="${autoOn ? "playAuto" : "stopAuto"}"></span><span>تلقائي</span></button>`;
      host.innerHTML = `
        <div class="player" data-player-ui>
          <div class="player-main">
            <button class="play-btn" data-action="p-toggle" aria-label="تشغيل">
              <span class="ico" data-ico="play"></span>
            </button>
            <div class="player-info">
              <div class="pi-title">${opts.title || "المشغل"}</div>
              <div class="pi-sub" data-p-sub>جاهز للتشغيل</div>
              <div class="player-seek"><div class="player-seek-fill" data-p-seek></div></div>
            </div>
          </div>
          <div class="player-controls">
            <button class="pc-btn" data-action="p-prev" aria-label="السابق"><span class="ico" data-ico="prev"></span><span>السابق</span></button>
            <button class="pc-btn" data-action="p-restart" aria-label="إعادة"><span class="ico" data-ico="replay"></span><span>إعادة</span></button>
            <button class="pc-btn" data-action="p-next" aria-label="التالي"><span class="ico" data-ico="next"></span><span>التالي</span></button>
            ${autoBtnHtml}
          </div>
          <div class="player-speed-row">
            <span class="tiny text-faint">السرعة:</span>
            ${[0.75, 1, 1.25, 1.5].map(v => `<button class="speed-pill ${v === (st.speed || 1) ? "on" : ""}" data-action="p-speed" data-v="${v}" aria-label="سرعة ${v}">${App.arDigits(v)}×</button>`).join("")}
          </div>
        </div>`;
      if (App.fillIcons) App.fillIcons(host);

      const ui = host.querySelector("[data-player-ui]");
      const unsub = p.onState(() => p._syncUI(host));
      this._uiUnsubs.push(unsub);
      App.Router.onLeave(unsub);

      // actions scoped to this host
      const local = {
        "p-toggle": () => p.toggle(),
        "p-prev": () => p.prev(),
        "p-next": () => p.next(),
        "p-restart": () => p.restart(),
        "p-speed": (el) => {
          p.setSpeed(Number(el.dataset.v));
          host.querySelectorAll(".speed-pill").forEach(b => b.classList.toggle("on", Number(b.dataset.v) === Number(el.dataset.v)));
        },
        "p-autoplay": (el) => {
          const cur = p._isAutoPlayEnabled();
          const next = !cur;
          p.setAutoPlay(next);
          el.classList.toggle("on", next);
          el.setAttribute("aria-pressed", String(next));
          const ico = el.querySelector(".ico");
          if (ico && App.icons) ico.innerHTML = App.icons[next ? "playAuto" : "stopAuto"];
          App.toast(next ? "تم تفعيل التشغيل التلقائي" : "تم إيقاف التشغيل التلقائي", "info");
        },
        "p-repeat": (el) => {
          const c = Number(el.dataset.count) || 3;
          p._repeatLeft = c;
          el.classList.add("on");
          App.toast(`سيتم تكرار الآية ${App.arDigits(c)} مرات`, "info");
          if (!p.state().playing) p.play(p.idx);
        }
      };
      ui.addEventListener("click", (e) => {
        const b = e.target.closest("[data-action]");
        if (b && local[b.dataset.action]) local[b.dataset.action](b, e);
      });
      this._syncUI(host);
    },

    _syncUI(host) {
      const st = this.state();
      const playIco = host.querySelector(".play-btn .ico");
      if (playIco) playIco.innerHTML = App.icons[st.loading ? "loader" : (st.playing ? "pause" : "play")];
      const seek = host.querySelector("[data-p-seek]");
      if (seek && st.duration) seek.style.width = (st.currentTime / st.duration * 100) + "%";
      const sub = host.querySelector("[data-p-sub]");
      if (sub) {
        // لا نعرض عداد "N من M" للطفل — فقط اسم السورة ورقم الآية الحالية
        if (st.item) {
          const sName = App.Quran && App.Quran.surah(st.item.surah);
          sub.textContent = (sName ? "سورة " + sName.name + " — " : "") + "الآية " + App.arDigits(st.item.ayah);
        } else {
          sub.textContent = "جاهز للتشغيل";
        }
      }
    },

    /* ---------- Floating mini player ---------- */
    renderAndPlayFloating(surah, ayah, surahName) {
      const s = App.Quran.surah(surah);
      if (!s) return;
      // احترام نطاق الحفظ: لو النطاق شامل لهذه الآية، القائمة من الآية إلى نهاية النطاق فقط
      let list;
      const range = (App.Range && App.Range.isValid()) ? App.Range.get() : null;
      if (range && range.surah === surah && ayah >= range.from && ayah <= range.to) {
        list = s.ayahs
          .filter(a => a.number >= ayah && a.number <= range.to)
          .map(a => ({ surah: s.number, ayah: a.number }));
      } else if (range && range.surah === surah && (ayah < range.from || ayah > range.to)) {
        // الآية خارج النطاق — شغّل هذه الآية فقط (لا يوجد تالي)
        list = [{ surah: s.number, ayah }];
      } else {
        // لا يوجد نطاق — السلوك القديم: من الآية إلى نهاية السورة
        list = s.ayahs.filter(a => a.number >= ayah).map(a => ({ surah: s.number, ayah: a.number }));
      }
      this._showFloating();
      this.load(list, {});
      const host = this._floatingHost;
      this._floatingUnsub && this._floatingUnsub();
      this._floatingUnsub = this.onState(() => this._syncFloating(this.state()));
      this.play(0);
    },

    _showFloating() {
      if (!this._floatingHost) {
        const div = document.createElement("div");
        div.className = "floating-player";
        div.innerHTML = `
          <button class="play-btn fp-play" data-action="p-toggle" aria-label="تشغيل"><span class="ico" data-ico="play"></span></button>
          <div class="fp-info">
            <div class="fp-title" data-fp-title></div>
            <div class="player-seek"><div class="player-seek-fill" data-fp-seek></div></div>
          </div>
          <button class="fp-btn" data-action="p-restart" aria-label="إعادة"><span class="ico" data-ico="replay"></span></button>
          <button class="fp-btn" data-action="p-next" aria-label="التالي"><span class="ico" data-ico="next"></span></button>
          <button class="fp-close" data-action="p-close" aria-label="إغلاق"><span class="ico" data-ico="x"></span></button>`;
        document.body.appendChild(div);
        this._floatingHost = div;
        div.addEventListener("click", (e) => {
          const b = e.target.closest("[data-action]");
          if (!b) return;
          e.stopPropagation();
          if (b.dataset.action === "p-toggle") this.toggle();
          else if (b.dataset.action === "p-restart") this.restart();
          else if (b.dataset.action === "p-next") this.next();
          else if (b.dataset.action === "p-close") { this.stopAll(); }
        });
      }
      this._floatingHost.classList.remove("hidden");
    },

    _hideFloating() {
      if (this._floatingHost) this._floatingHost.classList.add("hidden");
    },

    _syncFloating(st) {
      const host = this._floatingHost;
      if (!host || host.classList.contains("hidden")) return;
      const ico = host.querySelector(".fp-play .ico");
      if (ico) ico.innerHTML = App.icons[st.playing ? "pause" : "play"];
      const t = host.querySelector("[data-fp-title]");
      if (t && st.item) {
        const s = App.Quran.surah(st.item.surah);
        t.textContent = `سورة ${s ? s.name : ""} — الآية ${App.arDigits(st.item.ayah)}`;
      }
      const seek = host.querySelector("[data-fp-seek]");
      if (seek && st.duration) seek.style.width = (st.currentTime / st.duration * 100) + "%";
    }
  };

  App.Player = Player;
  App.RECITERS = RECITERS;
})();
