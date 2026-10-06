# Worklog: تطوير مدينة القرآن في تطبيق رفيق القرآن للأطفال

---
Task ID: 1
Agent: Super Z (main)
Task: تطوير قسم "مدينة القرآن" في تطبيق رفيق القرآن للأطفال ليصبح قارئ مصحف متكامل (114 سورة + فهرس + بحث + استماع + تسميع)

Work Log:
- استنسخت المستودع anamiir2-collab/rafiqalquran من GitHub
- افحصت بنية المشروع الحالي:
  * index.html (PWA مع 5 أقسام رئيسية)
  * 17 ملف JavaScript (quran.js, tasmee.js, audio.js, app.js, navigation.js, range.js, storage.js, memorization.js, challenges.js, revision.js, rewards.js, stories.js, morals.js, parent.js, education.js, pwa.js, range.js)
  * 5 ملفات CSS (style.css, child.css, parent.css, fonts.css, responsive.css)
  * بيانات القصص والعبادات والأخلاق والتحديات
  * ملف data/quran.json كان مختصر (79 سورة فقط)
  * Service Worker مع cache-first strategy
- حملت بيانات القرآن الكريم الكاملة من cdn.jsdelivr.net/npm/quran-json@3.1.2 (114 سورة، 6236 آية، نص عثماني)
- كتبت سكريبت بناء `scripts/build_quran_data.js` يحوّل المصدر الخام إلى صيغة موحّدة محفوظة محليًا:
  * معالجة البسملة الصحيحة (لا بسملة في الفاتحة كرأس مستقل ولا في التوبة)
  * التحقق من سلامة 114 سورة و6236 آية
  * حجم الملف النهائي 1.5 ميجابايت قابل للتخزين Offline
- أعيد كتابة `js/quran.js` بالكامل:
  * حافظت على كل الـ APIs الأخرى التي تستخدمها باقي الملفات (load, surah, all, bismillah, ayahsForDisplay, suggestNext, progressOf)
  * أزلت `pageQuran`, `pageSurah`, `pageMode` القديمة
  * أضفت `pageQuranCity` — مدخل واحد فقط: "القرآن الكريم"
  * أضفت `pageMushaf` — قارئ المصحف الموحّد
  * أضفت وظيفة `normalizeArabic` للتطبيع (إزالة التشكيل + توحيد الهمزات + الألف المقصورة + التاء المربوطة)
  * أضفت وظيفة `search` للبحث في آيات القرآن (60 نتيجة كحد أقصى)
  * أضفت `_openIndex` (Drawer للفهرس) و `_openSearch` (Drawer للبحث)
  * أضفت `_renderSearchResults` مع إبراز الكلمات المطابقة `<mark>`
  * أضفت `_highlightMatch` لإبراز الكلمات المطابقة في النتائج
  * أضفت جميع الأفعال: mushaf-index, mushaf-search, mushaf-play, mushaf-prev-ayah, mushaf-next-ayah, mushaf-tasmee, mushaf-index-pick, mushaf-search-result, mushaf-search-run
- أعيد كتابة `js/tasmee.js` بالكامل:
  * حافظت على الـ APIs (normalize, tokens, wordMatch, speechCtor)
  * أعيد هيكلة `choose()` ليصبح نطاق (سورة + من آية + إلى آية) بدلاً من سورة + آية واحدة
  * أعيد هيكلة `page()` لعرض كل آيات النطاق في نفس شكل المصحف (mushaf-page)
  * أضفت `_loadCurrentAyah` للتنقل داخل النطاق
  * أضفت `_advanceAyah` للانتقال للآية التالية تلقائيًا
  * أضفت رسائل تشجيعية لطيفة: "ممتاز يا بطل", "أحسنت، أكمل", "بارك الله فيك", "اقتربت جدًا", "حاول مرة أخرى"
  * أضفت `showEncourage` لعرض الرسائل اللطيفة
  * أعدت تصميم `finishSuccess` لعرض نتيجة جميلة:
    - نسبة الإتقان في دائرة (ring)
    - عدد الآيات
    - عدد الكلمات المتطابقة
    - عدد المحاولات
    - رسائل تشجيعية حسب نسبة الإتقان
