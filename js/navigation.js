/* ============================================================
   رفيق القرآن للأطفال — navigation.js
   Hash Router متوافق 100% مع GitHub Pages (بدون Server Rewrites)
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  const Router = {
    routes: [],
    current: "",
    _cleanups: [],

    /** add("journey/:id", fn) */
    add(pattern, fn) {
      this.routes.push({ parts: pattern.split("/"), fn });
    },

    parse(hash) {
      let h = (hash || location.hash || "#/home").replace(/^#\/?/, "");
      if (!h) h = "home";
      return h.split("/").filter(Boolean).map(decodeURIComponent);
    },

    match(segs) {
      for (const r of this.routes) {
        if (r.parts.length !== segs.length) continue;
        const params = {};
        let ok = true;
        for (let i = 0; i < r.parts.length; i++) {
          const p = r.parts[i];
          if (p.startsWith(":")) params[p.slice(1)] = segs[i];
          else if (p !== segs[i]) { ok = false; break; }
        }
        if (ok) return { fn: r.fn, params };
      }
      return null;
    },

    go(hash, opts) {
      if (location.hash === hash) {
        this.render();
      } else if (opts && opts.replace) {
        location.replace(hash);
      } else {
        location.hash = hash;
      }
    },

    onLeave(fn) {
      if (typeof fn === "function") this._cleanups.push(fn);
    },

    _runCleanups() {
      this._cleanups.forEach(fn => { try { fn(); } catch (e) { console.warn(e); } });
      this._cleanups = [];
    },

    async render() {
      const segs = this.parse();
      const m = this.match(segs) || this.match(["home"]);
      const main = document.getElementById("appMain");
      if (!main) return;

      this._runCleanups();
      // stop audio when leaving screens that use it (unless navigating inside journey)
      if (App.Player && typeof App.Player.stopAll === "function") {
        const insideAudio = ["journey", "recite", "repeat", "review-session", "surah"].includes(segs[0]);
        if (!insideAudio) App.Player.stopAll();
      }

      let view = null;
      try {
        view = m.fn(m.params) || {};
      } catch (e) {
        console.error("route render error", segs, e);
        view = {
          html: '<div class="empty-state"><span class="ico" data-ico="alert"></span><p>حدث خطأ غير متوقع</p><span>حاول مرة أخرى</span></div>',
          nav: "home"
        };
      }

      main.innerHTML = view.html || "";
      main.classList.remove("screen-enter");
      void main.offsetWidth; // reflow to restart animation
      main.classList.add("screen-enter");
      window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

      // fill icon placeholders
      if (App.fillIcons) App.fillIcons(main);

      this.current = segs.join("/");
      this.setNav(view.nav || segs[0]);

      if (view.mount) {
        try { view.mount(main); } catch (e) { console.error("route mount error", segs, e); }
      }
    },

    setNav(key) {
      document.querySelectorAll(".nav-item").forEach(btn => {
        const on = btn.dataset.nav === key;
        btn.classList.toggle("active", on);
        if (on) btn.setAttribute("aria-current", "page");
        else btn.removeAttribute("aria-current");
      });
    },

    start() {
      window.addEventListener("hashchange", () => this.render());
      this.render();
    }
  };

  /* global click delegation: data-href (روابط التنقل) + data-action (أزرار الأفعال) */
  function bindDelegation() {
    document.addEventListener("click", (e) => {
      const goEl = e.target.closest("[data-href]");
      if (goEl) {
        e.preventDefault();
        App.Router.go(goEl.dataset.href);
        return;
      }
      const actEl = e.target.closest("[data-action]");
      if (actEl) {
        const name = actEl.dataset.action;
        const fn = App.actions[name];
        if (typeof fn === "function") {
          fn(actEl, e);
        } else {
          console.warn("missing action:", name);
        }
      }
    });
  }

  App.Router = Router;
  App.bindDelegation = bindDelegation;
})();
