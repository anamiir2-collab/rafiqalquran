"""اختبار تطبيق رفيق القرآن — تشغيل متصفح وفحص الصفحات الأساسية."""
import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8765"

errors = []

def check_console_errors(page, label):
    page_errors = []
    page.on("pageerror", lambda err: page_errors.append(str(err)))
    page.on("console", lambda msg: page_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error", "warning"] else None)
    return page_errors

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 390, "height": 844})
        page = ctx.new_page()
        all_errors = []

        # تهيئة state وتخطّي onboarding
        page.add_init_script("""
            window.localStorage.setItem('rafiq_state_v1', JSON.stringify({
                v: 1, createdAt: Date.now(),
                profile: { name: 'بطل القرآن', avatar: 'falcon', onboarded: true },
                settings: { reciter: 'Minshawy_Murattal_128kbps', speed: 1, repeatCount: 3, quranFontSize: 'md', soundEffects: true, uiSounds: true, showTranslationless: true, autoPlay: true, theme: 'light', memorizationDirection: 'backward' },
                progress: {}, session: null, mistakeBank: [],
                rewards: { stars: 0, points: 0, badges: [], achievements: [] },
                stats: { learningSeconds: 0, dailySeconds: {}, activeDays: [], quizCorrect: 0, quizWrong: 0, recordings: 0, reviewsDone: 0, storiesRead: [], moralsDone: [] },
                dailyNotes: {}, ranges: [], lastAyah: { s: 112, a: 1 }
            }));
        """)

        # 1. الصفحة الرئيسية
        page_errors = check_console_errors(page, "home")
        page.goto(f"{BASE}/#/home", wait_until="networkidle")
        page.wait_for_timeout(1500)
        all_errors.extend([(e, "home") for e in page_errors])
        title = page.title()
        print(f"[home] title={title!r}")

        # 2. مدينة القرآن
        page_errors = check_console_errors(page, "quran city")
        page.goto(f"{BASE}/#/quran", wait_until="networkidle")
        page.wait_for_timeout(2500)
        # تحقق من وجود بطاقة "القرآن الكريم"
        card = page.query_selector(".quran-city-card")
        print(f"[quran] city card present: {card is not None}")
        if not card:
            all_errors.append(("no quran-city-card", "quran"))
        all_errors.extend([(e, "quran") for e in page_errors])

        # 3. افتح المصحف
        page_errors = check_console_errors(page, "mushaf")
        page.goto(f"{BASE}/#/mushaf", wait_until="networkidle")
        page.wait_for_timeout(3500)
        mushaf = page.query_selector("#mushafPage")
        ayah_text = page.query_selector(".mushaf-text")
        toolbar = page.query_selector(".mushaf-toolbar")
        print(f"[mushaf] mushaf-page present: {mushaf is not None}")
        print(f"[mushaf] mushaf-text present: {ayah_text is not None}")
        print(f"[mushaf] toolbar present: {toolbar is not None}")
        if not (mushaf and ayah_text and toolbar):
            all_errors.append(("missing mushaf components", "mushaf"))
        all_errors.extend([(e, "mushaf") for e in page_errors])

        # 4. افتح سورة محددة
        page_errors = check_console_errors(page, "mushaf al-fatiha")
        page.goto(f"{BASE}/#/mushaf/1", wait_until="networkidle")
        page.wait_for_timeout(2500)
        head = page.query_selector(".mht-name")
        print(f"[mushaf/1] head text: {head.inner_text() if head else 'MISSING'}")
        all_errors.extend([(e, "mushaf/1") for e in page_errors])

        # 5. افتح سورة البقرة (آية 5)
        page_errors = check_console_errors(page, "mushaf baqarah")
        page.goto(f"{BASE}/#/mushaf/2/5", wait_until="networkidle")
        page.wait_for_timeout(2500)
        head2 = page.query_selector(".mht-name")
        print(f"[mushaf/2/5] head text: {head2.inner_text() if head2 else 'MISSING'}")
        all_errors.extend([(e, "mushaf/2/5") for e in page_errors])

        # 6. افتح سورة الناس
        page_errors = check_console_errors(page, "mushaf nas")
        page.goto(f"{BASE}/#/mushaf/114", wait_until="networkidle")
        page.wait_for_timeout(2000)
        head3 = page.query_selector(".mht-name")
        print(f"[mushaf/114] head text: {head3.inner_text() if head3 else 'MISSING'}")
        all_errors.extend([(e, "mushaf/114") for e in page_errors])

        # 7. افتح صفحة التسميع
        page_errors = check_console_errors(page, "tasmee chooser")
        page.goto(f"{BASE}/#/tasmee", wait_until="networkidle")
        page.wait_for_timeout(2000)
        sel = page.query_selector("[data-tasmee-surah]")
        print(f"[tasmee] surah selector present: {sel is not None}")
        all_errors.extend([(e, "tasmee") for e in page_errors])

        # 8. افتح صفحة نطاق التسميع
        page_errors = check_console_errors(page, "tasmee range")
        page.goto(f"{BASE}/#/tasmee/112/1/3", wait_until="networkidle")
        page.wait_for_timeout(2000)
        ayah_box = page.query_selector("#tasmeeAyah")
        print(f"[tasmee/112/1/3] ayah box present: {ayah_box is not None}")
        all_errors.extend([(e, "tasmee/112/1/3") for e in page_errors])

        # 9. صفحة القصص (للتأكد من عدم كسر بقية الأقسام)
        page_errors = check_console_errors(page, "stories")
        page.goto(f"{BASE}/#/stories", wait_until="networkidle")
        page.wait_for_timeout(1500)
        print(f"[stories] URL OK")
        all_errors.extend([(e, "stories") for e in page_errors])

        # 10. صفحة التحديات
        page_errors = check_console_errors(page, "challenges")
        page.goto(f"{BASE}/#/challenges", wait_until="networkidle")
        page.wait_for_timeout(1500)
        print(f"[challenges] URL OK")
        all_errors.extend([(e, "challenges") for e in page_errors])

        # 11. الإعدادات
        page_errors = check_console_errors(page, "settings")
        page.goto(f"{BASE}/#/more/settings", wait_until="networkidle")
        page.wait_for_timeout(1500)
        print(f"[settings] URL OK")
        all_errors.extend([(e, "settings") for e in page_errors])

        # 12. راجع الشاشات المحورية (more, parent)
        page.goto(f"{BASE}/#/more", wait_until="networkidle")
        page.wait_for_timeout(1500)
        more_items = page.query_selector_all(".more-item")
        print(f"[more] items count: {len(more_items)}")

        # 13. اختبر فتح الفهرس
        page.goto(f"{BASE}/#/mushaf/1", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.click('[data-action="mushaf-index"]')
        page.wait_for_timeout(1500)
        drawer = page.query_selector("#mushafIndexDrawer")
        print(f"[index] drawer present: {drawer is not None}")
        surahs = page.query_selector_all(".md-surah")
        print(f"[index] surah items count: {len(surahs)}")
        if len(surahs) != 114:
            all_errors.append((f"expected 114 surahs in index, got {len(surahs)}", "index"))

        # 14. اختبر فتح البحث
        page.click('[data-action="close-mushaf-index"]') if page.query_selector('[data-action="close-mushaf-index"]') else None
        page.wait_for_timeout(500)
        page.click('[data-action="mushaf-search"]')
        page.wait_for_timeout(800)
        search_panel = page.query_selector("#mushafSearchPanel")
        print(f"[search] panel present: {search_panel is not None}")
        inp = page.query_selector("#mushafSearchInput")
        if inp:
            inp.fill("الحمد لله")
            page.wait_for_timeout(1500)
            results = page.query_selector_all(".md-result")
            print(f"[search] results for 'الحمد لله': {len(results)}")
            if len(results) == 0:
                all_errors.append(("no search results for الحمد لله", "search"))

        # 15. اختبر عدم وجود Horizontal Scroll
        page.set_viewport_size({"width": 360, "height": 780})
        page.goto(f"{BASE}/#/mushaf/2/5", wait_until="networkidle")
        page.wait_for_timeout(2000)
        scroll_w = page.evaluate("document.documentElement.scrollWidth")
        client_w = page.evaluate("document.documentElement.clientWidth")
        print(f"[360px] scroll={scroll_w} client={client_w}")
        if scroll_w > client_w + 5:
            all_errors.append((f"horizontal scroll detected: {scroll_w} > {client_w}", "viewport-360"))

        browser.close()

        print("\n=== Console errors during tests ===")
        for e, ctx in all_errors:
            print(f"  - [{ctx}] {e}")
        if not all_errors:
            print("✓ No errors detected")
        else:
            print(f"\n✗ {len(all_errors)} issue(s) found")
            sys.exit(1)

run()