- حدّثت `js/app.js`:
  * أضفت أيقونات SVG جديدة: search, bookmarkCheck, index, micOff
  * أضفت المسارات الجديدة:
    - #/mushaf, #/mushaf/:surah, #/mushaf/:surah/:ayah (قارئ المصحف)
    - #/tasmee/:surah/:from/:to (نطاق التسميع)
  * حافظت على المسارات القديمة كـ redirects للتوافق (#/surah/:id → #/mushaf/:id, #/recite/:id → #/mushaf/:id, #/tasmee/:id → #/tasmee/:id/1/1)
- أضفت ~590 سطر CSS جديد في `css/style.css`:
  * `.quran-city-card` — بطاقة "القرآن الكريم" بتصميم احترافي (خلفية متدرجة، نقوش زخرفية، رمز ۞، CTA)
  * `.mushaf-head` — رأس لاصق (sticky) بـ 3 أعمدة (فهرس + اسم السورة + بحث)
  * `.mushaf-resume-hint` — تلميح استئناف القراءة
  * `.mushaf-page-reader` — مسافات أكبر للقراءة
  * `.mushaf-toolbar` — شريط أدوات عائم (سابق + تشغيل + تسميع + تالي)
  * `.ayah-segment.playing` + `.ayah-marker.playing` — وميض للآية المُشغّلة
  * `.mushaf-drawer-backdrop` + `.mushaf-drawer` — Bottom Sheet للفهرس والبحث
  * `.md-surah` — صف السورة في الفهرس (رقم + اسم + نوع + عدد آيات)
  * `.md-result` — نتيجة بحث (سورة + آية + نص مع إبراز)
  * `.mr-mark` — إبراز الكلمات المطابقة
  * `.tasmee-result` — نتيجة التسميع اللطيفة (ring + 3 stats + رسالة)
  * الوضع الليلي المحسّن لمصحف (#1A2230 خلفية مريحة، #ECECEC نص واضح)
  * Responsive: 390px / 360px / 412px
- حدّثت `service-worker.js`:
  * رفعت VERSION من v1.5.0 إلى v2.0.0
  * أضفت `data/quran-raw.json` لقائمة CORE_ASSETS
  * ضبطت الملفات لـ cache-first strategy
- حدّثت `js/audio.js`:
  * شريط التحكم الصوتي يبدأ مخفيًا
  * يظهر تلقائيًا عند بدء التشغيل
  * وضعته فوق شريط أدوات المصحف لتجنب التداخل
- أنشأت `scripts/test_app.py` لاختبار Playwright:
  * 15 صفحة مختلفة
  * فحص Console errors
  * فحص Horizontal Scroll على 360px
  * اختبر الفهرس (114 سورة)
  * اختبر البحث ("الحمد لله" — 24 نتيجة)
  * اختبر المسارات القديمة (توافق)
  * اختبر حفظ آخر موضع
- أنشأت `scripts/screenshots.py` لالتقاط لقطات شاشة (8 صفحات × أحجام مختلفة)
- اختبرت على أحجام: 360px, 375px, 390px, 412px
  * ✓ لا يوجد Horizontal Scroll على أي حجم
  * ✓ لا توجد أخطاء JavaScript في Console
- اختبرت السور الحرجة:
  * ✓ الفاتحة (1): البسملة هي الآية الأولى، لا تظهر كرأس مستقل
  * ✓ البقرة (2): البسملة تظهر كرأس، الآية الأولى "الم" بدون بسملة مدمجة
  * ✓ التوبة (9): لا بسملة إطلاقًا (السورة الوحيدة بدون بسملة)
  * ✓ الإخلاص (112): 4 آيات صحيحة
  * ✓ الناس (114): 6 آيات صحيحة
- اختبرت التطبيع العربي:
  * ✓ البحث عن "الحمد" (بدون تشكيل) يطابق 28 نتيجة
  * ✓ البحث عن "انا" (بدون همزة) يطابق 60 نتيجة (تطبيع الهمزات إ أ آ)
  * ✓ البحث عن "الرحمن الرحيم" يطابق 6 نتائج

Stage Summary:
- ✓ حذف تبويب "السور" و "الاستماع" من مدينة القرآن
- ✓ استبدالهما ببطاقة واحدة "القرآن الكريم"
- ✓ قارئ المصحف الموحّد بتصميم احترافي يعرض 114 سورة
- ✓ النص القرآني بالرسم العثماني + خط Amiri Quran + علامات الآيات + أرقامها بالعربية
- ✓ البسملة الصحيحة (لا تظهر في الفاتحة والتوبة كرأس، تظهر في 112 سورة أخرى)
- ✓ زر فهرس القرآن يفتح Drawer مع 114 سورة (رقم + اسم + نوع + عدد آيات)
- ✓ البحث في القرآن مع تطبيع عربي كامل (إزالة التشكيل + توحيد الهمزات + الألف المقصورة + التاء المربوطة)
- ✓ الانتقال للآية عند الضغط على نتيجة البحث + إبراز الكلمات المطابقة
- ✓ متابعة القراءة (localStorage) — يحفظ آخر سورة وآية، يعرضها على بطاقة "القرآن الكريم"
- ✓ الاستماع داخل القارئ بالمنشاوي افتراضيًا + تمييز الآية المُشغّلة + Auto Scroll
- ✓ التسميع داخل نفس شكل المصحف مع اختيار السورة ومن آية إلى آية
- ✓ مقارنة كلمة بكلمة + رسائل تشجيعية لطيفة (لا توجد كلمات سلبية)
- ✓ نتيجة التسميع بنسبة الإتقان في دائرة + عدد الآيات + عدد الكلمات المتطابقة + رسالة تشجيعية
- ✓ الوضع الليلي المحسّن (#1A2230 خلفية بدل #000000، #ECECEC نص واضح)
- ✓ أيقونات SVG احترافية (search, list, mic, play, prev, next, replay, stop, x)
- ✓ PWA ما زال يعمل + Service Worker محدّث (v2.0.0)
- ✓ لا يوجد Horizontal Scroll على 360px / 375px / 390px / 412px
- ✓ لا توجد أخطاء JavaScript في Console
- ✓ بقية الأقسام لم تتأثر (القصص، التحديات، الإعدادات، المراجعة، حديقة الأخلاق، الإنجازات، أكثر)
- ✓ المسارات القديمة تعمل كـ redirects (#/surah/:id → #/mushaf/:id, #/recite/:id → #/mushaf/:id)
- مصدر بيانات القرآن: quran-json@3.1.2 (quran.com) — نص عثماني موثوق، ليس AI-generated
- الخط: Amiri Quran (woff2 موفّر في المشروع منذ الإصدار 1.0.0)
- طريقة تشغيل الصوت: everyayah.com (MP3 لكل آية على حدة، بدون API key)، cache في Service Worker
- طريقة عمل البحث: تطبيع النص ثم البحث في كل الآيات، إبراز الكلمات في النتائج بـ <mark>
- طريقة عمل التسميع: Web Speech API (SpeechRecognition) — `lang=ar-SA`, `continuous=true`, `interimResults=true`، مقارنة بـ normalize + wordMatch
- Offline: نعم — يعمل بعد تحميل البيانات الـ 1.5 ميجابايت وكل الخطوط والـ CSS/JS
- قيود Speech Recognition:
  * مدعوم فقط في Chromium-based browsers (Chrome, Edge, Opera)
  * غير مدعوم في Firefox/Safari iOS
  * يحتاج إذن الميكروفون صراحةً من المستخدم
  * الجلسة تنتهي تلقائيًا كل ~60 ثانية في بعض المتصفحات (نعيد تشغيلها تلقائيًا)
  * الدقة متغيرة حسب جودة الميكروفون والبيئة الصوتية
  * لا يوجد تشفيل عربي كامل (مثلاً، قد يخلط بين هـ/ة، أ/إ/آ)
  * لا يدعم TypeScript SDK رسميًا (TypeScript declarations غير رسمية)

Files modified:
1. /home/z/my-project/rafiqalquran/js/quran.js — أعيد كتابة كاملة
2. /home/z/my-project/rafiqalquran/js/tasmee.js — أعيد كتابة كاملة
3. /home/z/my-project/rafiqalquran/js/app.js — تحديث الأيقونات والمسارات
4. /home/z/my-project/rafiqalquran/js/audio.js — تحديث سلوك شريط التحكم الصوتي
5. /home/z/my-project/rafiqalquran/css/style.css — أضفت ~590 سطر CSS جديد
6. /home/z/my-project/rafiqalquran/service-worker.js — تحديث الإصدار وقائمة CORE_ASSETS

Files created:
1. /home/z/my-project/rafiqalquran/data/quran.json — 114 سورة، 6236 آية (1.5 MB)
2. /home/z/my-project/rafiqalquran/data/quran-raw.json — المصدر الخام
3. /home/z/my-project/scripts/build_quran_data.js — سكريبت بناء البيانات
4. /home/z/my-project/scripts/test_app.py — اختبارات Playwright
5. /home/z/my-project/scripts/screenshots.py — لقطات شاشة
