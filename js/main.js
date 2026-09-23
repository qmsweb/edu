/* =========================================================
   main.js — المشغّل الرئيسي
   مسؤول عن التنقل بين الواجهات الثلاث وتحديث القائمة العلوية.
   ========================================================= */

EC.app = (function () {
  var views = {
    banks: EC.banks,
    teams: EC.teams,
    challenge: EC.challenge,
  };

  var current = "banks";
  var navButtons = [];
  var initialized = false;

  function setActiveNav(name) {
    navButtons.forEach(function (button) {
      var isActive = button.getAttribute("data-nav") === name;
      if (isActive) button.classList.add("is-active");
      else button.classList.remove("is-active");
    });
  }

  // الانتقال إلى واجهة معينة
  function go(name) {
    if (!views[name]) return;
    current = name;
    setActiveNav(name);
    views[name].render();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function init() {
    // نتجاهل أي استدعاء متكرر (مثلاً عند إطلاق DOMContentLoaded مرتين)
    if (initialized) return;
    initialized = true;

    // ربط أزرار التنقل
    navButtons = EC.utils.$$("[data-nav]");
    navButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        go(button.getAttribute("data-nav"));
      });
    });

    // تهيئة كل واجهة (تسجيل مستمعي الأحداث مرة واحدة)
    Object.keys(views).forEach(function (name) {
      views[name].init();
    });

    // الواجهة الافتراضية عند الفتح
    go("banks");
  }

  return {
    go: go,
    init: init,
  };
})();

// نبدأ التطبيق بعد تحميل عناصر الصفحة
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", EC.app.init);
} else {
  EC.app.init();
}
