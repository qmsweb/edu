/* =========================================================
   views/challenge.js — واجهة التحدي
   ثلاث مراحل: الإعداد → اللعب → النتائج
   المنطق: اختيار بنك + مدة مؤقت → اختيار فريقين عشوائياً →
   عرض الأسئلة مع المؤقت، والتمرير للفريق المنافس عند الخطأ
   أو انتهاء الوقت → شاشة النتيجة النهائية.
   ========================================================= */

EC.challenge = (function () {
  var POINTS_PER_QUESTION = 10; // نقاط كل إجابة صحيحة
  var RING_CIRCUMFERENCE = 276.46; // محيط حلقة المؤقت (r = 44)
  var OPTION_KEYS = ["أ", "ب", "ج", "د"]; // أحرف الخيارات

  var view = null;
  var mode = "setup"; // setup | game | result
  var setupState = { bankId: null, duration: null };
  var game = null; // حالة اللعبة الحالية
  var timerId = null;

  var $ = EC.utils.$;
  var esc = EC.utils.esc;

  /* ================= المرحلة 1: الإعداد ================= */

  function renderSetup() {
    var banks = EC.store.listBanks();
    var teams = EC.store.listTeams();
    var settings = EC.store.getSettings();

    if (!setupState.duration) setupState.duration = settings.timerDuration;
    if (!setupState.bankId || !isPlayable(setupState.bankId)) {
      setupState.bankId = firstPlayableBankId(banks);
    }

    var canStart = teams.length >= 2 && !!setupState.bankId;

    view.innerHTML =
      '<div class="view">' +
      '  <div class="page-head">' +
      "    <div>" +
      '      <h1 class="page-title">التحدي</h1>' +
      '      <p class="page-sub">اختر بنك الأسئلة ومدة المؤقت، ثم ابدأ المواجهة بين فريقين يُختاران عشوائياً.</p>' +
      "    </div>" +
      "  </div>" +
      '  <div class="setup-grid">' +
      '    <div class="card card-pad">' +
      '      <h3 class="section-title" style="margin-top:0">1 · اختر بنك الأسئلة</h3>' +
      renderBankOptions(banks) +
      '      <h3 class="section-title">2 · مدة المؤقت لكل سؤال</h3>' +
      '      <div class="row">' +
      '        <input class="input" id="duration-input" type="number" min="5" max="180" step="5" value="' +
      setupState.duration +
      '" style="max-width:130px" />' +
      '        <span class="badge">ثانية لكل سؤال</span>' +
      "      </div>" +
      '      <div class="timer-presets">' +
      [10, 15, 20, 30, 45, 60]
        .map(function (sec) {
          var active = Number(setupState.duration) === sec ? " is-active" : "";
          return (
            '<button class="preset' + active + '" data-action="set-duration" data-seconds="' + sec + '" type="button">' +
            sec + " ث</button>"
          );
        })
        .join("") +
      "      </div>" +
      '      <button class="btn primary block mt-24" data-action="start-challenge" type="button"' +
      (canStart ? "" : " disabled") +
      ">بدء التحدي</button>" +
      (canStart
        ? ""
        : '      <div class="hint mt-16">' + blockReason(teams.length, banks) + "</div>") +
      "    </div>" +
      '    <div class="stack">' +
      '      <div class="card card-pad">' +
      '        <h3 class="section-title" style="margin-top:0">الفرق المشاركة</h3>' +
      (teams.length
        ? '        <div class="spread"><span class="badge ' + (teams.length >= 2 ? "success" : "amber") + '">' +
          teams.length +
          " فريق</span>" +
          '        <button class="btn ghost sm" data-action="goto-teams" type="button">إدارة الفرق</button></div>' +
          '        <div class="mt-16">' +
          teams
            .map(function (t) {
              return (
                '<div class="team-row" style="margin-bottom:8px"><span class="team-dot"></span><span class="team-name">' +
                esc(t.name) +
                "</span></div>"
              );
            })
            .join("") +
          "</div>"
        : '        <p style="color:var(--text-2)">لم تتم إضافة أي فريق بعد.</p>' +
          '        <button class="btn primary sm mt-16" data-action="goto-teams" type="button">إضافة فريق</button>') +
      "      </div>" +
      '      <div class="card card-pad" style="background-color:var(--surface-2)">' +
      '        <h3 class="section-title" style="margin-top:0">كيف يعمل التحدي؟</h3>' +
      '        <ul class="stack" style="gap:8px;font-size:13.5px;color:var(--text-2)">' +
      "          <li>• يُختار فريقان عشوائياً، ويبدأ أحدهما بالسؤال الأول.</li>" +
      "          <li>• الإجابة الصحيحة = 10 نقاط، وينتقل السؤال التالي للفريق الآخر.</li>" +
      "          <li>• الإجابة الخاطئة أو انتهاء الوقت = ينتقل السؤال للفريق المنافس (فرصة سرقة).</li>" +
      "          <li>• تنتهي المواجهة عند استنفاد كل أسئلة البنك.</li>" +
      "        </ul>" +
      "      </div>" +
      "    </div>" +
      "  </div>" +
      "</div>";

    // حفظ المدة عند تعديلها يدوياً
    var durationInput = $("#duration-input");
    durationInput.addEventListener("change", function () {
      var value = clampDuration(durationInput.value);
      setupState.duration = value;
      EC.store.saveSettings({ timerDuration: value });
      renderSetup();
    });
  }

  function renderBankOptions(banks) {
    var playable = banks.filter(function (b) {
      return (b.questions || []).length > 0;
    });

    if (!banks.length) {
      return (
        '<div class="empty" style="padding:28px 16px">' +
        '  <p class="empty-text" style="margin-bottom:12px">لا توجد بنوك أسئلة بعد. أنشئ بنكاً وأضف إليه أسئلة أولاً.</p>' +
        '  <button class="btn primary sm" data-action="goto-banks" type="button">إنشاء بنك أسئلة</button>' +
        "</div>"
      );
    }

    return (
      '<div class="mt-16">' +
      banks
        .map(function (bank) {
          var count = (bank.questions || []).length;
          var disabled = count === 0;
          var selected = bank.id === setupState.bankId;

          return (
            '<label class="bank-option ' +
            (selected ? "is-selected" : "") +
            (disabled ? " is-disabled" : "") +
            '">' +
            (disabled
              ? '<input type="radio" name="bank" disabled />'
              : '<input type="radio" name="bank" value="' + bank.id + '"' + (selected ? " checked" : "") + ' data-action="select-bank" />') +
            '  <span class="bank-option-main">' +
            '    <span class="bank-option-title">' + esc(bank.title) + "</span>" +
            '    <span class="bank-option-sub">' +
            (disabled
              ? "لا توجد أسئلة بعد — أضف أسئلة لتفعيل هذا البنك"
              : count + " سؤال · " + esc(bank.subject || "بدون مادة")) +
            "</span>" +
            "  </span>" +
            "</label>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function blockReason(teamCount, banks) {
    if (teamCount < 2) {
      return (
        "يحتاج التحدي إلى فريقين على الأقل. لديك حالياً " +
        teamCount +
        " فريق فقط." +
        (teamCount === 0
          ? ""
          : ' <button class="btn primary sm" data-action="goto-teams" type="button" style="margin-right:6px">إضافة فريق</button>')
      );
    }
    var playable = banks.filter(function (b) {
      return (b.questions || []).length > 0;
    });
    if (!playable.length) {
      return (
        'كل البنوك فارغة. أضف أسئلة لأحد البنوك أولاً. <button class="btn primary sm" data-action="goto-banks" type="button" style="margin-right:6px">إدارة البنوك</button>'
      );
    }
    return "";
  }

  function isPlayable(bankId) {
    var bank = EC.store.getBank(bankId);
    return !!bank && (bank.questions || []).length > 0;
  }

  function firstPlayableBankId(banks) {
    for (var i = 0; i < banks.length; i++) {
      if ((banks[i].questions || []).length > 0) return banks[i].id;
    }
    return null;
  }

  function clampDuration(value) {
    var num = parseInt(value, 10);
    if (isNaN(num)) num = 30;
    if (num < 5) num = 5;
    if (num > 180) num = 180;
    return num;
  }

  /* ================= بدء التحدي (Matchmaking) ================= */

  function startChallenge() {
    var bank = EC.store.getBank(setupState.bankId);
    var teams = EC.store.listTeams();

    if (!bank || !(bank.questions || []).length) {
      EC.utils.toast("الرجاء اختيار بنك يحتوي على أسئلة", "error");
      return;
    }
    if (teams.length < 2) {
      EC.utils.toast("يحتاج التحدي إلى فريقين على الأقل", "error");
      return;
    }

    // اختيار فريقين عشوائياً مختلفين
    var selected = EC.utils.pickRandom(teams, 2);

    game = {
      bankTitle: bank.title,
      questions: prepareQuestions(bank.questions),
      index: 0,
      teams: { a: selected[0], b: selected[1] },
      scores: { a: 0, b: 0 },
      corrects: { a: 0, b: 0 },
      holder: Math.random() < 0.5 ? "a" : "b", // من يبدأ السؤال
      attacker: null, // الفريق المهاجم بعد التمرير
      bounced: false, // هل تم تمرير السؤال للفريق المنافس
      duration: clampDuration(setupState.duration),
      timeLeft: 0,
      locked: false,
      feedback: null,
      status: null,
      log: [],
    };

    mode = "game";
    renderGame();
    startQuestion();
  }

  /* ---------- تجهيز الأسئلة: خلط ترتيبها وخلط خياراتها ---------- */
  function prepareQuestions(bankQuestions) {
    var prepared = (bankQuestions || []).map(function (q) {
      var correctValue = q.options[q.correctIndex];
      var options = EC.utils.shuffle(q.options);
      return {
        id: q.id,
        text: q.text,
        options: options,
        correctIndex: options.indexOf(correctValue),
      };
    });
    return EC.utils.shuffle(prepared);
  }

  /* ================= المرحلة 2: حلقة اللعب ================= */

  // الفريق الذي يملك الدور الآن (المهاجم إن وُجد، وإلا صاحب السؤال)
  function currentAttacker() {
    return game.attacker || game.holder;
  }

  function opponent(key) {
    return key === "a" ? "b" : "a";
  }

  function startQuestion() {
    game.timeLeft = game.duration;
    game.locked = false;
    game.feedback = null;

    if (!game.status) {
      game.status = {
        type: "info",
        text: "السؤال الأول مع فريق " + game.teams[game.holder].name,
      };
    }

    renderGame();
    startTimer();
  }

  function startTimer() {
    clearInterval(timerId);
    timerId = window.setInterval(function () {
      if (!game || game.locked) return;
      game.timeLeft -= 1;
      if (game.timeLeft <= 0) {
        game.timeLeft = 0;
        updateTimerUI();
        onTimeout();
        return;
      }
      updateTimerUI();
    }, 1000);
  }

  function updateTimerUI() {
    var textEl = $("#timer-text");
    var ringEl = $("#ring-fill");
    var wrapEl = $("#timer-wrap");
    if (!textEl || !ringEl) return;

    textEl.textContent = game.timeLeft;
    var pct = game.duration ? game.timeLeft / game.duration : 0;
    ringEl.style.strokeDashoffset = (RING_CIRCUMFERENCE * (1 - pct)).toFixed(1);

    var critical = game.timeLeft <= 5;
    ringEl.classList.toggle("is-critical", critical);
    if (wrapEl) wrapEl.classList.toggle("is-critical", critical);
  }

  /* ---------- اختيار إجابة ---------- */
  function selectAnswer(optionIndex) {
    if (!game || game.locked) return;
    game.locked = true;
    clearInterval(timerId);

    var question = game.questions[game.index];
    var attacker = currentAttacker();

    if (optionIndex === question.correctIndex) {
      // إجابة صحيحة: نقاط للفريق صاحب الدور
      game.scores[attacker] += POINTS_PER_QUESTION;
      game.corrects[attacker] += 1;
      game.feedback = { chosen: optionIndex, state: "correct" };
      game.status = {
        type: "success",
        text:
          "إجابة صحيحة! +" +
          POINTS_PER_QUESTION +
          " نقاط لفريق " +
          game.teams[attacker].name,
      };
      game.log.push({
        question: question.text,
        answer: question.options[question.correctIndex],
        winner: game.teams[attacker].name,
      });
      renderGame();
      schedule(1200, function () {
        resolveQuestion(attacker);
      });
    } else {
      game.feedback = { chosen: optionIndex, state: "wrong" };

      if (!game.bounced) {
        // أول مرة خطأ: ينتقل السؤال للفريق المنافس
        game.status = {
          type: "warn",
          text:
            "إجابة خاطئة! ينتقل السؤال إلى فريق " +
            game.teams[opponent(attacker)].name +
            " لسرقة النقاط...",
        };
        renderGame();
        schedule(1100, bounceQuestion);
      } else {
        // الفريق المنافس أخطأ أيضاً: لا أحد يفوز بالنقاط
        game.status = {
          type: "danger",
          text: "إجابة خاطئة! لا أحد تمكن من الإجابة بشكل صحيح.",
        };
        game.log.push({
          question: question.text,
          answer: question.options[question.correctIndex],
          winner: null,
        });
        renderGame();
        schedule(1200, function () {
          resolveQuestion(null);
        });
      }
    }
  }

  /* ---------- انتهاء وقت السؤال ---------- */
  function onTimeout() {
    if (!game || game.locked) return;
    game.locked = true;
    clearInterval(timerId);

    var attacker = currentAttacker();

    if (!game.bounced) {
      game.status = {
        type: "warn",
        text:
          "انتهى الوقت! ينتقل السؤال إلى فريق " +
          game.teams[opponent(attacker)].name +
          " لسرقة النقاط...",
      };
      renderGame();
      schedule(1000, bounceQuestion);
    } else {
      game.status = {
        type: "danger",
        text: "انتهى الوقت! لم يتمكن أحدٌ من الإجابة على هذا السؤال.",
      };
      var question = game.questions[game.index];
      game.log.push({
        question: question.text,
        answer: question.options[question.correctIndex],
        winner: null,
      });
      renderGame();
      schedule(1200, function () {
        resolveQuestion(null);
      });
    }
  }

  /* ---------- تمرير السؤال للفريق المنافس ---------- */
  function bounceQuestion() {
    game.bounced = true;
    game.attacker = opponent(currentAttacker());
    game.timeLeft = game.duration;
    game.locked = false;
    game.feedback = null;
    game.status = {
      type: "warn",
      text: "السؤال الآن مع فريق " + game.teams[game.attacker].name + " — فرصة لسرقة " + POINTS_PER_QUESTION + " نقاط!",
    };
    renderGame();
    startTimer();
  }

  /* ---------- إنهاء السؤال والانتقال للتالي ---------- */
  function resolveQuestion(winnerKey) {
    // السؤال التالي يُسنَد للفريق الآخر (مقابل آخر فريق أجاب)
    var nextHolder = opponent(currentAttacker());
    game.index += 1;

    if (game.index >= game.questions.length) {
      endGame();
      return;
    }

    game.holder = nextHolder;
    game.attacker = null;
    game.bounced = false;
    game.status = {
      type: "info",
      text: "السؤال التالي مع فريق " + game.teams[game.holder].name,
    };
    startQuestion();
  }

  /* ---------- رسم واجهة اللعبة ---------- */
  function renderGame() {
    var question = game.questions[game.index];
    var attacker = currentAttacker();

    view.innerHTML =
      '<div class="view">' +
      '  <div class="game-bar">' +
      '    <button class="btn ghost sm" data-action="exit-game" type="button">إنهاء التحدي</button>' +
      '    <div class="game-progress">السؤال ' +
      (game.index + 1) +
      " من " +
      game.questions.length +
      " · " +
      esc(game.bankTitle) +
      "</div>" +
      "  </div>" +
      '  <div class="progress-track"><div class="progress-fill" style="width:' +
      Math.round(((game.index + 1) / game.questions.length) * 100) +
      '%"></div></div>' +
      '  <div class="teams-stage">' +
      teamCard("a", attacker) +
      teamCard("b", attacker) +
      "  </div>" +
      '  <div class="question-panel">' +
      '    <div class="timer-wrap" id="timer-wrap">' +
      '      <svg class="timer-ring" viewBox="0 0 100 100" aria-hidden="true">' +
      '        <circle class="ring-track" cx="50" cy="50" r="44" />' +
      '        <circle class="ring-fill' + (game.timeLeft <= 5 ? " is-critical" : "") + '" id="ring-fill" cx="50" cy="50" r="44" />' +
      "      </svg>" +
      '      <span class="timer-text" id="timer-text">' + game.timeLeft + "</span>" +
      "    </div>" +
      '    <p class="question-text">' + esc(question.text) + "</p>" +
      '    <div class="options">' +
      question.options
        .map(function (opt, i) {
          return optionButton(opt, i, question);
        })
        .join("") +
      "    </div>" +
      '    <div class="game-status' +
      (game.status ? " is-" + game.status.type : "") +
      '">' +
      (game.status ? esc(game.status.text) : "بانتظار إجابة الفريق...") +
      "</div>" +
      "  </div>" +
      "</div>";

    // ضبط حلقة المؤقت على القيمة الحالية (بدون انتقال عند البداية)
    var ringEl = $("#ring-fill");
    var pct = game.duration ? game.timeLeft / game.duration : 0;
    ringEl.style.strokeDashoffset = (RING_CIRCUMFERENCE * (1 - pct)).toFixed(1);
  }

  /* ---------- بطاقة فريق ---------- */
  function teamCard(key, attacker) {
    var team = game.teams[key];
    var isActive = key === attacker;

    return (
      '<div class="team-card team-' + key + (isActive ? " is-active" : "") + '">' +
      '  <div class="team-card-info">' +
      '    <div class="team-card-name">' +
      '      <span class="team-dot"></span>' +
      esc(team.name) +
      (isActive ? ' <span class="turn-badge">دورها الآن</span>' : "") +
      "</div>" +
      '    <div class="team-card-stat">إجابات صحيحة: ' + game.corrects[key] + "</div>" +
      "  </div>" +
      '  <div class="team-score">' + game.scores[key] + "</div>" +
      "</div>"
    );
  }

  /* ---------- زر خيار ---------- */
  function optionButton(option, index, question) {
    var answered = !!game.feedback;
    var cls = "option-btn";
    var disabled = answered ? " disabled" : "";

    if (answered) {
      if (index === question.correctIndex) cls += " is-correct";
      else if (index === game.feedback.chosen) cls += " is-wrong";
    }

    return (
      '<button class="' + cls + '" data-action="answer" data-index="' + index + '" type="button"' + disabled + ">" +
      '  <span class="option-key">' + OPTION_KEYS[index] + "</span>" +
      "  <span>" + esc(option) + "</span>" +
      "</button>"
    );
  }

  /* ================= المرحلة 3: النتائج ================= */

  function endGame() {
    clearInterval(timerId);

    var winnerKey = null;
    if (game.scores.a > game.scores.b) winnerKey = "a";
    else if (game.scores.b > game.scores.a) winnerKey = "b";

    game.winner = winnerKey;

    // حفظ سجل التحدي
    EC.store.addHistory({
      bankTitle: game.bankTitle,
      winner: winnerKey ? game.teams[winnerKey].name : null,
      teams: [
        { name: game.teams.a.name, score: game.scores.a, corrects: game.corrects.a },
        { name: game.teams.b.name, score: game.scores.b, corrects: game.corrects.b },
      ],
    });

    mode = "result";
    renderResult();
  }

  function renderResult() {
    var winnerKey = game.winner;
    var isTie = !winnerKey;

    view.innerHTML =
      '<div class="view">' +
      '  <div class="card">' +
      '    <div class="result-hero">' +
      '      <div class="result-trophy">' + (isTie ? "=" : "1") + "</div>" +
      '      <h2 class="result-title">' +
      (isTie
        ? "تعادل!"
        : "فاز فريق " + esc(game.teams[winnerKey].name)) +
      "</h2>" +
      '      <p class="result-sub">' +
      (isTie
        ? "انتهى التحدي بالتعادل بين الفريقين"
        : "حصل على أعلى النقاط في تحدي " + esc(game.bankTitle)) +
      "</p>" +
      "    </div>" +
      '    <div style="padding:0 20px 24px">' +
      '      <table class="result-table">' +
      "        <thead><tr><th>الفريق</th><th>الإجابات الصحيحة</th><th>النقاط</th></tr></thead>" +
      "        <tbody>" +
      resultRow("a", winnerKey) +
      resultRow("b", winnerKey) +
      "        </tbody>" +
      "      </table>" +
      "    </div>" +
      '    <div class="modal-foot" style="border-top:1px solid var(--border)">' +
      '      <button class="btn ghost" data-action="back-to-setup" type="button">تحدي جديد</button>' +
      '      <button class="btn primary" data-action="goto-banks" type="button">العودة لبنك الأسئلة</button>' +
      "    </div>" +
      "  </div>" +
      '  <h3 class="section-title">مراجعة الأسئلة</h3>' +
      renderReview() +
      "</div>";
  }

  function resultRow(key, winnerKey) {
    var team = game.teams[key];
    var isWinner = key === winnerKey;

    return (
      '<tr class="' + (isWinner ? "is-winner" : "") + '">' +
      "    <td><strong>" + esc(team.name) + "</strong>" +
      (isWinner ? ' <span class="badge success">الفائز</span>' : "") +
      "</td>" +
      "    <td>" + game.corrects[key] + "</td>" +
      '    <td class="score">' + game.scores[key] + "</td>" +
      "  </tr>"
    );
  }

  function renderReview() {
    if (!game.log.length) {
      return '<div class="card card-pad text-center" style="color:var(--text-2)">لم تُسجَّل أي أسئلة في هذا التحدي.</div>';
    }

    var items = game.log
      .map(function (entry, index) {
        return (
          '<div class="review-item">' +
          '  <p>' + (index + 1) + ". " + esc(entry.question) + "</p>" +
          '  <div class="review-answer">الإجابة الصحيحة: ' + esc(entry.answer) + "</div>" +
          (entry.winner
            ? '  <div class="review-answer">أجاب بشكل صحيح: ' + esc(entry.winner) + "</div>"
            : '  <div class="review-none">لم يُجب أي فريق بشكل صحيح.</div>') +
          "</div>"
        );
      })
      .join("");

    return "<div>" + items + "</div>";
  }

  /* ================= أدوات مساعدة للمراحل ================= */

  function schedule(ms, fn) {
    window.setTimeout(function () {
      // نتأكد أن اللعبة لا تزال جارية ولم يُنهَها المعلم
      if (game && mode === "game") fn();
    }, ms);
  }

  function exitGame() {
    EC.utils
      .confirmDialog({
        title: "إنهاء التحدي",
        body: "سيتم إنهاء التحدي الحالي ولن تُحتسب النقاط المكتسبة حتى الآن. هل أنت متأكد؟",
        okLabel: "إنهاء",
      })
      .then(function (confirmed) {
        if (!confirmed) return;
        clearInterval(timerId);
        game = null;
        mode = "setup";
        EC.utils.toast("تم إنهاء التحدي", "success");
        renderSetup();
      });
  }

  /* ================= المعالِجات ================= */

  function onClick(event) {
    var btn = event.target.closest("[data-action]");
    if (!btn) return;

    var action = btn.getAttribute("data-action");

    if (action === "goto-banks") {
      EC.app.go("banks");
    } else if (action === "goto-teams") {
      EC.app.go("teams");
    } else if (action === "select-bank") {
      setupState.bankId = btn.value;
      renderSetup();
    } else if (action === "set-duration") {
      setupState.duration = clampDuration(btn.getAttribute("data-seconds"));
      EC.store.saveSettings({ timerDuration: setupState.duration });
      renderSetup();
    } else if (action === "start-challenge") {
      startChallenge();
    } else if (action === "answer") {
      if (mode === "game" && game && !game.locked) {
        selectAnswer(parseInt(btn.getAttribute("data-index"), 10));
      }
    } else if (action === "exit-game") {
      exitGame();
    } else if (action === "back-to-setup") {
      game = null;
      mode = "setup";
      renderSetup();
    }
  }

  /* ================= الواجهة العامة ================= */

  function init() {
    view = $("#view");
    view.addEventListener("click", onClick);
  }

  function render() {
    if (mode === "game" && game) renderGame();
    else if (mode === "result" && game) renderResult();
    else renderSetup();
  }

  return {
    init: init,
    render: render,
  };
})();

