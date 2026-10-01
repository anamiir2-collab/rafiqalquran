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
    Husary_128kbps: "محمود خليل الحصري"
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
        total: this.list.length
      };
    },

    currentItem() { return this.list[this.idx] || null; },

    load(list, opts) {
      this.list = list || [];
      this.opts = opts || {};
      this.idx = 0;
      this._repeatLeft = 0;
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
      const loop = this.opts.loop;
      const repeat = this.opts.repeat || 0;
      if (this._repeatLeft > 0) {
        this._repeatLeft--;
        this.play(this.idx);
        return;
      }
      if (repeat > 1 && !this._passedRepeat) {
        // handled via ui-repeat action below
      }
      if (loop && this.idx < this.list.length - 1) {
        this.idx++;
        // small pause between ayahs for repetition comfort
        setTimeout(() => this.play(this.idx), 650);
        return;
      }
      if (loop && this.idx >= this.list.length - 1) {
        this.idx = 0;
        setTimeout(() => this.play(this.idx), 900);
        return;
      }
      if (this.opts.onComplete) {
        try { this.opts.onComplete(); } catch (e) { console.warn(e); }
        return;
      }
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
      this._emit = this._emit.bind(this);
    },

    /* ---------- UI ---------- */
    renderPlayer(host, opts) {
      const p = this;
      // إزالة اشتراكات المشغلات القديمة (منع التسريب)
      if (this._uiUnsubs) this._uiUnsubs.forEach(u => u());
      this._uiUnsubs = [];
      p.load(opts.list, { loop: !!opts.loop, onComplete: opts.onComplete });
      const st = App.Storage.getSettings();
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
            <button class="pc-btn" data-action="p-prev"><span class="ico" data-ico="prev"></span>السابق</button>
            <button class="pc-btn" data-action="p-restart"><span class="ico" data-ico="replay"></span>إعادة</button>
            <button class="pc-btn" data-action="p-next"><span class="ico" data-ico="next"></span>التالي</button>
            <button class="pc-btn" data-action="p-repeat" data-count="${st.repeatCount || 3}"><span class="ico" data-ico="loop"></span>تكرار ×${App.arDigits(st.repeatCount || 3)}</button>
          </div>
          <div class="player-speed-row">
            <span class="tiny text-faint">السرعة:</span>
            ${[0.75, 1, 1.25, 1.5].map(v => `<button class="speed-pill ${v === (st.speed || 1) ? "on" : ""}" data-action="p-speed" data-v="${v}">${App.arDigits(v)}×</button>`).join("")}
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
        sub.textContent = st.item
          ? `الآية ${App.arDigits(st.item.ayah)} — ${App.arDigits(st.idx + 1)} من ${App.arDigits(st.total)}`
          : "جاهز للتشغيل";
      }
    },

    /* ---------- Floating mini player ---------- */
    renderAndPlayFloating(surah, ayah, surahName) {
      // playlist: rest of surah starting at ayah
      const s = App.Quran.surah(surah);
      if (!s) return;
      const list = s.ayahs.filter(a => a.number >= ayah).map(a => ({ surah: s.number, ayah: a.number }));
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
