"""Capture screenshots of the redesigned Quran app."""
import os
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8765"
OUT = "/home/z/my-project/screenshots"
os.makedirs(OUT, exist_ok=True)

# State preset
STATE = """
window.localStorage.setItem('rafiq_state_v1', JSON.stringify({
    v: 1, createdAt: Date.now(),
    profile: { name: 'بطل', avatar: 'falcon', onboarded: true },
    settings: { reciter: 'Minshawy_Murattal_128kbps', speed: 1, repeatCount: 3, quranFontSize: 'md', soundEffects: true, uiSounds: true, showTranslationless: true, autoPlay: true, theme: 'light', memorizationDirection: 'backward' },
    progress: {}, session: null, mistakeBank: [],
    rewards: { stars: 0, points: 0, badges: [], achievements: [] },
    stats: { learningSeconds: 0, dailySeconds: {}, activeDays: [], quizCorrect: 0, quizWrong: 0, recordings: 0, reviewsDone: 0, storiesRead: [], moralsDone: [] },
    dailyNotes: {}, ranges: [], lastAyah: { s: 1, a: 1 }
}));
"""

SHOTS = [
    ("quran-city-390", "#/quran", {"width": 390, "height": 844}),
    ("mushaf-fatihah-390", "#/mushaf/1", {"width": 390, "height": 844}),
    ("mushaf-baqarah-ayah5-390", "#/mushaf/2/5", {"width": 390, "height": 844}),
    ("mushaf-naba-390", "#/mushaf/78", {"width": 390, "height": 844}),
    ("mushaf-360", "#/mushaf/2/50", {"width": 360, "height": 780}),
    ("mushaf-412", "#/mushaf/36/1", {"width": 412, "height": 880}),
    ("tasmee-select-390", "#/tasmee", {"width": 390, "height": 844}),
    ("tasmee-session-390", "#/tasmee/112/1/3", {"width": 390, "height": 844}),
]

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for name, hash, vp in SHOTS:
            ctx = browser.new_context(viewport=vp)
            page = ctx.new_page()
            page.add_init_script(STATE)
            page.goto(f"{BASE}/{hash}", wait_until="networkidle")
            page.wait_for_timeout(2500)
            # If it's the index drawer test, open it
            if "index" in name:
                try:
                    page.click('[data-action="mushaf-index"]', timeout=5000)
                    page.wait_for_timeout(800)
                except Exception as e:
                    print(f"  ! click index: {e}")
            page.screenshot(path=f"{OUT}/{name}.png", full_page=False)
            print(f"✓ {name}")
            ctx.close()
        browser.close()
        print(f"\nScreenshots saved to: {OUT}")
        # Print file sizes
        for f in sorted(os.listdir(OUT)):
            sz = os.path.getsize(os.path.join(OUT, f))
            print(f"  {f} ({sz//1024} KB)")

run()
