/* ============================================================
   رفيق القرآن للأطفال — pwa.js
   Service Worker registration + زر التثبيت + وضع Offline
   ============================================================ */
window.App = window.App || {};
App.actions = App.actions || {};

(function () {
  "use strict";

  const PWA = {
    deferredPrompt: null,

    init() {
      // Service Worker
      if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
        window.addEventListener("load", () => {
          navigator.serviceWorker.register("./service-worker.js", { scope: "./" })
            .then(reg => {
              // فحص التحديثات دوريًا
              setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
            })
            .catch(err => console.warn("SW registration failed", err));
        });
      }

      // Install prompt
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.showInstallButtons(true);
      });
      window.addEventListener("appinstalled", () => {
        this.deferredPrompt = null;
        this.showInstallButtons(false);
        App.toast("تم تثبيت التطبيق بنجاح! بارك الله فيك", "success");
      });

      // Offline banner
      const banner = document.getElementById("offlineBanner");
      const update = () => banner.classList.toggle("hidden", navigator.onLine);
      window.addEventListener("online", () => { update(); App.toast("عاد الاتصال بالإنترنت", "success"); });
      window.addEventListener("offline", () => { update(); });
      update();
    },

    showInstallButtons(show) {
      document.querySelectorAll("[data-install-btn]").forEach(b => {
        b.classList.toggle("hidden", !show);
      });
    },

    async promptInstall() {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        if (outcome === "accepted") {
          this.deferredPrompt = null;
          this.showInstallButtons(false);
        }
        return;
      }
      // iOS / غير المدعوم
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      App.modal({
        title: "تثبيت التطبيق",
        body: isIOS ? `
          <p class="small" style="line-height:2">
          لتثبيت «رفيق القرآن» على الآيفون:
          <br>١. اضغط زر <b>المشاركة</b> <span style="border:1px solid #ccc;border-radius:6px;padding:1px 7px">↑</span> في أسفل متصفح Safari
          <br>٢. اختر <b>«إضافة إلى الشاشة الرئيسية»</b>
          <br>٣. اضغط <b>إضافة</b> — وسيظهر التطبيق كأيقونة على جهازك
          </p>` : `
          <p class="small" style="line-height:2">
          يمكنك تثبيت التطبيق من قائمة المتصفح:
          <br>• على كروم أندرويد: القائمة ⋮ ثم <b>«إضافة إلى الشاشة الرئيسية»</b> أو <b>«تثبيت التطبيق»</b>
          <br>• على الكمبيوتر: أيقونة التثبيت في شريط العنوان
          <br><br>بعد التثبيت سيعمل التطبيق بدون شريط المتصفح وحتى بدون إنترنت.
          </p>`,
        actions: [{ label: "فهمت", action: "close-modal", primary: true }]
      });
    }
  };

  App.actions["app-install"] = () => PWA.promptInstall();
  App.PWA = PWA;
})();
