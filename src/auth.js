(function () {
  // DOM elements
  const overlay = document.getElementById("authOverlay");
  const blobs = document.getElementById("authBgBlobs");
  const toastCont = document.getElementById("authToastContainer");
  const screens = {
    login: document.getElementById("authScreenLogin"),
    signup: document.getElementById("authScreenSignup"),
    forgot: document.getElementById("authScreenForgot"),
  };

  let currentAuthScreen = "login";
  let authOtp = "",
    authResetEmail = "",
    authTransitioning = false;

  window.openAuthModal = function (startScreen) {
    document.body.style.overflow = "hidden";
    overlay.classList.add("open");
    if (startScreen) authSwitchScreen(startScreen, true);
    else {
      Object.values(screens).forEach((s) => s.classList.remove("active"));
      screens.login.classList.add("active");
      currentAuthScreen = "login";
    }
    const saved = getSavedSession();
    if (saved) {
      document.getElementById("authLoginEmail").value = saved.email;
      document.getElementById("authRememberMe").checked = true;
    }
  };

  window.closeAuthModal = function () {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  };

  window.handleOverlayClick = function (e) {
    if (e.target === overlay) closeAuthModal();
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAuthModal();
  });

  window.authSwitchScreen = function (target, instant) {
    if (authTransitioning || currentAuthScreen === target) return;
    if (instant) {
      Object.values(screens).forEach((s) =>
        s.classList.remove("active", "fading-out"),
      );
      screens[target].classList.add("active");
      currentAuthScreen = target;
      authClearAll();
      if (target === "forgot") resetForgotState();
      if (target === "signup") resetSignupState();
      return;
    }

    authTransitioning = true;
    blobs.classList.add("converging");
    const cur = screens[currentAuthScreen];
    cur.classList.add("fading-out");

    setTimeout(() => {
      Object.values(screens).forEach((s) =>
        s.classList.remove("active", "fading-out"),
      );
      screens[target].classList.add("active");
      currentAuthScreen = target;
      authClearAll();
      if (target === "forgot") resetForgotState();
      if (target === "signup") resetSignupState();
      blobs.classList.remove("converging");
      authTransitioning = false;
    }, 400);
  };

  // Storage helpers
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem("auth_users")) || [];
    } catch {
      return [];
    }
  }
  function saveUsers(u) {
    localStorage.setItem("auth_users", JSON.stringify(u));
  }
  function findUser(email) {
    return getUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
  }
  function addUser(u) {
    const users = getUsers();
    users.push(u);
    saveUsers(users);
  }
  function updatePassword(email, pass) {
    const users = getUsers();
    const u = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (u) {
      u.password = pass;
      saveUsers(users);
      return true;
    }
    return false;
  }
  function saveSession(email, remember) {
    localStorage.setItem(
      "auth_session",
      JSON.stringify({ email, ts: Date.now() }),
    );
    if (remember) localStorage.setItem("auth_remember", "true");
    else localStorage.removeItem("auth_remember");
  }
  function getSavedSession() {
    try {
      const s = JSON.parse(localStorage.getItem("auth_session"));
      return s && localStorage.getItem("auth_remember") === "true" ? s : null;
    } catch {
      return null;
    }
  }

  // ========== إضافة دوال المستخدم الحالي ==========
  function setCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify({
      name: user.name,
      email: user.email
    }));
  }

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch {
      return null;
    }
  }

  // Validation
  function isEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  }
  function passStrength(p) {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[a-z]/.test(p)) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    if (p.length >= 12) s++;
    return Math.min(s, 4);
  }
  const strengthLabel = ["ضعيفة جداً", "ضعيفة", "متوسطة", "قوية", "قوية جداً"];
  const strengthClass = ["weak", "fair", "good", "strong", "strong"];

  function showErr(el, msg) {
    if (el) {
      el.textContent = "⚠ " + msg;
      el.classList.add("visible");
    }
  }
  function hideErr(el) {
    if (el) {
      el.textContent = "";
      el.classList.remove("visible");
    }
  }
  function markErr(inp) {
    if (inp) inp.classList.add("error");
  }
  function markOk(inp) {
    if (inp) {
      inp.classList.remove("error");
      inp.classList.add("success");
    }
  }
  function clearMark(inp) {
    if (inp) inp.classList.remove("error", "success");
  }
  function authClearAll() {
    document.querySelectorAll("#authCard .error-msg").forEach((e) => {
      e.textContent = "";
      e.classList.remove("visible");
    });
    document
      .querySelectorAll("#authCard .input-field")
      .forEach((i) => i.classList.remove("error", "success"));
  }

  function toast(msg, type = "info") {
    const t = document.createElement("div");
    t.className = `auth-toast auth-toast--${type}`;
    t.innerHTML =
      ({ success: "✅", error: "❌", info: "ℹ️" }[type] || "ℹ️") + " " + msg;
    toastCont.appendChild(t);
    setTimeout(() => t.remove(), 3700);
  }

  window.authTogglePassword = function (id, btn) {
    const inp = document.getElementById(id);
    if (!inp) return;
    const show = inp.type === "password";
    inp.type = show ? "text" : "password";
    const svg = btn.querySelector("svg");
    if (svg)
      svg.innerHTML = show
        ? `<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>`
        : `<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>`;
  };

  function updateStrength(password) {
    const score = passStrength(password);
    const bars = document.querySelectorAll("#authStrengthBars .strength-bar");
    bars.forEach((b, i) => {
      b.className = "strength-bar";
      if (i < score) b.classList.add("active", strengthClass[score]);
    });
    const txt = document.getElementById("authStrengthText");
    txt.textContent = password.length > 0 ? strengthLabel[score] : "";
  }
  function resetStrength() {
    document
      .querySelectorAll("#authStrengthBars .strength-bar")
      .forEach((b) => (b.className = "strength-bar"));
    document.getElementById("authStrengthText").textContent = "";
  }
  function resetSignupState() {
    document.getElementById("authSignupForm").reset();
    resetStrength();
  }
  function resetForgotState() {
    document.getElementById("authForgotForm").reset();
    document.getElementById("authForgotStep1").style.display = "block";
    document.getElementById("authForgotStep2").style.display = "none";
    document.getElementById("authForgotSubtitle").textContent =
      "أدخل بريدك الإلكتروني لإرسال رمز التحقق";
    document.getElementById("authOtpCode").textContent = "------";
    authOtp = "";
    authResetEmail = "";
    updateSteps(1);
  }
  function updateSteps(step) {
    const d1 = document.getElementById("authStepDot1"),
      d2 = document.getElementById("authStepDot2"),
      d3 = document.getElementById("authStepDot3");
    const l1 = document.getElementById("authStepLine1"),
      l2 = document.getElementById("authStepLine2");
    [d1, d2, d3].forEach((d) => (d.className = "step-dot"));
    [l1, l2].forEach((l) => (l.className = "step-line"));
    if (step === 1) {
      d1.classList.add("active");
    }
    if (step === 2) {
      d1.classList.add("done");
      d2.classList.add("active");
      l1.classList.add("done");
    }
    if (step === 3) {
      d1.classList.add("done");
      d2.classList.add("done");
      d3.classList.add("active");
      l1.classList.add("done");
      l2.classList.add("done");
    }
  }

  // ========== Login (مع توجيه للداشبورد) ==========
  document
    .getElementById("authLoginForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      authClearAll();
      const email = document.getElementById("authLoginEmail").value.trim();
      const pass = document.getElementById("authLoginPassword").value;
      let err = false;
      if (!email) {
        showErr(document.getElementById("authLoginEmailError"), "البريد مطلوب");
        markErr(document.getElementById("authLoginEmail"));
        err = true;
      } else if (!isEmail(email)) {
        showErr(
          document.getElementById("authLoginEmailError"),
          "صيغة البريد خاطئة",
        );
        markErr(document.getElementById("authLoginEmail"));
        err = true;
      }
      if (!pass) {
        showErr(
          document.getElementById("authLoginPasswordError"),
          "كلمة المرور مطلوبة",
        );
        markErr(document.getElementById("authLoginPassword"));
        err = true;
      }
      if (err) return;
      const btn = document.getElementById("authLoginBtn");
      btn.classList.add("loading");
      btn.disabled = true;
      setTimeout(() => {
        const user = findUser(email);
        if (!user) {
          showErr(
            document.getElementById("authLoginEmailError"),
            "البريد غير مسجل",
          );
          markErr(document.getElementById("authLoginEmail"));
          toast("البريد غير مسجل", "error");
          btn.classList.remove("loading");
          btn.disabled = false;
          return;
        }
        if (user.password !== pass) {
          showErr(
            document.getElementById("authLoginPasswordError"),
            "كلمة المرور خاطئة",
          );
          markErr(document.getElementById("authLoginPassword"));
          toast("كلمة المرور خاطئة", "error");
          btn.classList.remove("loading");
          btn.disabled = false;
          return;
        }
        markOk(document.getElementById("authLoginEmail"));
        markOk(document.getElementById("authLoginPassword"));
        saveSession(email, document.getElementById("authRememberMe").checked);
        
        // حفظ بيانات المستخدم الحالي
        setCurrentUser({ name: user.name, email: user.email });
        
        btn.classList.remove("loading");
        btn.disabled = false;
        toast(`مرحباً ${user.name}! 🎉`, "success");
        
        // توجيه إلى الداشبورد بعد نصف ثانية
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 500);
      }, 700);
    });

  // ========== Signup (مع توجيه للداشبورد) ==========
  document
    .getElementById("authSignupForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      authClearAll();
      const name = document.getElementById("authSignupName").value.trim();
      const email = document.getElementById("authSignupEmail").value.trim();
      const pass = document.getElementById("authSignupPassword").value;
      const confirm = document.getElementById("authSignupConfirm").value;
      let err = false;
      if (!name || name.length < 3) {
        showErr(
          document.getElementById("authSignupNameError"),
          name ? "الاسم قصير جداً" : "الاسم مطلوب",
        );
        markErr(document.getElementById("authSignupName"));
        err = true;
      }
      if (!email) {
        showErr(
          document.getElementById("authSignupEmailError"),
          "البريد مطلوب",
        );
        markErr(document.getElementById("authSignupEmail"));
        err = true;
      } else if (!isEmail(email)) {
        showErr(
          document.getElementById("authSignupEmailError"),
          "صيغة بريد خاطئة",
        );
        markErr(document.getElementById("authSignupEmail"));
        err = true;
      } else if (findUser(email)) {
        showErr(
          document.getElementById("authSignupEmailError"),
          "البريد مسجل مسبقاً",
        );
        markErr(document.getElementById("authSignupEmail"));
        err = true;
      }
      if (!pass || pass.length < 8) {
        showErr(
          document.getElementById("authSignupPasswordError"),
          pass ? "8 أحرف على الأقل" : "كلمة المرور مطلوبة",
        );
        markErr(document.getElementById("authSignupPassword"));
        err = true;
      } else if (passStrength(pass) < 2) {
        showErr(
          document.getElementById("authSignupPasswordError"),
          "كلمة مرور ضعيفة جداً",
        );
        markErr(document.getElementById("authSignupPassword"));
        err = true;
      }
      if (!confirm || pass !== confirm) {
        showErr(
          document.getElementById("authSignupConfirmError"),
          confirm ? "كلمتا المرور غير متطابقتين" : "تأكيد كلمة المرور مطلوب",
        );
        markErr(document.getElementById("authSignupConfirm"));
        err = true;
      }
      if (err) return;
      const btn = document.getElementById("authSignupBtn");
      btn.classList.add("loading");
      btn.disabled = true;
      setTimeout(() => {
        addUser({
          name,
          email: email.toLowerCase(),
          password: pass,
          createdAt: new Date().toISOString(),
        });
        // بعد التسجيل نسجل الدخول تلقائياً
        saveSession(email, false);
        setCurrentUser({ name, email: email.toLowerCase() });
        
        toast("تم إنشاء الحساب بنجاح! 🎉", "success");
        btn.classList.remove("loading");
        btn.disabled = false;
        
        // توجيه إلى الداشبورد
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 800);
      }, 600);
    });

  // Forgot password (يظل كما هو بدون توجيه للداشبورد)
  document
    .getElementById("authSendOtpBtn")
    .addEventListener("click", function () {
      authClearAll();
      const email = document.getElementById("authForgotEmail").value.trim();
      if (!email) {
        showErr(
          document.getElementById("authForgotEmailError"),
          "البريد مطلوب",
        );
        markErr(document.getElementById("authForgotEmail"));
        return;
      }
      if (!isEmail(email)) {
        showErr(
          document.getElementById("authForgotEmailError"),
          "صيغة بريد خاطئة",
        );
        markErr(document.getElementById("authForgotEmail"));
        return;
      }
      if (!findUser(email)) {
        showErr(
          document.getElementById("authForgotEmailError"),
          "البريد غير مسجل",
        );
        markErr(document.getElementById("authForgotEmail"));
        toast("البريد غير موجود", "error");
        return;
      }
      this.classList.add("loading");
      this.disabled = true;
      setTimeout(() => {
        authOtp = String(Math.floor(100000 + Math.random() * 900000));
        authResetEmail = email.toLowerCase();
        document.getElementById("authOtpCode").textContent = authOtp;
        document.getElementById("authForgotSubtitle").textContent =
          "أدخل رمز التحقق وكلمة المرور الجديدة";
        updateSteps(2);
        document.getElementById("authForgotStep1").style.display = "none";
        document.getElementById("authForgotStep2").style.display = "block";
        markOk(document.getElementById("authForgotEmail"));
        this.classList.remove("loading");
        this.disabled = false;
        toast("تم إرسال رمز التحقق (تجريبي)", "info");
      }, 700);
    });

  document
    .getElementById("authForgotForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      if (document.getElementById("authForgotStep2").style.display === "none")
        return;
      authClearAll();
      const otp = document.getElementById("authForgotOtp").value.trim();
      const pass = document.getElementById("authForgotNewPass").value;
      let err = false;
      if (!otp) {
        showErr(document.getElementById("authForgotOtpError"), "الرمز مطلوب");
        markErr(document.getElementById("authForgotOtp"));
        err = true;
      } else if (otp !== authOtp) {
        showErr(
          document.getElementById("authForgotOtpError"),
          "الرمز غير صحيح",
        );
        markErr(document.getElementById("authForgotOtp"));
        err = true;
      }
      if (!pass || pass.length < 8) {
        showErr(
          document.getElementById("authForgotNewPassError"),
          pass ? "8 أحرف على الأقل" : "كلمة المرور مطلوبة",
        );
        markErr(document.getElementById("authForgotNewPass"));
        err = true;
      } else if (passStrength(pass) < 2) {
        showErr(
          document.getElementById("authForgotNewPassError"),
          "كلمة مرور ضعيفة",
        );
        markErr(document.getElementById("authForgotNewPass"));
        err = true;
      }
      if (err) return;
      const btn = document.getElementById("authResetBtn");
      btn.classList.add("loading");
      btn.disabled = true;
      setTimeout(() => {
        if (updatePassword(authResetEmail, pass)) {
          updateSteps(3);
          markOk(document.getElementById("authForgotOtp"));
          markOk(document.getElementById("authForgotNewPass"));
          toast("تم تحديث كلمة المرور بنجاح! ✅", "success");
          btn.classList.remove("loading");
          btn.disabled = false;
          setTimeout(() => {
            authSwitchScreen("login");
            document.getElementById("authLoginEmail").value = authResetEmail;
          }, 1400);
        }
      }, 600);
    });

  // Live input listeners
  document
    .getElementById("authSignupPassword")
    .addEventListener("input", function () {
      updateStrength(this.value);
      clearMark(this);
      hideErr(document.getElementById("authSignupPasswordError"));
    });
  [
    "authLoginEmail",
    "authLoginPassword",
    "authSignupName",
    "authSignupEmail",
    "authSignupConfirm",
    "authForgotEmail",
    "authForgotOtp",
    "authForgotNewPass",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el)
      el.addEventListener("input", function () {
        clearMark(this);
      });
  });
})();

function toggleDark() {
  document.body.classList.toggle("dark");
}