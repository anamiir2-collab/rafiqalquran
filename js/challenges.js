/* ============================================================
   رفيق القرآن للأطفال — challenges.js
   محرك الألعاب: ترتيب الكلمات، الكلمة المفقودة، أكمل الآية،
   ما الآية التالية، رتب الآيات، اختر الإجابة الصحيحة، الذاكرة
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  const DEFAULT_SURAHS = [112, 108, 113, 114, 110, 103, 105, 106, 111];

  function tokenize(text) { return text.split(/\s+/).filter(Boolean); }

  /* إرجاع نطاق الحفظ الحالي أو null */
  function currentRange() {
    return (App.Range && App.Range.isValid()) ? App.Range.get() : null;
  }

  /* تصفية آيات السورة بناء على النطاق */
  function filterAyahsByRange(s, range) {
    if (!range) return s.ayahs;
    return s.ayahs.filter(a => a.number >= range.from && a.number <= range.to);
  }

  function pickSurahs(minAyahs) {
    // لو هناك نطاق محفوظ، استخدم سورة النطاق فقط
    const range = currentRange();
    if (range) return [range.surah];
    // وبكل بس، اعرض كل السور التي فيها تقدم
    const st = App.Storage.state;
    const practiced = Object.keys(st.progress)
      .map(Number)
      .filter(n => {
        const p = st.progress[n];
        const s = App.Quran.surah(n);
        return s && (p.memorized || []).length >= Math.min(3, minAyahs || 3);
      });
    if (practiced.length >= 2) return practiced;
    return DEFAULT_SURAHS.slice();
  }

  function wordPool(surahNo, exclude) {
    const s = App.Quran.surah(surahNo);
    const range = currentRange();
    const ayahs = filterAyahsByRange(s, range && range.surah === surahNo ? range : null);
    const pool = [];
    ayahs.forEach(a => tokenize(a.text).forEach(w => {
      if (w.length >= 3 && !pool.includes(w)) pool.push(w);
    }));
    return pool.filter(w => w !== exclude);
  }

  function sample(arr, n, exclude) {
    const out = [];
    const copy = arr.slice();
    while (out.length < n && copy.length) {
      const i = Math.floor(Math.random() * copy.length);
      const v = copy.splice(i, 1)[0];
      if (exclude && exclude.includes(v)) continue;
      out.push(v);
    }
    return out;
  }

  function shuffleDiff(arr) {
    let out = arr.slice();
    for (let tries = 0; tries < 12; tries++) {
      out = App.shuffle(out);
      if (out.join(" ") !== arr.join(" ")) break;
    }
    return out;
  }

  function truncWords(text, n) {
    const t = tokenize(text);
    return t.length <= n ? text : t.slice(0, n).join(" ") + " …";
  }

  /* ================= مولدات الأسئلة ================= */
  const Gens = {

    wordOrder(surahNo, rangeOverride) {
      const s = App.Quran.surah(surahNo);
      const range = rangeOverride || (currentRange() && currentRange().surah === surahNo ? currentRange() : null);
      const allAyahs = filterAyahsByRange(s, range);
      const candidates = allAyahs.filter(a => {
        const t = tokenize(a.text);
        return t.length >= 3 && t.length <= 9;
      });
      if (!candidates.length) throw new Error("no candidates for wordOrder");
      const a = App.pick(candidates);
      const tokens = tokenize(a.text);
      const shuffled = shuffleDiff(tokens);
      return {
        type: "wordOrder",
        surah: surahNo, ayah: a.number,
        prompt: "رتّب كلمات الآية بالترتيب الصحيح",
        tokens: shuffled,
        answer: tokens,
        check(state) {
          return state.join(" ") === tokens.join(" ");
        }
      };
    },

    missingWord(surahNo, lastWord, rangeOverride) {
      const s = App.Quran.surah(surahNo);
      const range = rangeOverride || (currentRange() && currentRange().surah === surahNo ? currentRange() : null);
      const allAyahs = filterAyahsByRange(s, range);
      const candidates = allAyahs.filter(a => tokenize(a.text).length >= 4);
      if (!candidates.length) throw new Error("no candidates for missingWord");
      const a = App.pick(candidates);
      const tokens = tokenize(a.text);
      const idx = lastWord ? tokens.length - 1 : 1 + Math.floor(Math.random() * Math.max(1, tokens.length - 2));
      const correct = tokens[idx];
      const pool = wordPool(surahNo, correct);
      const distractors = sample(pool, 3);
      while (distractors.length < 3) distractors.push("آية" + distractors.length);
      const options = App.shuffle([correct, ...distractors]);
      const displayTokens = tokens.slice();
      displayTokens[idx] = '<span class="blank-slot">؟</span>';
      return {
        type: "missingWord",
        surah: surahNo, ayah: a.number,
        prompt: lastWord ? "أكمل الآية بالكلمة المناسبة" : "اختر الكلمة الناقصة",
        display: displayTokens.join(" "),
        options,
        answer: options.indexOf(correct),
        correctWord: correct
      };
    },

    completeAyah(surahNo, rangeOverride) { return Gens.missingWord(surahNo, true, rangeOverride); },

    nextAyah(surahNo, rangeOverride) {
      const s = App.Quran.surah(surahNo);
      const range = rangeOverride || (currentRange() && currentRange().surah === surahNo ? currentRange() : null);
      const allAyahs = filterAyahsByRange(s, range);
      if (allAyahs.length < 2) return Gens.missingWord(surahNo, false, rangeOverride);
      const idx = Math.floor(Math.random() * (allAyahs.length - 1));
      const cur = allAyahs[idx];
      const nxt = allAyahs[idx + 1];
      const others = allAyahs.filter(a => a.number !== nxt.number && a.number !== cur.number).map(a => truncWords(a.text, 8));
      let distractors = sample(others, 3);
      if (distractors.length < 3) {
        const otherS = pickSurahs(3).filter(n => n !== surahNo);
        otherS.forEach(n => {
          const os = App.Quran.surah(n);
          if (distractors.length < 3) distractors.push(truncWords(App.pick(os.ayahs).text, 8));
        });
      }
      const correct = truncWords(nxt.text, 8);
      const options = App.shuffle([correct, ...distractors]);
      return {
        type: "nextAyah",
        surah: surahNo, ayah: cur.number,
        prompt: "ما الآية التالية؟",
        display: truncWords(cur.text, 12),
        options,
        answer: options.indexOf(correct),
        fullNext: nxt.text
      };
    },

    orderAyahs(surahNo, rangeOverride) {
      const s = App.Quran.surah(surahNo);
      const range = rangeOverride || (currentRange() && currentRange().surah === surahNo ? currentRange() : null);
      const allAyahs = filterAyahsByRange(s, range);
      const candidates = [];
      for (let i = 0; i + 2 < allAyahs.length; i++) {
        const trio = [allAyahs[i], allAyahs[i + 1], allAyahs[i + 2]];
        if (trio.every(a => tokenize(a.text).length <= 8)) candidates.push(trio);
      }
      if (!candidates.length) return Gens.nextAyah(surahNo, rangeOverride);
      const trio = App.pick(candidates);
      const shuffled = shuffleDiff(trio.map(a => a.number));
      return {
        type: "orderAyahs",
        surah: surahNo,
        prompt: "رتّب الآيات الثلاث كما هي في السورة",
        items: shuffled.map(n => {
          const a = s.ayahs.find(x => x.number === n);
          return { n, text: truncWords(a.text, 10) };
        }),
        check(order) { return order.join(",") === trio.map(a => a.number).join(","); }
      };
    },

    mcq(surahNo, rangeOverride) {
      // استخدام mcq من نطاق السورة الحالي فقط
      const s = App.Quran.surah(surahNo || (currentRange() ? currentRange().surah : 112));
      const range = rangeOverride || (currentRange() && currentRange().surah === s.number ? currentRange() : null);
      const ayahs = filterAyahsByRange(s, range);
      if (!ayahs.length) throw new Error("no ayahs in range for mcq");
      const a = App.pick(ayahs);
      const correct = truncWords(a.text, 8);
      const others = ayahs.filter(x => x.number !== a.number).map(x => truncWords(x.text, 8));
      let distractors = sample(others, 3);
      while (distractors.length < 3) distractors.push("آية" + distractors.length);
      const options = App.shuffle([correct, ...distractors]);
      return {
        type: "mcq",
        surah: s.number, ayah: a.number,
        prompt: "أيّ هذه الآيات من سورة " + s.name + "؟",
        options,
        answer: options.indexOf(correct)
      };
    }
  };

  /* ================= اختبار الإتقان — كل آية محفوظة ================= */
  function buildMasteryQuiz(surahNo, rangeOverride) {
    const s = App.Quran.surah(Number(surahNo));
    if (!s) return [];

    const range = rangeOverride || (currentRange() && currentRange().surah === s.number ? currentRange() : null);
    const from = range ? Number(range.from) : 1;
    const to = range ? Number(range.to) : s.ayahsCount;

    const prog = App.Storage.prog(s.number);
    const memorized = new Set((prog && prog.memorized || []).map(Number));
    const ayahs = s.ayahs.filter(a =>
      memorized.has(Number(a.number)) &&
      Number(a.number) >= from &&
      Number(a.number) <= to
    );

    const questions = ayahs.map(a => {
      const tokens = tokenize(a.text);

      // الآيات القصيرة جدًا: سؤال اختيار الآية نفسها.
      if (tokens.length < 3) {
        const others = s.ayahs
          .filter(x => x.number !== a.number)
          .map(x => x.text);
        const distractors = sample(others, 3);
        while (distractors.length < 3) distractors.push("آية أخرى");
        const options = App.shuffle([a.text, ...distractors]);
        return {
          type: "masteryAyah",
          surah: s.number,
          ayah: a.number,
          prompt: "اختر نص الآية التي حفظتها",
          options,
          answer: options.indexOf(a.text)
        };
      }

      // كل آية محفوظة تحصل على سؤال مستقل.
      // نحذف كلمة من الآية ونطلب من الطفل إكمالها.
      const idx = 1 + Math.floor(Math.random() * (tokens.length - 1));
      const correct = tokens[idx];
      const pool = wordPool(s.number, correct);
      const distractors = sample(pool, 3);
      while (distractors.length < 3) distractors.push("كلمة");
      const options = App.shuffle([correct, ...distractors]);
      const displayTokens = tokens.slice();
      displayTokens[idx] = '<span class="blank-slot">؟</span>';

      return {
        type: "masteryAyah",
        surah: s.number,
        ayah: a.number,
        prompt: "أكمل الآية بالكلمة الصحيحة",
        display: displayTokens.join(" "),
        options,
        answer: options.indexOf(correct)
      };
    });

    return App.shuffle(questions);
  }

  /* ================= بناء اختبار ================= */
  function buildQuiz(surahIds, count, types, rangeOpts) {
    const qs = [];
    const usedTypes = types || ["wordOrder", "missingWord", "completeAyah", "nextAyah", "orderAyahs", "mcq"];
    let guard = 0;
    while (qs.length < count && guard < count * 8) {
      guard++;
      const sNo = App.pick(surahIds);
      const type = usedTypes[qs.length % usedTypes.length];
      let q = null;
      try { q = Gens[type](sNo, rangeOpts || null); } catch (e) { continue; }
      if (!q) continue;
      // تجنب تكرار نفس السؤال
      const sig = q.type + ":" + q.surah + ":" + (q.ayah || "");
      if (qs.some(x => (x.type + ":" + x.surah + ":" + (x.ayah || "")) === sig)) continue;
      q.surahName = App.Quran.surah(q.surah).name;
      qs.push(q);
    }
    return qs;
  }

  /* ================= تشغيل الاختبار داخل حاوية ================= */
  function mountQuiz(host, opts) {
    // opts: {questions, title, passRate, onFinish, contextLabel}
    let i = 0, correct = 0, wrongList = [];
    const total = opts.questions.length;

    function head() {
      return `<div class="quiz-head">
        <button class="icon-btn" data-action="quiz-exit" aria-label="خروج"><span class="ico" data-ico="x"></span></button>
        <div class="quiz-progress grow">
          <div class="quiz-qnum"><span>${opts.title || "اختبار"}</span><span>${App.arDigits(i + 1)} / ${App.arDigits(total)}</span></div>
          <div class="progress-track"><div class="progress-fill" style="width:${(i / total) * 100}%"></div></div>
        </div>
      </div>`;
    }

    function renderQ() {
      const q = opts.questions[i];
      let card = "";
      if (q.type === "wordOrder") card = renderWordOrder(q);
      else if (q.type === "orderAyahs") card = renderOrderAyahs(q);
      else card = renderChoice(q);
      host.innerHTML = head() + card;
      if (App.fillIcons) App.fillIcons(host);
      bind(q);
    }

    function renderChoice(q) {
      return `<div class="quiz-card">
        <div class="quiz-prompt">${q.prompt}</div>
        ${q.display ? `<div class="quiz-ayah">${q.display}</div>` : ""}
        <div class="quiz-options">
          ${q.options.map((o, oi) => `<button class="quiz-opt" data-oi="${oi}"><span class="qo-text">${o}</span></button>`).join("")}
        </div>
      </div>
      <p class="center tiny text-faint mt-12">السورة: ${q.surahName}</p>`;
    }

    function renderWordOrder(q) {
      return `<div class="quiz-card">
        <div class="quiz-prompt">${q.prompt}</div>
        <div class="token-answer" data-answer-zone></div>
        <div class="token-pool" data-pool>
          ${q.tokens.map((t, ti) => `<button class="token" data-ti="${ti}">${t}</button>`).join("")}
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" data-check-reset><span class="ico" data-ico="replay"></span> إعادة</button>
          <button class="btn btn-primary" data-check-btn disabled><span class="ico" data-ico="check"></span> تحقق</button>
        </div>
      </div>
      <p class="center tiny text-faint mt-12">السورة: ${q.surahName}</p>`;
    }

    function renderOrderAyahs(q) {
      return `<div class="quiz-card">
        <div class="quiz-prompt">${q.prompt}</div>
        <div data-order-list>
          ${q.items.map((it, ii) => `
          <div class="order-item" data-n="${it.n}">
            <span class="order-handle"><span class="ico" data-ico="grip"></span></span>
            <span class="order-text">${it.text}</span>
          </div>`).join("")}
        </div>
        <p class="tiny text-faint mt-8">اضغط ▲ ▼ لتحريك الآية حتى ترتبها صحيحة</p>
        <div class="modal-actions">
          <button class="btn btn-primary" data-check-btn><span class="ico" data-ico="check"></span> تحقق</button>
        </div>
      </div>`;
    }

    function afterAnswer(isCorrect, q, revealEl) {
      if (isCorrect) correct++; else wrongList.push(q);
      const opts = host.querySelectorAll(".quiz-opt");
      opts.forEach((b, oi) => {
        b.disabled = true;
        if (oi === q.answer) b.classList.add("correct");
      });
      if (!isCorrect && revealEl) revealEl.classList.add("wrong");
      setTimeout(() => {
        i++;
        if (i < total) renderQ();
        else finish();
      }, isCorrect ? 850 : 1700);
    }

    function bind(q) {
      if (q.type === "wordOrder") {
        const answerZone = host.querySelector("[data-answer-zone]");
        const pool = host.querySelector("[data-pool]");
        let picked = [];
        pool.addEventListener("click", e => {
          const t = e.target.closest(".token");
          if (!t || t.classList.contains("used")) return;
          t.classList.add("used");
          picked.push(Number(t.dataset.ti));
          const chip = document.createElement("button");
          chip.className = "token in-answer";
          chip.textContent = t.textContent;
          chip.dataset.from = t.dataset.ti;
          answerZone.appendChild(chip);
          answerZone.classList.add("ready");
          host.querySelector("[data-check-btn]").disabled = picked.length !== q.tokens.length;
        });
        answerZone.addEventListener("click", e => {
          const chip = e.target.closest(".token.in-answer");
          if (!chip) return;
          picked = picked.filter(x => x !== Number(chip.dataset.from));
          const orig = pool.querySelector(`.token[data-ti="${chip.dataset.from}"]`);
          if (orig) orig.classList.remove("used");
          chip.remove();
          if (!picked.length) answerZone.classList.remove("ready");
          host.querySelector("[data-check-btn]").disabled = picked.length !== q.tokens.length;
        });
        host.querySelector("[data-check-reset]").addEventListener("click", () => renderQ());
        host.querySelector("[data-check-btn]").addEventListener("click", () => {
          const seq = picked.map(ti => q.tokens[ti]);
          const ok = q.check(seq);
          afterAnswer(ok, q, host.querySelector("[data-check-btn]"));
        });
      } else if (q.type === "orderAyahs") {
        const list = host.querySelector("[data-order-list]");
        list.addEventListener("click", e => {
          const item = e.target.closest(".order-item");
          if (!item) return;
          const up = e.target.closest(".up-btn");
          const down = e.target.closest(".down-btn");
          if (up && item.previousElementSibling) list.insertBefore(item, item.previousElementSibling);
          else if (down && item.nextElementSibling) list.insertBefore(item.nextElementSibling, item);
        });
        // أضف أزرار التحريك
        list.querySelectorAll(".order-item").forEach(item => {
          const h = item.querySelector(".order-handle");
          h.innerHTML = `<button class="up-btn" aria-label="حرّك للأعلى">▲</button><button class="down-btn" aria-label="حرّك للأسفل">▼</button>`;
        });
        host.querySelector("[data-check-btn]").addEventListener("click", () => {
          const order = Array.from(list.querySelectorAll(".order-item")).map(x => Number(x.dataset.n));
          const ok = q.check(order);
          afterAnswer(ok, q, host.querySelector("[data-check-btn]"));
        });
      } else {
        host.querySelectorAll(".quiz-opt").forEach(b => {
          b.addEventListener("click", () => {
            const oi = Number(b.dataset.oi);
            afterAnswer(oi === q.answer, q, b);
          });
        });
      }
    }

    function finish() {
      const passRate = opts.passRate || 0.8;
      const passed = correct / total >= passRate;
      const stars = correct === total ? 3 : (correct / total >= 0.8 ? 2 : (passed ? 1 : 0));
      if (opts.onFinish) opts.onFinish({ correct, total, passed, stars, wrongList });
    }

    renderQ();
  }

  /* ================= شاشة النتيجة ================= */
  function resultView(r, opts) {
    const title = r.passed ? (r.correct === r.total ? "ممتاز! إتقان كامل" : "أحسنت! نتيجة رائعة") : "محاولة جيدة، حاول مرة أخرى";
    return `
    <div class="card result-card">
      <div class="result-emoji-ring ${r.passed ? "" : "fail"}"><span class="ico" data-ico="${r.passed ? "trophy" : "refresh"}"></span></div>
      <div class="result-title">${title}</div>
      <div class="result-sub">${App.arDigits(r.correct)} إجابة صحيحة من ${App.arDigits(r.total)}</div>
      <div class="mastery-stars">
        ${[1, 2, 3].map(i => `<span class="ico star-ico ${i <= r.stars ? "lit" : ""}" data-ico="star"></span>`).join("")}
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-action="games-retry" data-type="${opts.type}"><span class="ico" data-ico="replay"></span> مرة أخرى</button>
        <button class="btn btn-primary" data-href="#/challenges"><span class="ico" data-ico="check"></span> متابعة</button>
      </div>
    </div>`;
  }

  /* ================= تحدي الذاكرة ================= */
  function mountMemory(host, opts) {
    const s = App.Quran.surah(opts.surah);
    const range = opts.rangeOverride || (currentRange() && currentRange().surah === s.number ? currentRange() : null);
    const allAyahs = filterAyahsByRange(s, range);
    const candidates = allAyahs.filter(a => {
      const t = tokenize(a.text);
      return t.length >= 4 && t.length <= 7;
    });
    const ayah = candidates.length ? App.pick(candidates) : allAyahs[0];
    if (!ayah) {
      host.innerHTML = App.emptyHtml("لا توجد آيات كافية في النطاق لهذه اللعبة");
      return;
    }
    const words = tokenize(ayah.text).slice(0, 6);
    const pairs = App.shuffle([...words, ...words]);

    let first = null, lock = false, matched = 0, moves = 0;
    host.innerHTML = `
      <div class="quiz-head">
        <button class="icon-btn" data-action="quiz-exit"><span class="ico" data-ico="x"></span></button>
        <div class="quiz-progress grow">
          <div class="quiz-qnum"><span>تحدي الذاكرة — سورة ${s.name}</span><span data-mem-score>0 / ${App.arDigits(words.length)}</span></div>
          <div class="tiny text-soft">اقلب البطاقات وجد الكلمتين المتطابقتين</div>
        </div>
      </div>
      <div class="card">
        <div class="mem-grid" style="grid-template-columns:repeat(3,1fr)">
          ${pairs.map((w, i) => `<button class="mem-card" data-i="${i}" data-w="${w}"><span class="mem-q"><span class="ico" data-ico="sparkle"></span></span>${w}</button>`).join("")}
        </div>
      </div>`;
    if (App.fillIcons) App.fillIcons(host);

    host.querySelectorAll(".mem-card").forEach(card => {
      card.addEventListener("click", () => {
        if (lock || card.classList.contains("matched") || card === first) return;
        card.classList.add("flipped");
        if (!first) { first = card; return; }
        moves++;
        const a = first, b = card;
        if (a.dataset.w === b.dataset.w) {
          a.classList.add("matched"); b.classList.add("matched");
          matched++;
          first = null;
          host.querySelector("[data-mem-score]").textContent = `${App.arDigits(matched)} / ${App.arDigits(words.length)}`;
          App.haptic(15);
          if (matched === words.length) {
            setTimeout(() => {
              const stars = moves <= words.length + 2 ? 3 : (moves <= words.length + 5 ? 2 : 1);
              opts.onFinish({ passed: true, stars, correct: matched, total: words.length, moves });
            }, 600);
          }
        } else {
          lock = true;
          setTimeout(() => {
            a.classList.remove("flipped"); b.classList.remove("flipped");
            first = null; lock = false;
          }, 750);
        }
      });
    });
  }

  /* ================= الصفحات ================= */
  const GAMES = [
    { type: "wordOrder", title: "ترتيب الكلمات", sub: "رتّب كلمات الآية", icon: "grip", color: "qi-green" },
    { type: "missingWord", title: "الكلمة المفقودة", sub: "اختر الكلمة الناقصة", icon: "puzzle", color: "qi-turquoise" },
    { type: "completeAyah", title: "أكمل الآية", sub: "أكمل آخر الآية", icon: "pen", color: "qi-gold" },
    { type: "nextAyah", title: "ما الآية التالية؟", sub: "اختبر تسلسلك", icon: "next", color: "qi-blue" },
    { type: "orderAyahs", title: "رتب الآيات", sub: "رتّب ثلاث آيات", icon: "list", color: "qi-purple" },
    { type: "memory", title: "تحدي الذاكرة", sub: "طابق الكلمات المتشابهة", icon: "brain", color: "qi-coral" }
  ];

  function ensureData() {
    if (App.Quran.data) return Promise.resolve();
    return App.Quran.load().then(() => App.Router.render()).catch(() => {
      App.toast("تعذر تحميل بيانات القرآن", "error");
    });
  }

  const Challenges = {
    pageHub() {
      if (!App.Quran.data) { ensureData(); return { nav: "challenges", html: App.loadingHtml() }; }
      const rangeInfo = currentRange();
      return {
        nav: "challenges",
        html: `
        <header class="screen-head">
          <div class="sh-title"><h1>تحديات الإتقان</h1><p>ألعاب ممتعة تثبّت ما حفظت</p></div>
          <button class="icon-btn" data-href="#/achievements" aria-label="إنجازات"><span class="ico" data-ico="medal"></span></button>
        </header>
        ${rangeInfo ? App.Range.barHtml() : App.Range.emptyHtml()}
        ${rangeInfo ? `
        <div class="card journey-card mt-8">
          <div class="jc-head">
            <span class="jc-ico" style="background:var(--grad-gold);color:#2A1F08"><span class="ico" data-ico="trophy"></span></span>
            <span class="grow" style="text-align:right">
              <span class="jc-title">اختبار شامل</span>
              <span class="jc-sub">أسئلة من نطاقك الحالي</span>
            </span>
          </div>
          <button class="btn btn-gold btn-block mt-12" data-action="games-start" data-type="mixed">
            <span class="ico" data-ico="rocket"></span> ابدأ التحدي الشامل
          </button>
        </div>
        <div class="section-head"><h2>اختر لعبة</h2></div>
        <div class="quick-grid">
          ${GAMES.map(g => `
          <button class="quick-card" data-action="games-start" data-type="${g.type}">
            ${""}
            <span class="quick-ico ${g.color}"><span class="ico" data-ico="${g.icon}"></span></span>
            <span><span class="quick-title">${g.title}</span><br><span class="quick-sub">${g.sub}</span></span>
          </button>`).join("")}
        </div>` : ""}`,
        mount() {}
      };
    },

    pageGame(params) {
      if (!App.Quran.data) { ensureData(); return { nav: "challenges", html: App.loadingHtml() }; }
      if (!currentRange()) {
        return { nav: "challenges", html: App.Range.emptyHtml() };
      }
      return { nav: "challenges", html: `<div id="gameHost"></div>`, mount: (el) => Challenges.startGame(params.type, el.querySelector("#gameHost")) };
    },

    startGame(type, host) {
      // استخدم نطاق الحفظ الحالي كمسؤول الوحيد للاختيار
      if (!currentRange()) {
        host.innerHTML = App.Range.emptyHtml();
        return;
      }
      const range = currentRange();
      const surahIds = [range.surah];
      const rangeOpts = { from: range.from, to: range.to };
      if (type === "mixed" || !GAMES.some(g => g.type === type)) type = "mixed";
      if (type === "mixed") {
        const qs = buildQuiz(surahIds, 8, null, rangeOpts);
        this._runQuizFlow(host, qs, type, 0.75);
      } else if (type === "memory") {
        mountMemory(host, {
          surah: range.surah,
          rangeOverride: rangeOpts,
          onFinish: (r) => {
            App.Storage.bumpStat("quizCorrect", r.correct);
            App.Rewards.grant({ stars: r.stars, points: r.correct * 5, reason: "أنهيت تحدي الذاكرة!" });
            host.innerHTML = resultView({ ...r, passed: true }, { type });
            if (App.fillIcons) App.fillIcons(host);
          }
        });
      } else {
        const count = 8;
        const qs = [];
        let guard = 0;
        while (qs.length < count && guard < 60) {
          guard++;
          try {
            const q = Gens[type](range.surah, rangeOpts);
            if (qs.some(x => x.ayah === q.ayah && x.surah === q.surah && x.type === q.type)) continue;
            q.surahName = App.Quran.surah(q.surah).name;
            qs.push(q);
          } catch (e) { break; }
        }
        this._runQuizFlow(host, qs, type, 0.75);
      }
    },

    _runQuizFlow(host, questions, type, passRate) {
      if (!questions.length) {
        host.innerHTML = App.emptyHtml("لا توجد أسئلة متاحة الآن");
        return;
      }
      const gTitle = type === "mixed" ? "التحدي الشامل" : (GAMES.find(g => g.type === type) || {}).title || "اختبار";
      mountQuiz(host, {
        questions,
        title: gTitle,
        passRate,
        onFinish: (r) => {
          App.Storage.bumpStat("quizCorrect", r.correct);
          App.Storage.bumpStat("quizWrong", r.total - r.correct);
          if (r.correct === r.total && r.total >= 5) App.Storage.addBadge("perfect_quiz");
          r.wrongList.forEach(q => App.Storage.addMistake(q.surah, q.ayah));
          if (r.passed) {
            App.Rewards.grant({ stars: r.stars, points: r.correct * 10, reason: `نجحت في ${gTitle}` });
          } else {
            App.Storage.save();
            App.toast("اقتربت من النجاح! حاول مرة أخرى", "info");
          }
          host.innerHTML = resultView(r, { type });
          if (App.fillIcons) App.fillIcons(host);
        }
      });
    }
  };

  /* ---------- actions ---------- */
  App.actions["games-start"] = (el) => App.Router.go("#/challenges/" + el.dataset.type);
  App.actions["games-retry"] = (el) => {
    const host = document.getElementById("gameHost");
    if (host) App.Challenges.startGame(el.dataset.type, host);
  };
  App.actions["quiz-exit"] = () => App.Router.go("#/challenges");

  App.Challenges = Challenges;
  App.Games = { mountQuiz, mountMemory, buildQuiz, buildMasteryQuiz, Gens, pickSurahs, tokenize, resultView };
})();
