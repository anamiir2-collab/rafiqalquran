/* ============================================================
   رفيق القرآن للأطفال — parent.js
   لوحة ولي الأمر: تقارير + وقت التعلم + شهادات + نسخ احتياطي
   البيانات محلية، والبنية جاهزة للربط بـ Supabase مستقبلًا.
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  const P = {
    gateOK: false,

    /* ---------- بوابة ولي الأمر ---------- */
    pageGate() {
      if (P.gateOK) return P.dashboard();
      const a = 3 + Math.floor(Math.random() * 9);
      const b = 4 + Math.floor(Math.random() * 9);
      return {
        nav: "more",
        html: `
        <header class="screen-head">
          <button class="icon-btn btn-back" data-href="#/more"><span class="ico" data-ico="chevronRight"></span></button>
          <div class="sh-title"><h1>لوحة ولي الأمر</h1><p>هذه المنطقة للكبار</p></div>
        </header>
        <div class="gate-card">
          <div class="gate-ico"><span class="ico" data-ico="lock"></span></div>
          <div class="bold">للدخول أجب عن السؤال:</div>
          <div class="gate-q">${App.arDigits(a)} + ${App.arDigits(b)} = ؟</div>
          <input type="number" inputmode="numeric" class="gate-input" id="gateAnswer" aria-label="الإجابة">
          <div><button class="btn btn-primary btn-block mt-16" data-action="parent-gate" data-ans="${a + b}">دخول</button></div>
          <p class="gate-hint">سؤال بسيط يمنع الأطفال الصغار من الدخول</p>
        </div>`,
        mount() {}
      };
    },

    /* ---------- اللوحة ---------- */
    dashboard() {
      const st = App.Storage.state;
      const mastery = App.Revision.overallMastery();
      const li = App.Rewards.levelInfo(st.rewards.points);
      const memAyahs = App.Storage.countMemorizedAyahs();
      const mastered = App.Storage.countMasteredSurahs();

      // weekly chart (last 7 days)
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = App.Storage._todayKey(d);
        const sec = st.stats.dailySeconds[key] || 0;
        days.push({ key, sec, label: d.toLocaleDateString("ar-EG", { weekday: "short" }), today: i === 0 });
      }
      const maxSec = Math.max(60, ...days.map(d => d.sec));
      const weekTotal = days.reduce((s, d) => s + d.sec, 0);

      const reports = App.Quran.all()
        .filter(s => st.progress[s.number])
        .map(s => {
          const p = st.progress[s.number];
          const pct = Math.round((p.memorized.length / s.ayahsCount) * 100);
          return { s, p, pct };
        }).sort((a, b) => b.pct - a.pct || a.s.number - b.s.number);

      const completed = reports.filter(r => r.p.status === "mastered");

      return {
        nav: "more",
        html: `
        <header class="screen-head">
          <button class="icon-btn btn-back" data-href="#/more"><span class="ico" data-ico="chevronRight"></span></button>
          <div class="sh-title"><h1>لوحة ولي الأمر</h1><p>متابعة تقدم ${st.profile.name || "الطفل"}</p></div>
          <button class="icon-btn" data-href="#/more/settings"><span class="ico" data-ico="settings"></span></button>
        </header>

        <div class="stat-grid">
          <div class="stat-card">
            <span class="sc-ico" style="background:var(--c-primary-light);color:var(--c-primary-dark)"><span class="ico" data-ico="book"></span></span>
            <div class="stat-value">${App.arDigits(memAyahs)}</div><div class="stat-label">آية محفوظة</div>
          </div>
          <div class="stat-card">
            <span class="sc-ico" style="background:var(--c-success-light);color:var(--c-success)"><span class="ico" data-ico="medal"></span></span>
            <div class="stat-value">${App.arDigits(mastered)}</div><div class="stat-label">سورة مكتملة</div>
          </div>
          <div class="stat-card">
            <span class="sc-ico" style="background:var(--c-gold-light);color:var(--c-gold-deep)"><span class="ico" data-ico="star"></span></span>
            <div class="stat-value">${App.arDigits(st.rewards.stars)}</div><div class="stat-label">نجمة</div>
          </div>
          <div class="stat-card">
            <span class="sc-ico" style="background:var(--c-turquoise-light);color:#1E7E71"><span class="ico" data-ico="clock"></span></span>
            <div class="stat-value">${App.arDigits(Math.round(weekTotal / 60))}</div><div class="stat-label">دقيقة هذا الأسبوع</div>
          </div>
        </div>

        <div class="card chart-card section-gap">
          <div class="card-title"><span class="ico" data-ico="chart"></span> وقت التعلم — آخر 7 أيام</div>
          <div class="week-chart">
            ${days.map(d => `
            <div class="wc-col ${d.today ? "today" : ""}">
              <span class="wc-val">${d.sec >= 60 ? App.arDigits(Math.round(d.sec / 60)) + "د" : (d.sec ? App.arDigits(d.sec) + "ث" : "—")}</span>
              <div class="wc-bar" style="height:${Math.max(4, (d.sec / maxSec) * 72)}px"></div>
              <span class="wc-day">${d.label}</span>
            </div>`).join("")}
          </div>
        </div>

        <div class="card section-gap">
          <div class="card-title"><span class="ico" data-ico="brain"></span> مستوى الإتقان</div>
          <div class="mastery-meter">
            <div class="ring">${App.ringSvg(74, 8, mastery, "green")}<span class="ring-center" style="font-size:.85rem">${App.arDigits(mastery)}٪</span></div>
            <div class="mm-info">
              <div class="mm-title">${li.title} — المستوى ${App.arDigits(li.level)}</div>
              <div class="mm-sub">${App.arDigits(st.rewards.points)} نقطة — ${App.arDigits(st.rewards.badges.length)} وسام — سلسلة ${App.arDigits(App.Storage.streak())} ${App.arDigits("") || ""}يوم</div>
              <div class="mm-sub">مراجعات ناجحة: ${App.arDigits(st.stats.reviewsDone)} — إجابات صحيحة: ${App.arDigits(st.stats.quizCorrect)}</div>
            </div>
          </div>
        </div>

        <div class="card section-gap">
          <div class="card-title"><span class="ico" data-ico="list"></span> تقرير السور</div>
          ${reports.length ? reports.map(r => `
          <div class="report-row">
            <div class="rr-name">سورة ${r.s.name}
              <div class="rr-meta">${App.arDigits(r.p.memorized.length)}/${App.arDigits(r.s.ayahsCount)} آية — إتقان ${App.arDigits(r.p.mastery)}٪</div>
            </div>
            <div class="progress-track rr-bar"><div class="progress-fill ${r.p.status === "mastered" ? "green" : ""}" style="width:${r.pct}%"></div></div>
            <span class="rr-val">${App.arDigits(r.pct)}٪</span>
          </div>`).join("") : `<div class="empty-state"><p>لم يبدأ الحفظ بعد</p></div>`}
        </div>

        <div class="card section-gap">
          <div class="card-title"><span class="ico" data-ico="certificate"></span> شهادة إتقان</div>
          <p class="small text-soft mb-8">اختر سورة مكتملة واطبع شهادة تقدير لطفلك</p>
          ${completed.length ? `
          <div class="row">
            <select class="field grow" id="certSurah" style="margin-bottom:0">
              ${completed.map(r => `<option value="${r.s.number}">سورة ${r.s.name}</option>`).join("")}
            </select>
            <button class="btn btn-gold" data-action="parent-cert"><span class="ico" data-ico="certificate"></span> إنشاء</button>
          </div>
          <div class="cert-preview hidden" id="certPreview"></div>` : `<p class="small text-faint">أكمل أول سورة لتظهر الشهادات هنا</p>`}
        </div>

        <div class="card section-gap">
          <div class="card-title"><span class="ico" data-ico="download"></span> إدارة البيانات</div>
          <div class="data-actions">
            <button class="btn btn-soft btn-block" data-action="parent-export"><span class="ico" data-ico="download"></span> تصدير نسخة احتياطية</button>
            <button class="btn btn-soft btn-block" data-action="parent-import"><span class="ico" data-ico="upload"></span> استيراد نسخة احتياطية</button>
            <input type="file" id="importFile" accept=".json,application/json" class="file-input-hidden">
            <button class="btn btn-danger btn-block" data-action="parent-reset"><span class="ico" data-ico="trash"></span> إعادة تعيين كل التقدم</button>
          </div>
          <p class="tiny text-faint mt-12">البيانات محفوظة على هذا الجهاز فقط. صدّر نسخة احتياطية بشكل دوري. النظام مصمم لربطه بمزامنة سحابية (مثل Supabase) مستقبلًا دون تغيير الواجهة.</p>
        </div>`,
        mount(el) {
          // import handler
          const file = el.querySelector("#importFile");
          if (file) {
            file.addEventListener("change", (e) => {
              const f = e.target.files[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (App.Storage.import(reader.result)) {
                  App.toast("تم استيراد البيانات بنجاح", "success");
                  App.Router.render();
                } else {
                  App.toast("ملف غير صالح", "error");
                }
              };
              reader.readAsText(f);
            });
          }
        }
      };
    },

    /* ---------- الشهادة ---------- */
    makeCertificate(surahNo) {
      const st = App.Storage.state;
      const s = App.Quran.surah(surahNo);
      const p = st.progress[surahNo];
      const canvas = document.createElement("canvas");
      canvas.width = 1200; canvas.height = 850;
      const ctx = canvas.getContext("2d");
      ctx.direction = "rtl";
      ctx.textAlign = "center";

      // background
      ctx.fillStyle = "#FBF6EC"; ctx.fillRect(0, 0, 1200, 850);
      ctx.strokeStyle = "#C9881B"; ctx.lineWidth = 14; ctx.strokeRect(30, 30, 1140, 790);
      ctx.strokeStyle = "#0C7A5C"; ctx.lineWidth = 3; ctx.strokeRect(52, 52, 1096, 746);

      // header band
      ctx.fillStyle = "#0C7A5C"; ctx.fillRect(52, 52, 1096, 130);
      ctx.fillStyle = "#F5C063";
      ctx.font = "bold 54px Tajawal, sans-serif";
      ctx.fillText("شهادة إتقان", 600, 118);
      ctx.fillStyle = "#FFF6E2";
      ctx.font = "26px Tajawal, sans-serif";
      ctx.fillText("رفيق القرآن للأطفال — جزء عمّ", 600, 162);

      ctx.fillStyle = "#22312C";
      ctx.font = "30px Tajawal, sans-serif";
      ctx.fillText("تشهد إدارة التطبيق بأن المتعلم البطل", 600, 260);

      ctx.fillStyle = "#0C7A5C";
      ctx.font = "bold 62px Tajawal, sans-serif";
      ctx.fillText(st.profile.name || "بطل القرآن", 600, 345);

      ctx.fillStyle = "#22312C";
      ctx.font = "30px Tajawal, sans-serif";
      ctx.fillText("قد أتمّ حفظ وإتقان", 600, 430);

      ctx.fillStyle = "#C9881B";
      ctx.font = "bold 58px Tajawal, sans-serif";
      ctx.fillText("سورة " + s.name + " كاملة (" + App.arDigits(s.ayahsCount) + " آية)", 600, 505);

      // stars
      const stars = p.mastery >= 95 ? 3 : (p.mastery >= 80 ? 2 : 1);
      ctx.font = "52px serif";
      ctx.fillStyle = "#E8A93E";
      for (let i = 0; i < stars; i++) ctx.fillText("★", 600 - (stars - 1) * 40 + i * 80, 590);

      ctx.fillStyle = "#5F6F68";
      ctx.font = "26px Tajawal, sans-serif";
      const dateStr = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
      let hijri = "";
      try {
        hijri = " هـ — الموافق " + new Intl.DateTimeFormat("ar-EG-u-ca-islamic", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
      } catch (e) {}
      ctx.fillText("التاريخ: " + dateStr + hijri, 600, 665);
      ctx.fillText("مستوى الإتقان: " + App.arDigits(p.mastery) + "٪", 600, 710);

      ctx.fillStyle = "#0C7A5C";
      ctx.font = "bold 24px Tajawal, sans-serif";
      ctx.fillText("«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»", 600, 765);

      return canvas;
    },

    showCertificate(surahNo) {
      const canvas = P.makeCertificate(surahNo);
      const preview = document.getElementById("certPreview");
      if (!preview) return;
      preview.innerHTML = "";
      preview.appendChild(canvas);
      preview.classList.remove("hidden");
      preview.scrollIntoView({ behavior: "smooth", block: "center" });
      // download button
      const dl = document.createElement("button");
      dl.className = "btn btn-primary btn-block mt-12";
      dl.innerHTML = '<span class="ico" data-ico="download"></span> حفظ الشهادة كصورة';
      dl.addEventListener("click", () => {
        const a = document.createElement("a");
        a.download = "شهادة-" + App.Quran.surah(surahNo).name + ".png";
        a.href = canvas.toDataURL("image/png");
        a.click();
      });
      preview.appendChild(dl);
      if (App.fillIcons) App.fillIcons(preview);
    },

    exportData() {
      const blob = new Blob([App.Storage.export()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "rafiq-backup-" + App.Storage._todayKey() + ".json";
      a.click();
      App.toast("تم تنزيل النسخة الاحتياطية", "success");
    }
  };

  App.actions["parent-gate"] = (el) => {
    const val = document.getElementById("gateAnswer");
    if (val && Number(val.value) === Number(el.dataset.ans)) {
      P.gateOK = true;
      App.Router.render();
    } else {
      App.toast("إجابة غير صحيحة — حاول مرة أخرى", "error");
    }
  };
  App.actions["parent-cert"] = () => {
    const sel = document.getElementById("certSurah");
    if (sel) P.showCertificate(Number(sel.value));
  };
  App.actions["parent-export"] = () => P.exportData();
  App.actions["parent-import"] = () => {
    const f = document.getElementById("importFile");
    if (f) f.click();
  };
  App.actions["parent-reset"] = () => {
    App.confirm("هل أنت متأكد من إعادة تعيين كل التقدم؟ لا يمكن التراجع عن هذا الإجراء.", () => {
      App.Storage.reset();
      P.gateOK = false;
      App.toast("تمت إعادة التعيين", "success");
      App.Router.go("#/home");
    });
  };

  App.Parent = P;
})();
