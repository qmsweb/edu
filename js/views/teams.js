/* =========================================================
   views/teams.js — واجهة إدارة الفرق
   إضافة فريق (اسم فقط)، إعادة تسمية، حذف، حفظ محلي.
   ========================================================= */

EC.teams = (function () {
  var view = null;
  var $ = EC.utils.$;
  var esc = EC.utils.esc;

  function render() {
    var teams = EC.store.listTeams();

    view.innerHTML =
      '<div class="view">' +
      '  <div class="page-head">' +
      "    <div>" +
      '      <h1 class="page-title">الفرق</h1>' +
      '      <p class="page-sub">الفرق عبارة عن أسماء فقط. يحتاج التحدي إلى فريقين على الأقل للمواجهة العشوائية.</p>' +
      "    </div>" +
      '    <span class="badge ' + (teams.length >= 2 ? "success" : "amber") + '">' +
      teams.length +
      " فريق مسجّل</span>" +
      "  </div>" +
      '  <div class="grid grid-2" style="align-items:start">' +
      '    <div class="card card-pad">' +
      '      <h3 class="section-title" style="margin-top:0">إضافة فريق جديد</h3>' +
      '      <form id="team-form" novalidate>' +
      '        <div class="field">' +
      '          <span class="label">اسم الفريق *</span>' +
      '          <input class="input" name="name" placeholder="مثال: فريق النجوم" autocomplete="off" />' +
      "        </div>" +
      '        <button class="btn primary" type="submit">إضافة الفريق</button>' +
      "      </form>" +
      (teams.length < 2
        ? '      <div class="hint mt-16">يتطلب التحدي فريقين على الأقل — أضف فريقاً آخر ليصبح الجواز جاهزاً.</div>'
        : "") +
      "    </div>" +
      '    <div class="card card-pad">' +
      '      <div class="spread" style="margin-bottom:14px">' +
      '        <h3 class="section-title" style="margin:0">قائمة الفرق</h3>' +
      '        <button class="btn ghost sm" data-action="seed-teams" type="button">فرق تجريبية</button>' +
      "      </div>" +
      renderTeamsList(teams) +
      "    </div>" +
      "  </div>" +
      "</div>";

    $("#team-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var input = event.target.name;
      var name = input.value.trim();

      if (!name) {
        EC.utils.toast("الرجاء إدخال اسم الفريق", "error");
        input.focus();
        return;
      }

      if (isDuplicate(name)) {
        EC.utils.toast("يوجد فريق بنفس الاسم", "error");
        input.focus();
        return;
      }

      EC.store.createTeam(name);
      EC.utils.toast('تمت إضافة فريق "' + name + '"', "success");
      render();
    });
  }

  function renderTeamsList(teams) {
    if (!teams.length) {
      return (
        '<div class="empty" style="padding:34px 18px">' +
        '  <div class="empty-title">لا توجد فرق بعد</div>' +
        '  <p class="empty-text">أضف أسماء الفرق المشاركة باستخدام النموذج، أو ابدأ بفرق تجريبية.</p>' +
        '  <button class="btn primary sm" data-action="seed-teams" type="button">استخدام فرق تجريبية</button>' +
        "</div>"
      );
    }

    var rows = teams
      .map(function (team) {
        return (
          '<div class="team-row">' +
          '  <span class="team-dot"></span>' +
          '  <span class="team-name">' + esc(team.name) + "</span>" +
          '  <button class="icon-btn" data-action="rename-team" data-id="' + team.id + '" data-name="' + esc(team.name) + '" title="إعادة التسمية" type="button">تعديل</button>' +
          '  <button class="icon-btn danger" data-action="delete-team" data-id="' + team.id + '" title="حذف" type="button">حذف</button>' +
          "</div>"
        );
      })
      .join("");

    return '<div class="stack">' + rows + "</div>";
  }

  function isDuplicate(name) {
    var teams = EC.store.listTeams();
    var lower = name.toLowerCase();
    return teams.some(function (team) {
      return team.name.toLowerCase() === lower;
    });
  }

  /* ---------- حوار إعادة تسمية ---------- */
  function openRenameForm(teamId, currentName) {
    EC.utils.openModal(
      '<div class="modal-card">' +
      '  <div class="modal-head">' +
      "    <h3>إعادة تسمية الفريق</h3>" +
      '    <button class="icon-btn" data-close-modal type="button">✕</button>' +
      "  </div>" +
      '  <form id="rename-form">' +
      '    <div class="modal-body">' +
      '      <div class="field" style="margin-bottom:0">' +
      '        <span class="label">اسم الفريق</span>' +
      '        <input class="input" name="name" value="' + esc(currentName) + '" />' +
      "      </div>" +
      "    </div>" +
      '    <div class="modal-foot">' +
      '      <button type="button" class="btn ghost" data-close-modal>إلغاء</button>' +
      '      <button type="submit" class="btn primary">حفظ</button>' +
      "    </div>" +
      "  </form>" +
      "</div>"
    );

    $("#rename-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var name = event.target.name.value.trim();
      if (!name) {
        EC.utils.toast("الرجاء إدخال اسم الفريق", "error");
        return;
      }
      EC.store.renameTeam(teamId, name);
      EC.utils.closeModal();
      EC.utils.toast("تم تحديث اسم الفريق", "success");
      render();
    });
  }

  /* ---------- معالِج النقرات ---------- */
  function onClick(event) {
    var btn = event.target.closest("[data-action]");
    if (!btn) return;

    var action = btn.getAttribute("data-action");

    if (action === "seed-teams") {
      EC.store.seed();
      EC.utils.toast("تمت إضافة فرق تجريبية", "success");
      render();
    } else if (action === "rename-team") {
      openRenameForm(btn.getAttribute("data-id"), btn.getAttribute("data-name"));
    } else if (action === "delete-team") {
      handleDelete(btn.getAttribute("data-id"));
    }
  }

  function handleDelete(teamId) {
    var teams = EC.store.listTeams();
    var team = null;
    for (var i = 0; i < teams.length; i++) {
      if (teams[i].id === teamId) team = teams[i];
    }
    if (!team) return;

    EC.utils
      .confirmDialog({
        title: "حذف الفريق",
        body: 'سيتم حذف الفريق "' + team.name + '" من القائمة.',
        okLabel: "حذف",
      })
      .then(function (confirmed) {
        if (!confirmed) return;
        EC.store.deleteTeam(teamId);
        EC.utils.toast("تم حذف الفريق", "success");
        render();
      });
  }

  function init() {
    view = $("#view");
    view.addEventListener("click", onClick);
  }

  return {
    init: init,
    render: render,
  };
})();
