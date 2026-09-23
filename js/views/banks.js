/* =========================================================
   views/banks.js — واجهة بنك الأسئلة
   إنشاء البنوك، فتح بنك لإدارة أسئلته، إضافة وحذف الأسئلة.
   ========================================================= */

EC.banks = (function () {
  var view = null; // عنصر #view
  var openBankId = null; // البنك المفتوح حالياً (أو null لقائمة البنوك)

  /* ---------- اختصارات ---------- */
  var $ = EC.utils.$;
  var esc = EC.utils.esc;

  /* ================= القائمة الرئيسية للبنوك ================= */

  function renderList() {
    var banks = EC.store.listBanks();

    view.innerHTML =
      '<div class="view">' +
      '  <div class="page-head">' +
      '    <div>' +
      '      <h1 class="page-title">بنك الأسئلة</h1>' +
      '      <p class="page-sub">أنشئ بنوك الأسئلة حسب المادة أو المستوى، ثم أضف إليها الأسئلة والخيارات.</p>' +
      '    </div>' +
      '    <button class="btn primary" data-action="new-bank" type="button">+ بنك جديد</button>' +
      '  </div>' +
      renderBanksGrid(banks) +
      "</div>";
  }

  function renderBanksGrid(banks) {
    if (!banks.length) {
      return (
        '<div class="empty">' +
        '  <div class="empty-title">لا توجد بنوك أسئلة بعد</div>' +
        '  <p class="empty-text">ابدأ بإنشاء بنك أسئلة جديد، مثلاً "أسئلة الرياضيات للصف الخامس".</p>' +
        '  <button class="btn primary" data-action="new-bank" type="button">إنشاء البنك الأول</button>' +
        "</div>"
      );
    }

    var cards = banks
      .map(function (bank) {
        var count = (bank.questions || []).length;
        return (
          '<div class="card bank-card">' +
          '  <div class="bank-card-top">' +
          '    <div>' +
          '      <div class="bank-name">' + esc(bank.title) + "</div>" +
          '      <div class="bank-sub">' + esc(bank.subject || "بدون مادة") + "</div>" +
          "    </div>" +
          '    <span class="badge ' + (count ? "primary" : "") + '">' + count + " سؤال</span>" +
          "  </div>" +
          '  <div class="bank-meta">' +
          "    <span class=\"badge\">" + esc(EC.utils.formatDate(bank.updatedAt)) + "</span>" +
          "  </div>" +
          '  <div class="bank-actions">' +
          '    <button class="btn primary sm" data-action="open-bank" data-id="' + bank.id + '" type="button">فتح وإدارة الأسئلة</button>' +
          '    <button class="btn ghost sm" data-action="delete-bank" data-id="' + bank.id + '" type="button">حذف البنك</button>' +
          "  </div>" +
          "</div>"
        );
      })
      .join("");

    return '<div class="grid grid-3">' + cards + "</div>";
  }

  /* ================= تفاصيل البنك (الأسئلة) ================= */

  function renderDetail() {
    var bank = EC.store.getBank(openBankId);
    if (!bank) {
      openBankId = null;
      renderList();
      return;
    }

    var questions = bank.questions || [];

    view.innerHTML =
      '<div class="view">' +
      '  <div class="crumb">' +
      '    <button data-action="back-banks" type="button">→ بنوك الأسئلة</button>' +
      "    <span>/</span>" +
      "    <strong>" + esc(bank.title) + "</strong>" +
      "  </div>" +
      '  <div class="page-head">' +
      "    <div>" +
      '      <h1 class="page-title">' + esc(bank.title) + "</h1>" +
      '      <p class="page-sub">' + esc(bank.subject || "بدون مادة") + " · " + questions.length + " سؤال</p>" +
      "    </div>" +
      '    <button class="btn primary" data-action="new-question" type="button">+ إضافة سؤال</button>' +
      "  </div>" +
      renderQuestionsList(questions) +
      "</div>";
  }

  function renderQuestionsList(questions) {
    if (!questions.length) {
      return (
        '<div class="empty">' +
        '  <div class="empty-title">لا توجد أسئلة في هذا البنك</div>' +
        '  <p class="empty-text">أضف سؤالاً مع عدة خيارات وحدّد الإجابة الصحيحة لكي يصبح البنك جاهزاً للتحدي.</p>' +
        '  <button class="btn primary" data-action="new-question" type="button">إضافة السؤال الأول</button>' +
        "</div>"
      );
    }

    var items = questions
      .map(function (q, index) {
        var options = (q.options || [])
          .map(function (opt, i) {
            var cls = i === q.correctIndex ? "is-correct" : "";
            return '<li class="' + cls + '">' + esc(opt) + "</li>";
          })
          .join("");

        return (
          '<div class="question-item">' +
          '  <div class="question-item-head">' +
          '    <span class="q-index">' + (index + 1) + "</span>" +
          '    <p class="q-text">' + esc(q.text) + "</p>" +
          '    <button class="icon-btn danger" data-action="delete-question" data-id="' + q.id + '" title="حذف السؤال" type="button">حذف</button>' +
          "  </div>" +
          '  <ul class="q-options">' + options + "</ul>" +
          "</div>"
        );
      })
      .join("");

    return '<div class="mt-16">' + items + "</div>";
  }

  /* ================= الحوارات المنبثقة ================= */

  /* ---------- حوار إنشاء بنك ---------- */
  function openBankForm() {
    EC.utils.openModal(
      '<div class="modal-card">' +
      '  <div class="modal-head">' +
      "    <h3>بنك أسئلة جديد</h3>" +
      '    <button class="icon-btn" data-close-modal type="button">✕</button>' +
      "  </div>" +
      '  <form id="bank-form" novalidate>' +
      '    <div class="modal-body">' +
      '      <div class="field">' +
      '        <span class="label">اسم البنك *</span>' +
      '        <input class="input" name="title" placeholder="مثال: أسئلة الرياضيات للصف الخامس" required />' +
      "      </div>" +
      '      <div class="field" style="margin-bottom:0">' +
      '        <span class="label">المادة (اختياري)</span>' +
      '        <input class="input" name="subject" placeholder="مثال: رياضيات" />' +
      "      </div>" +
      "    </div>" +
      '    <div class="modal-foot">' +
      '      <button type="button" class="btn ghost" data-close-modal>إلغاء</button>' +
      '      <button type="submit" class="btn primary">إنشاء البنك</button>' +
      "    </div>" +
      "  </form>" +
      "</div>"
    );

    $("#bank-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var title = event.target.title.value.trim();
      var subject = event.target.subject.value.trim();

      if (!title) {
        EC.utils.toast("الرجاء إدخال اسم للبنك", "error");
        return;
      }

      EC.store.createBank({ title: title, subject: subject });
      EC.utils.closeModal();
      EC.utils.toast("تم إنشاء البنك بنجاح", "success");
      refresh();
    });
  }

  /* ---------- حوار إضافة سؤال ---------- */
  function openQuestionForm() {
    var count = EC.store.OPTION_COUNT;

    var optionFields = "";
    var optionLabels = ["الأول", "الثاني", "الثالث", "الرابع"];
    for (var i = 0; i < count; i++) {
      optionFields +=
        '<div class="field">' +
        '  <span class="label">الاختيار ' + optionLabels[i] + " *</span>" +
        '  <input class="input" name="opt' + i + '" placeholder="نص الاختيار ' + (i + 1) + '" required />' +
        "</div>";
    }

    var radios = "";
    for (var j = 0; j < count; j++) {
      radios +=
        '<label class="radio-pill">' +
        '  <input type="radio" name="correct" value="' + j + '"' + (j === 0 ? " checked" : "") + " />" +
        "  <span>" + optionLabels[j] + "</span>" +
        "</label>";
    }

    EC.utils.openModal(
      '<div class="modal-card">' +
      '  <div class="modal-head">' +
      "    <h3>إضافة سؤال جديد</h3>" +
      '    <button class="icon-btn" data-close-modal type="button">✕</button>' +
      "  </div>" +
      '  <form id="question-form" novalidate>' +
      '    <div class="modal-body">' +
      '      <div class="field">' +
      '        <span class="label">نص السؤال *</span>' +
      '        <textarea class="textarea" name="text" placeholder="اكتب نص السؤال هنا..." required></textarea>' +
      "      </div>" +
      '      <div class="options-editor">' + optionFields + "</div>" +
      '      <div class="field mt-16">' +
      '        <span class="label">الإجابة الصحيحة *</span>' +
      '        <div class="radio-row">' + radios + "</div>" +
      "      </div>" +
      "    </div>" +
      '    <div class="modal-foot">' +
      '      <button type="button" class="btn ghost" data-close-modal>إلغاء</button>' +
      '      <button type="submit" class="btn primary">حفظ السؤال</button>' +
      "    </div>" +
      "  </form>" +
      "</div>"
    );

    $("#question-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var form = event.target;

      var text = form.text.value.trim();
      if (!text) {
        EC.utils.toast("الرجاء كتابة نص السؤال", "error");
        return;
      }

      var options = [];
      var valid = true;
      for (var i = 0; i < count; i++) {
        var value = form["opt" + i].value.trim();
        if (!value) {
          valid = false;
          break;
        }
        options.push(value);
      }

      if (!valid) {
        EC.utils.toast("الرجاء تعبئة جميع الخيارات الأربعة", "error");
        return;
      }

      var correctIndex = parseInt(form.querySelector('input[name="correct"]:checked').value, 10);

      EC.store.addQuestion(openBankId, {
        text: text,
        options: options,
        correctIndex: correctIndex,
      });

      EC.utils.closeModal();
      EC.utils.toast("تمت إضافة السؤال", "success");
      refresh();
    });
  }

  /* ================= المعالِجات ================= */

  function onClick(event) {
    var btn = event.target.closest("[data-action]");
    if (!btn) return;

    var action = btn.getAttribute("data-action");

    if (action === "new-bank") {
      openBankForm();
    } else if (action === "open-bank") {
      openBankId = btn.getAttribute("data-id");
      renderDetail();
    } else if (action === "back-banks") {
      openBankId = null;
      renderList();
    } else if (action === "delete-bank") {
      handleDeleteBank(btn.getAttribute("data-id"));
    } else if (action === "new-question") {
      openQuestionForm();
    } else if (action === "delete-question") {
      handleDeleteQuestion(btn.getAttribute("data-id"));
    }
  }

  function handleDeleteBank(bankId) {
    var bank = EC.store.getBank(bankId);
    if (!bank) return;

    EC.utils
      .confirmDialog({
        title: "حذف البنك",
        body:
          'سيتم حذف البنك "' +
          bank.title +
          '" وجميع أسئلته (' +
          (bank.questions || []).length +
          " سؤال). لا يمكن التراجع عن هذا الإجراء.",
        okLabel: "حذف",
      })
      .then(function (confirmed) {
        if (!confirmed) return;
        EC.store.deleteBank(bankId);
        if (openBankId === bankId) openBankId = null;
        EC.utils.toast("تم حذف البنك", "success");
        refresh();
      });
  }

  function handleDeleteQuestion(questionId) {
    EC.utils
      .confirmDialog({
        title: "حذف السؤال",
        body: "سيتم حذف هذا السؤال من البنك نهائياً.",
        okLabel: "حذف",
      })
      .then(function (confirmed) {
        if (!confirmed) return;
        EC.store.deleteQuestion(openBankId, questionId);
        EC.utils.toast("تم حذف السؤال", "success");
        refresh();
      });
  }

  /* ================= الواجهة العامة ================= */

  // تُستدعى من المشغّل الرئيسي مرة واحدة
  function init() {
    view = $("#view");
    view.addEventListener("click", onClick);
  }

  // إعادة رسم الواجهة (تُستدعى عند فتح تبويب البنوك)
  function render() {
    if (openBankId) renderDetail();
    else renderList();
  }

  // تحديث بعد أي تعديل مع الإبقاء على السياق
  function refresh() {
    render();
  }

  return {
    init: init,
    render: render,
  };
})();
