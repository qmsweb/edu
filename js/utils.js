/* =========================================================
   utils.js — أدوات مساعدة عامة
   لا تعتمد على أي مكتبة خارجية (Vanilla JS خالص).
   ========================================================= */

window.EC = window.EC || {};

EC.utils = (function () {
  /* ---------- هوية فريدة لكل عنصر ---------- */
  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return (
      "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9)
    );
  }

  /* ---------- تحويل أي قيمة إلى نص آمن في HTML ---------- */
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ---------- خلط عناصر مصفوفة (Fisher–Yates) ---------- */
  function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  /* ---------- اختيار n عناصر عشوائية مختلفة ---------- */
  function pickRandom(array, count) {
    return shuffle(array).slice(0, count);
  }

  /* ---------- تنسيق التاريخ بالعربية ---------- */
  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (err) {
      return "";
    }
  }

  /* ---------- اختصارات الوصول للعناصر ---------- */
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  /* ---------- إشعار سريع (Toast) ---------- */
  function toast(message, type) {
    const root = $("#toast-root");
    if (!root) return;

    const item = document.createElement("div");
    item.className = "toast" + (type ? " " + type : "");
    item.textContent = message;
    root.appendChild(item);

    // إظهار تدريجي ثم إزالة
    requestAnimationFrame(function () {
      item.classList.add("show");
    });

    window.setTimeout(function () {
      item.classList.remove("show");
      window.setTimeout(function () {
        item.remove();
      }, 300);
    }, 2600);
  }

  /* ---------- حوار تأكيد منبثق (بديل محترف لـ confirm) ---------- */
  function confirmDialog(options) {
    const opts = options || {};
    const root = $("#modal-root");

    return new Promise(function (resolve) {
      const overlay = document.createElement("div");
      overlay.className = "modal";
      overlay.innerHTML =
        '<div class="modal-card" role="dialog" aria-modal="true">' +
        '  <div class="modal-head"><h3>' + esc(opts.title) + '</h3></div>' +
        '  <div class="modal-body"><p style="color:var(--text-2)">' + esc(opts.body) + '</p></div>' +
        '  <div class="modal-foot">' +
        '    <button type="button" class="btn ghost" data-confirm="false">' + esc(opts.cancelLabel || "إلغاء") + '</button>' +
        '    <button type="button" class="btn ' + (opts.danger === false ? "primary" : "danger") + '" data-confirm="true">' +
              esc(opts.okLabel || "تأكيد") + '</button>' +
        '  </div>' +
        '</div>';

      root.appendChild(overlay);

      function close(value) {
        overlay.remove();
        document.removeEventListener("keydown", onKey);
        resolve(value);
      }

      function onKey(event) {
        if (event.key === "Escape") close(false);
      }

      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) close(false);
        const btn = event.target.closest("[data-confirm]");
        if (btn) close(btn.getAttribute("data-confirm") === "true");
      });

      document.addEventListener("keydown", onKey);
      overlay.querySelector("[data-confirm='true']").focus();
    });
  }

  /* ---------- فتح/إغلاق الحوار المنبثق ---------- */
  function openModal(html) {
    $("#modal-root").innerHTML = '<div class="modal">' + html + "</div>";
    const overlay = $("#modal-root .modal");

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay || event.target.closest("[data-close-modal]")) {
        closeModal();
      }
    });

    const firstField = overlay.querySelector("input, textarea");
    if (firstField) firstField.focus();

    return overlay;
  }

  function closeModal() {
    $("#modal-root").innerHTML = "";
  }

  return {
    uid: uid,
    esc: esc,
    shuffle: shuffle,
    pickRandom: pickRandom,
    formatDate: formatDate,
    $: $,
    $$: $$,
    toast: toast,
    confirmDialog: confirmDialog,
    openModal: openModal,
    closeModal: closeModal,
  };
})();
