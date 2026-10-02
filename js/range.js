/* ============================================================
   رفيق القرآن للأطفال — range.js
   نظام نطاق الحفظ المركزي (Memorization Range)
   المصدر الوحيد للنطاق: السورة + من آية + إلى آية
   تستخدمه: التلاوة + المشغل + الحفظ + التحديات + المراجعة
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  /*
   * بنية النطاق:
   *   { surah: <number>, from: <ayahNo>, to: <ayahNo> }
   *
   * مكان التخزين: داخل state.session.range = [from, to]
   *               + state.session.surah
   * نقرأ ونكتب من نفس مكان التخزين الذي يستخدمه memorization.js
   * لكن نوفّر API واضح ومركزي لا يكرر المنطق.
   */

  const Range = {
    /* ---------- الحصول على النطاق الحالي ---------- */
    get() {
      const st = App.Storage.state;
      const sess = st.session;
      if (!sess || !sess.range || !sess.surah) return null;
      const [from, to] = sess.range;
      return { surah: sess.surah, from: Number(from), to: Number(to) };
    },

    /* ---------- هل النطاق صالح حاليًا ---------- */
    isValid() {
      const r = this.get();
      if (!r) return false;
      const s = App.Quran.surah(r.surah);
      if (!s) return false;
      return r.from >= 1 && r.to >= r.from && r.to <= s.ayahsCount;
    },

    /* ---------- هل يوجد سورة بهذا الرقم ---------- */
    surahExists(n) {
      if (!App.Quran.data) return false;
      return !!App.Quran.surah(n);
    },

    /* ---------- التحقق من نطاق مقترح ---------- */
    validate(surah, from, to) {
      const errors = [];
      if (!surah || isNaN(Number(surah))) {
        errors.push("اختار سورة صحيحة من القائمة");
        return errors;
      }
      const s = App.Quran.surah(Number(surah));
      if (!s) {
        errors.push("السورة غير موجودة في بيانات التطبيق");
        return errors;
      }
      const f = Number(from);
      const t = Number(to);
      if (isNaN(f) || f === 0) {
        errors.push("اختار بداية صحيحة للنطاق");
      } else if (f < 1) {
        errors.push("رقم أول آية يجب أن يكون ١ أو أكبر");
      } else if (f > s.ayahsCount) {
        errors.push(`أول آية أكبر من عدد آيات السورة (${App.arDigits(s.ayahsCount)} آية)`);
      }
      if (isNaN(t) || t === 0) {
        errors.push("اختار نهاية صحيحة للنطاق");
      } else if (t < 1) {
        errors.push("رقم آخر آية يجب أن يكون ١ أو أكبر");
      } else if (t > s.ayahsCount) {
        errors.push(`آخر آية أكبر من عدد آيات السورة (${App.arDigits(s.ayahsCount)} آية)`);
      }
      if (!isNaN(f) && !isNaN(t) && f > 0 && t > 0 && t < f) {
        errors.push("الآية الأخيرة يجب أن تكون بعد الآية الأولى");
      }
      return errors;
    },

    /* ---------- حفظ النطاق ---------- */
    set(surah, from, to) {
      const errors = this.validate(surah, from, to);
      if (errors.length) {
        return { ok: false, errors };
      }
      const s = Number(surah);
      const f = Math.max(1, Math.min(Number(from), App.Quran.surah(s).ayahsCount));
      const t = Math.max(f, Math.min(Number(to), App.Quran.surah(s).ayahsCount));

      // ابدأ جلسة جديدة أو حدّث الحالية
      const st = App.Storage.state;
      if (!st.session || st.session.surah !== s) {
        st.session = {
          surah: s,
          range: [f, t],
          step: "listen",
          listened: [],
          recited: [],
          quizResult: null,
          rewarded: false,
          startedAt: Date.now()
        };
      } else {
        // حدّث النطاق داخل الجلسة الحالية وأعد ضبط التقدم الجزئي
        st.session.range = [f, t];
        st.session.step = "listen";
        st.session.listened = [];
        st.session.recited = [];
        st.session.quizResult = null;
        st.session.rewarded = false;
        st.session.startedAt = Date.now();
      }
      App.Storage.save();
      App.Storage.setLastAyah(s, t);
      return { ok: true, errors: [] };
    },

    /* ---------- الحصول على آيات النطاق ---------- */
    ayahs() {
      const r = this.get();
      if (!r) return [];
      const s = App.Quran.surah(r.surah);
      if (!s) return [];
      return s.ayahs.filter(a => a.number >= r.from && a.number <= r.to);
    },

    /* ---------- قائمة {surah, ayah} للمشغل ---------- */
    playlist() {
      return this.ayahs().map(a => ({ surah: this.get().surah, ayah: a.number }));
    },

    /* ---------- عدد الآيات في النطاق ---------- */
    count() {
      const r = this.get();
      if (!r) return 0;
      return r.to - r.from + 1;
    },

    /* ---------- عدد آيات السورة ---------- */
    surahAyahCount(n) {
      const s = App.Quran.surah(n);
      return s ? s.ayahsCount : 0;
    },

    /* ---------- الاختيارات السريعة (presets) ---------- */
    quickPresets(surahNo) {
      const s = App.Quran.surah(surahNo);
      if (!s) return [];
      const n = s.ayahsCount;
      const presets = [];
      // ورد ٥ آيات
      if (n >= 5) {
        presets.push({ id: "5", label: "٥ آيات", from: 1, to: Math.min(5, n) });
      }
      // ورد ١٠ آيات
      if (n >= 10) {
        presets.push({ id: "10", label: "١٠ آيات", from: 1, to: Math.min(10, n) });
      } else if (n > 5) {
        // لو السورة فيها بين ٦ و٩ آيات، اعرض خيار "آيات أكثر" يحتوي على السورة كاملة
        presets.push({ id: "10", label: "أكبر ورد", from: 1, to: n });
      }
      // صفحة كاملة (نقرب إلى ١٥ آية تقريبًا، أو نأخذ ما يقاربها)
      if (n >= 15) {
        presets.push({ id: "page", label: "صفحة كاملة", from: 1, to: Math.min(15, n) });
      }
      // السورة كاملة
      presets.push({ id: "all", label: "السورة كاملة", from: 1, to: n });
      return presets;
    },

    /* ---------- نص وصف النطاق ---------- */
    description() {
      const r = this.get();
      if (!r) return "";
      const s = App.Quran.surah(r.surah);
      if (!s) return "";
      return `سورة ${s.name} — من الآية ${App.arDigits(r.from)} إلى الآية ${App.arDigits(r.to)}`;
    },

    /* ---------- HTML لشريط النطاق ---------- */
    barHtml() {
      const r = this.get();
      if (!r) return "";
      const s = App.Quran.surah(r.surah);
      if (!s) return "";
      return `
        <div class="range-bar" data-range-bar>
          <span class="rb-ico"><span class="ico" data-ico="target"></span></span>
          <span class="rb-info">
            <div class="rb-title">نطاق الحفظ الحالي</div>
            <div class="rb-sub">سورة ${s.name} — من الآية ${App.arDigits(r.from)} إلى الآية ${App.arDigits(r.to)}</div>
          </span>
          <button class="rb-btn" data-href="#/range" aria-label="تغيير النطاق">
            <span class="ico" data-ico="edit" style="width:16px;height:16px"></span>
            تغيير
          </button>
        </div>`;
    },

    /* ---------- رسالة فارغة إن لم يوجد نطاق ---------- */
    emptyHtml() {
      return `
        <div class="card center" style="padding:24px 16px">
          <span class="ico" data-ico="target" style="width:42px;height:42px;margin:0 auto 10px;color:var(--c-primary)"></span>
          <p class="bold" style="font-size:1rem;color:var(--c-primary-deep);margin-bottom:4px">لا يوجد نطاق حفظ بعد</p>
          <p class="small text-soft mb-12">اختر السورة والآيات التي تريد أن تتعلمها اليوم</p>
          <button class="btn btn-primary" data-href="#/range">
            <span class="ico" data-ico="target"></span>
            اختيار نطاق الحفظ
          </button>
        </div>`;
    },

    /* ================= الأوراد المحفوظة (Multiple Ranges) ================= */

    /* ---------- قائمة الأوراد المحفوظة ---------- */
    listSaved() {
      return App.Storage.getRanges();
    },

    /* ---------- حفظ النطاق الحالي كورد جديد ---------- */
    saveCurrentAs(label, surah, from, to) {
      // استخدم القيم الحالية من النموذج إن لم تُمرَّر
      const s = surah != null ? Number(surah) : null;
      const f = from != null ? Number(from) : null;
      const t = to != null ? Number(to) : null;
      // تحقق من صحة القيم
      const errors = this.validate(s, f, t);
      if (errors.length) return { ok: false, errors };
      // تحقق من التكرار (نفس السورة + من + إلى)
      const dup = (App.Storage.state.ranges || []).find(r =>
        r.surah === Number(s) && r.from === Number(f) && r.to === Number(t)
      );
      if (dup) {
        // حدّث الاسم فقط وحدّث lastUsedAt
        if (label && label.trim() && label.trim() !== dup.label) {
          App.Storage.updateRange(dup.id, { label: label.trim() });
        }
        App.Storage.touchRange(dup.id);
        return { ok: true, id: dup.id, duplicate: true };
      }
      // أنشئ وردًا جديدًا
      const surahObj = App.Quran.surah(Number(s));
      const defaultLabel = label && label.trim()
        ? label.trim()
        : `سورة ${surahObj.name} — من ${App.arDigits(f)} إلى ${App.arDigits(t)}`;
      const entry = App.Storage.saveRange({ label: defaultLabel, surah: s, from: f, to: t });
      return { ok: true, id: entry.id };
    },

    /* ---------- تفعيل ورد محفوظ ---------- */
    activateSaved(id) {
      const r = App.Storage.getRangeById(id);
      if (!r) return { ok: false, errors: ["الوارد غير موجود"] };
      const result = this.set(r.surah, r.from, r.to);
      if (!result.ok) return result;
      App.Storage.touchRange(id);
      return { ok: true };
    },

    /* ---------- حذف ورد محفوظ ---------- */
    deleteSaved(id) {
      return App.Storage.deleteRange(id);
    },

    /* ---------- إعادة تسمية ورد ---------- */
    renameSaved(id, label) {
      const t = (label || "").trim();
      if (!t) return { ok: false, errors: ["الاسم لا يمكن أن يكون فارغًا"] };
      if (t.length > 40) return { ok: false, errors: ["الاسم طويل جدًا (أقصى ٤٠ حرفًا)"] };
      const ok = App.Storage.updateRange(id, { label: t });
      return { ok, errors: ok ? [] : ["الوارد غير موجود"] };
    },

    /* ---------- HTML لقسم الأوراد المحفوظة ---------- */
    savedListHtml() {
      const list = this.listSaved();
      if (!list.length) {
        return `
        <div class="card center" style="padding:18px 14px">
          <span class="ico" data-ico="bookmark" style="width:34px;height:34px;margin:0 auto 8px;color:var(--c-text-faint);opacity:.5"></span>
          <p class="small text-soft">لا توجد أوراد محفوظة بعد</p>
          <p class="tiny text-faint mt-4">اختر نطاقًا ثم اضغط «حفظ كورد» لإضافته هنا</p>
        </div>`;
      }
      const current = this.get();
      const items = list.map(r => {
        const s = App.Quran.surah(r.surah);
        if (!s) return ""; // skip if surah doesn't exist
        const isActive = current && current.surah === r.surah && current.from === r.from && current.to === r.to;
        const cnt = r.to - r.from + 1;
        return `
        <div class="saved-range ${isActive ? "active" : ""}">
          <div class="sr-info">
            <div class="sr-label">${App.esc(r.label)} ${isActive ? '<span class="chip chip-success">نشط</span>' : ''}</div>
            <div class="sr-meta">سورة ${s.name} — من الآية ${App.arDigits(r.from)} إلى الآية ${App.arDigits(r.to)} (${App.arDigits(cnt)} آيات)</div>
          </div>
          <div class="sr-actions">
            ${isActive ? "" : `<button class="btn btn-sm btn-primary sr-activate" data-action="range-activate" data-id="${r.id}" aria-label="تفعيل الورد">تفعيل</button>`}
            <button class="icon-btn sr-rename" data-action="range-rename" data-id="${r.id}" data-label="${App.esc(r.label)}" aria-label="إعادة تسمية"><span class="ico" data-ico="pen" style="width:18px;height:18px"></span></button>
            <button class="icon-btn sr-delete" data-action="range-delete" data-id="${r.id}" data-label="${App.esc(r.label)}" aria-label="حذف" style="color:var(--c-danger)"><span class="ico" data-ico="trash" style="width:18px;height:18px"></span></button>
          </div>
        </div>`;
      }).join("");
      return items;
    }
  };

  // أيقونة edit إن لم تكن موجودة (بعد تحميل app.js)
  // نضيفها بشكل مؤجل لتجنب مشاكل ترتيب التحميل
  setTimeout(() => {
    if (App.icons && !App.icons.edit) {
      App.icons.edit = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    }
  }, 0);

  App.Range = Range;
})();
