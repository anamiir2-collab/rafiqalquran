/* ============================================================
   رفيق القرآن للأطفال — morals.js
   حديقة الأخلاق: مواقف تفاعلية (صدق، أمانة، بر الوالدين...)
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  const M = {
    data: null,

    load() {
      if (this.data) return Promise.resolve(this.data);
      return fetch("./data/morals.json")
        .then(r => r.json())
        .then(json => { this.data = json.topics; return json; })
        .catch(e => { console.error("morals load failed", e); throw e; });
    },

    ensure(fn) {
      if (this.data) { fn(); return; }
      this.load().then(() => App.Router.render()).catch(() => App.toast("تعذر تحميل بيانات الأخلاق", "error"));
    },

    byId(id) { return (this.data || []).find(t => t.id === id); },

    /* ---------- القائمة ---------- */
    pageMorals() {
      if (!this.data) { M.ensure(); return { nav: "more", html: App.loadingHtml() }; }
      const done = App.Storage.state.stats.moralsDone;
      return {
        nav: "more",
        html: `
        <header class="screen-head">
          <button class="icon-btn btn-back" data-href="#/more"><span class="ico" data-ico="chevronRight"></span></button>
          <div class="sh-title"><h1>حديقة الأخلاق</h1><p>ازرع أخلاقًا جميلة في قلبك</p></div>
          <span class="chip chip-success">${App.arDigits(done.length)}/${App.arDigits(this.data.length)}</span>
        </header>

        <div class="card journey-card" style="margin-bottom:14px">
          <div class="jc-head">
            <span class="jc-ico" style="background:linear-gradient(135deg,#57B98A,#2E8F63)"><span class="ico" data-ico="leaf"></span></span>
            <span class="grow" style="text-align:right">
              <span class="jc-title">كيف تتصرف في المواقف؟</span>
              <span class="jc-sub">اختر التصرف الصحيح وكسب النجوم والزهور</span>
            </span>
          </div>
        </div>

        <div class="quick-grid">
          ${this.data.map(t => `
          <button class="quick-card" data-href="#/moral/${t.id}">
            ${done.includes(t.id) ? '<span class="quick-badge"><span class="ico" data-ico="check" style="width:12px;height:12px"></span></span>' : ""}
            <span class="quick-ico" style="background:${t.color}"><span class="ico" data-ico="${t.icon}"></span></span>
            <span><span class="quick-title">${t.title}</span><br><span class="quick-sub">${t.subtitle}</span></span>
          </button>`).join("")}
        </div>`,
        mount() {}
      };
    },

    /* ---------- صفحة الموقف ---------- */
    pageMoral(params) {
      if (!this.data) { M.ensure(); return { nav: "more", html: App.loadingHtml() }; }
      const t = M.byId(params.id);
      if (!t) return { nav: "more", html: App.emptyHtml("الموقف غير موجود") };

      return {
        nav: "more",
        html: `
        <header class="screen-head">
          <button class="icon-btn btn-back" data-href="#/morals"><span class="ico" data-ico="chevronRight"></span></button>
          <div class="sh-title"><h1>${t.title}</h1><p>${t.subtitle}</p></div>
        </header>

        <div class="card" style="background:${t.color};color:#fff;text-align:center;padding:18px">
          <span class="ico" style="width:38px;height:38px;margin:0 auto 8px" data-ico="${t.icon}"></span>
          <div class="bold" style="font-size:1.1rem">${t.intro}</div>
        </div>

        <div data-moral-flow class="mt-16"></div>
        `,
        mount(el) {
          const flow = el.querySelector("[data-moral-flow]");
          let scenarioIdx = 0;
          let correctCount = 0;
          const total = t.scenarios.length;

          function renderScenario() {
            const sc = t.scenarios[scenarioIdx];
            flow.innerHTML = `
            <div class="moral-scenario">
              <div class="row-between mb-8">
                <span class="chip chip-gold">موقف ${App.arDigits(scenarioIdx + 1)} من ${App.arDigits(total)}</span>
              </div>
              <div class="moral-q">${sc.situation}</div>
              <div data-choices>
                ${sc.choices.map((c, i) => `
                <button class="moral-choice" data-ci="${i}">
                  <span class="ico mc-ico" data-ico="circle"></span> ${c.text}
                </button>`).join("")}
              </div>
              <div data-feedback></div>
            </div>`;
            if (App.fillIcons) App.fillIcons(flow);

            flow.querySelectorAll(".moral-choice").forEach(btn => {
              btn.addEventListener("click", () => {
                const choice = sc.choices[Number(btn.dataset.ci)];
                const fb = flow.querySelector("[data-feedback]");
                flow.querySelectorAll(".moral-choice").forEach(b => b.disabled = true);
                if (choice.correct) {
                  btn.classList.add("correct");
                  btn.querySelector(".mc-ico").innerHTML = App.icons.check;
                  correctCount++;
                  fb.innerHTML = `<div class="moral-feedback good">${choice.feedback}</div>
                    ${sc.reference ? `<div class="moral-feedback good mt-8" style="background:var(--c-gold-soft);color:var(--c-gold-deep)">${sc.reference}</div>` : ""}`;
                  App.haptic(20);
                } else {
                  btn.classList.add("wrong");
                  btn.querySelector(".mc-ico").innerHTML = App.icons.x;
                  const rightBtn = flow.querySelectorAll(".moral-choice")[sc.choices.findIndex(c => c.correct)];
                  rightBtn.classList.add("correct");
                  rightBtn.querySelector(".mc-ico").innerHTML = App.icons.check;
                  fb.innerHTML = `<div class="moral-feedback bad">${choice.feedback}</div>`;
                }
                const nextBtn = document.createElement("button");
                nextBtn.className = "btn btn-primary btn-block mt-12";
                nextBtn.innerHTML = scenarioIdx + 1 < total
                  ? '<span class="ico" data-ico="chevronLeft"></span> الموقف التالي'
                  : '<span class="ico" data-ico="trophy"></span> إنهاء الحديقة';
                nextBtn.addEventListener("click", () => {
                  scenarioIdx++;
                  if (scenarioIdx < total) renderScenario();
                  else finish();
                });
                fb.appendChild(nextBtn);
                if (App.fillIcons) App.fillIcons(fb);
              });
            });
          }

          function finish() {
            const first = !App.Storage.state.stats.moralsDone.includes(t.id);
            if (first) App.Storage.addMoralDone(t.id);
            flow.innerHTML = `
            <div class="card result-card">
              <div class="result-emoji-ring"><span class="ico" data-ico="leaf"></span></div>
              <div class="result-title">زهرت حديقة أخلاقك!</div>
              <div class="result-sub">${App.arDigits(correctCount)} إجابة صحيحة من ${App.arDigits(total)} في موقف ${t.title}</div>
              <div class="modal-actions">
                <button class="btn btn-ghost" data-href="#/morals"><span class="ico" data-ico="leaf"></span> مواقف أخرى</button>
                <button class="btn btn-primary" data-href="#/home"><span class="ico" data-ico="home"></span> الرئيسية</button>
              </div>
            </div>`;
            if (App.fillIcons) App.fillIcons(flow);
            App.Rewards.grant({
              stars: first ? t.stars : 1,
              points: correctCount * 5,
              reason: first ? `أكملت موقف ${t.title}` : "تدربت على موقف أخلاقي"
            }, !first);
          }

          renderScenario();
        }
      };
    }
  };

  App.Morals = M;
})();
