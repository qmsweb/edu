/* =========================================================
   store.js — طبقة البيانات (localStorage)
   كل البيانات تُحفظ محلياً في متصفح المعلم ولا تُرسل
   لأي خادم. المفاتيح مُسبقة باسم التطبيق ورقم الإصدار.
   ========================================================= */

EC.store = (function () {
  var KEYS = {
    banks: "edu-challenge.banks.v1",
    teams: "edu-challenge.teams.v1",
    settings: "edu-challenge.settings.v1",
    history: "edu-challenge.history.v1",
  };

  var DEFAULT_TIMER = 30; // ثانية لكل سؤال
  var OPTION_COUNT = 4; // عدد الخيارات الافتراضي للسؤال

  /* ---------- قراءة/كتابة آمنة ---------- */
  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.error("تعذّر قراءة البيانات من " + key, err);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("تعذّر حفظ البيانات في " + key, err);
      EC.utils.toast("تعذّر حفظ البيانات في المتصفح", "error");
    }
  }

  function now() {
    return new Date().toISOString();
  }

  /* ================= بنوك الأسئلة ================= */

  function listBanks() {
    return read(KEYS.banks, []);
  }

  function getBank(bankId) {
    var banks = listBanks();
    for (var i = 0; i < banks.length; i++) {
      if (banks[i].id === bankId) return banks[i];
    }
    return null;
  }

  function saveBanks(banks) {
    write(KEYS.banks, banks);
  }

  function createBank(data) {
    var banks = listBanks();
    var bank = {
      id: EC.utils.uid(),
      title: String((data && data.title) || "").trim(),
      subject: String((data && data.subject) || "").trim(),
      questions: [],
      createdAt: now(),
      updatedAt: now(),
    };
    banks.push(bank);
    saveBanks(banks);
    return bank;
  }

  function updateBank(bankId, patch) {
    var banks = listBanks();
    var bank = null;
    for (var i = 0; i < banks.length; i++) {
      if (banks[i].id === bankId) {
        bank = banks[i];
        var key;
        for (key in patch) {
          if (Object.prototype.hasOwnProperty.call(patch, key)) {
            bank[key] = patch[key];
          }
        }
        bank.updatedAt = now();
        break;
      }
    }
    if (bank) saveBanks(banks);
    return bank;
  }

  function deleteBank(bankId) {
    saveBanks(
      listBanks().filter(function (bank) {
        return bank.id !== bankId;
      })
    );
  }

  /* ---------- الأسئلة داخل البنك ---------- */

  function addQuestion(bankId, question) {
    var bank = getBank(bankId);
    if (!bank) return null;

    var options = (question.options || []).slice(0, OPTION_COUNT);
    var correctIndex = Number(question.correctIndex);

    var item = {
      id: EC.utils.uid(),
      text: String(question.text || "").trim(),
      options: options.map(function (opt) {
        return String(opt || "").trim();
      }),
      correctIndex: isNaN(correctIndex) ? 0 : correctIndex,
      createdAt: now(),
    };

    bank.questions = bank.questions || [];
    bank.questions.push(item);
    bank.updatedAt = now();
    updateBank(bankId, { questions: bank.questions });
    return item;
  }

  function deleteQuestion(bankId, questionId) {
    var bank = getBank(bankId);
    if (!bank || !bank.questions) return false;

    bank.questions = bank.questions.filter(function (q) {
      return q.id !== questionId;
    });
    updateBank(bankId, { questions: bank.questions });
    return true;
  }

  /* ================= الفرق ================= */

  function listTeams() {
    return read(KEYS.teams, []);
  }

  function createTeam(name) {
    var teams = listTeams();
    var team = {
      id: EC.utils.uid(),
      name: String(name || "").trim(),
      createdAt: now(),
    };
    teams.push(team);
    write(KEYS.teams, teams);
    return team;
  }

  function renameTeam(teamId, newName) {
    var teams = listTeams();
    var found = false;
    teams.forEach(function (team) {
      if (team.id === teamId) {
        team.name = String(newName || "").trim();
        found = true;
      }
    });
    if (found) write(KEYS.teams, teams);
    return found;
  }

  function deleteTeam(teamId) {
    write(
      KEYS.teams,
      listTeams().filter(function (team) {
        return team.id !== teamId;
      })
    );
  }

  /* ================= الإعدادات ================= */

  function getSettings() {
    var settings = read(KEYS.settings, {});
    if (typeof settings.timerDuration !== "number" || !settings.timerDuration) {
      settings.timerDuration = DEFAULT_TIMER;
    }
    return settings;
  }

  function saveSettings(patch) {
    var settings = getSettings();
    var key;
    for (key in patch) {
      if (Object.prototype.hasOwnProperty.call(patch, key)) {
        settings[key] = patch[key];
      }
    }
    write(KEYS.settings, settings);
    return settings;
  }

  /* ================= سجل التحديات ================= */

  function listHistory() {
    return read(KEYS.history, []);
  }

  function addHistory(record) {
    var history = listHistory();
    history.unshift({
      id: EC.utils.uid(),
      createdAt: now(),
      data: record,
    });
    // نحتفظ بآخر 50 تحدياً فقط
    write(KEYS.history, history.slice(0, 50));
  }

  /* ================= بيانات تجريبية ================= */

  function seed() {
    if (listBanks().length === 0) {
      var science = createBank({ title: "أسئلة العلوم العامة", subject: "علوم" });
      addQuestion(science.id, {
        text: "ما هو الكوكب الأقرب إلى الشمس؟",
        options: ["عطارد", "الزهرة", "الأرض", "المريخ"],
        correctIndex: 0,
      });
      addQuestion(science.id, {
        text: "ما الغاز الذي يحتاجه الإنسان للتنفس؟",
        options: ["النيتروجين", "الأكسجين", "الهيدروجين", "ثاني أكسيد الكربون"],
        correctIndex: 1,
      });
      addQuestion(science.id, {
        text: "كم عدد أرجل العنكبوت؟",
        options: ["أربعة", "ستة", "ثمانية", "عشرة"],
        correctIndex: 2,
      });
      addQuestion(science.id, {
        text: "ما اسم عملية صنع الغذاء داخل النبات؟",
        options: ["التنفس", "التبخر", "التمثيل الضوئي", "النتح"],
        correctIndex: 2,
      });

      var math = createBank({ title: "تحدي الحساب السريع", subject: "رياضيات" });
      addQuestion(math.id, {
        text: "ما ناتج 7 × 8؟",
        options: ["54", "56", "64", "48"],
        correctIndex: 1,
      });
      addQuestion(math.id, {
        text: "ما ناتج 144 ÷ 12؟",
        options: ["11", "12", "13", "14"],
        correctIndex: 1,
      });
      addQuestion(math.id, {
        text: "ما ناتج 25 + 17؟",
        options: ["41", "42", "43", "44"],
        correctIndex: 1,
      });
      addQuestion(math.id, {
        text: "ما قيمة 9 تربيع (9²)؟",
        options: ["18", "81", "90", "99"],
        correctIndex: 1,
      });
    }

    if (listTeams().length === 0) {
      createTeam("فريق النجوم");
      createTeam("فريق الرواد");
      createTeam("فريق العقول");
      createTeam("فريق الأبطال");
    }
  }

  return {
    OPTION_COUNT: OPTION_COUNT,
    listBanks: listBanks,
    getBank: getBank,
    createBank: createBank,
    updateBank: updateBank,
    deleteBank: deleteBank,
    addQuestion: addQuestion,
    deleteQuestion: deleteQuestion,
    listTeams: listTeams,
    createTeam: createTeam,
    renameTeam: renameTeam,
    deleteTeam: deleteTeam,
    getSettings: getSettings,
    saveSettings: saveSettings,
    listHistory: listHistory,
    addHistory: addHistory,
    seed: seed,
  };
})();
