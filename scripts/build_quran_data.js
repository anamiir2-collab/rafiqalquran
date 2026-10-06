/* ============================================================
   build_quran_data.js — يبني data/quran.json (114 سورة) من quran-raw.json
   المصدر: quran-json@3.1.2 (quran.com / spimq uthmani text)
   ينتج صيغة موحّدة قابلة للاستخدام المباشر في quran.js بدون تطبيع عند وقت التشغيل.
   ============================================================ */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "rafiqalquran", "data", "quran-raw.json");
const DST = path.join(__dirname, "..", "rafiqalquran", "data", "quran.json");

const raw = JSON.parse(fs.readFileSync(SRC, "utf8"));

const BISMILLAH_FULL = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
// استخدم نص البسملة كما هو في الآية الأولى من الفاتحة (مصدر موثوق)
const BISMILLAH_VERSE = raw[0].verses[0].text.trim();

// أرقام السور التي لا تبدأ بـ"بسم الله الرحمن الرحيم" كرأس سورة:
//  - 1 (الفاتحة): البسملة هي الآية الأولى، لذا لا تظهر كرأس مستقل
//  - 9 (التوبة): لا بسملة فيها أصلاً
const NO_HEADER_BISMILLAH = new Set([1, 9]);

// دالة لتحديد ما إذا كان نص الآية يبدأ بالبسملة
function normalizeForBismillahCompare(s) {
  return String(s || "")
    .normalize("NFKC")
    .replace(/[\u064B-\u0652\u0670\u0640\u06D6-\u06ED\u0653-\u065F]/g, "") // إزالة التشكيل
    .replace(/\s+/g, "")
    .trim();
}

const bismNorm = normalizeForBismillahCompare(BISMILLAH_VERSE);

function stripLeadingBismillah(text) {
  const t = String(text);
  const tNorm = normalizeForBismillahCompare(t);
  if (!tNorm.startsWith(bismNorm)) return t;
  // ابحث عن أول حرف بعد البسملة في النص الأصلي
  let i = 0, matched = 0;
  while (i < t.length && matched < bismNorm.length) {
    const ch = t[i];
    if (/[\u064B-\u0652\u0670\u0640\u06D6-\u06ED\u0653-\u065F]/.test(ch) || /\s/.test(ch)) {
      i++;
      continue;
    }
    if (normalizeForBismillahCompare(ch) !== bismNorm[matched]) return t;
    i++;
    matched++;
  }
  if (matched === bismNorm.length) {
    // تخطّي المسافات بعد البسملة
    while (i < t.length && /\s/.test(t[i])) i++;
    return t.slice(i);
  }
  return t;
}

const surahs = raw.map((s) => {
  const number = Number(s.id);
  const verses = Array.isArray(s.verses) ? s.verses : [];
  const hasHeaderBismillah = !NO_HEADER_BISMILLAH.has(number);
  const ayahs = verses.map((v, idx) => {
    const num = Number(v.id || (idx + 1));
    let text = String(v.text || "");
    // لو السورة لها بسملة كرأس (وليست الفاتحة ولا التوبة)، انزع البسملة من بداية الآية الأولى
    if (num === 1 && hasHeaderBismillah) {
      text = stripLeadingBismillah(text);
    }
    return { number: num, text };
  });
  return {
    number,
    name: String(s.name || ""),
    englishName: String(s.transliteration || ""),
    revelationType: String(s.type || "").toLowerCase().includes("mad") ? "مدنية" : "مكية",
    ayahsCount: Number(s.total_verses || ayahs.length),
    basmala: hasHeaderBismillah, // true = اعرض البسملة كرأس سورة (باستثناء الفاتحة والتوبة)
    ayahs
  };
}).filter(s => s.number >= 1 && s.number <= 114 && s.ayahs.length);

const data = {
  meta: {
    app: "رفيق القرآن للأطفال",
    edition: "quran-uthmani (quran-json 3.1.2)",
    source: "Quran JSON / The Noble Qur'an Encyclopedia",
    range: "القرآن الكريم كاملًا — من الفاتحة إلى الناس",
    surahsCount: surahs.length,
    ayahsCount: surahs.reduce((sum, s) => sum + s.ayahs.length, 0),
    bismillah: BISMILLAH_FULL,
    bismillahVerse: BISMILLAH_VERSE
  },
  surahs
};

fs.writeFileSync(DST, JSON.stringify(data), "utf8");

const totalAyahs = data.meta.ayahsCount;
console.log("✓ تم بناء quran.json بنجاح");
console.log("  - عدد السور:", surahs.length);
console.log("  - إجمالي الآيات:", totalAyahs);
console.log("  - حجم الملف:", Math.round(fs.statSync(DST).size / 1024) + " KB");
console.log("  - السورة الأولى:", surahs[0].name, "- آيات:", surahs[0].ayahs.length);
console.log("  - السورة الأخيرة:", surahs[surahs.length - 1].name);
console.log("  - سورة التوبة basmala:", surahs.find(s => s.number === 9).basmala);
console.log("  - الفاتحة basmala:", surahs.find(s => s.number === 1).basmala);
console.log("  - البقرة basmala:", surahs.find(s => s.number === 2).basmala);
