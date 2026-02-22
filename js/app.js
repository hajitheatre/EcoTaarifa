/**
 * app.js — EcoTaarifa Core Application Logic
 * =====================================================================
 * Single-file JavaScript module that powers the entire EcoTaarifa PWA.
 *
 * Major Sections (search for the section header to jump):
 *  - DATA              : Global state variables (reports, users, stats)
 *  - SECURITY & TIMEOUT: Client-side inactivity detection and auto-logout
 *  - TRANSLATIONS      : Multi-language support (English / Swahili)
 *  - UI HELPERS        : Reusable UI utilities (loading buttons, field shaking)
 *  - AUTH              : Login, registration, and logout flows
 *  - TOAST             : In-app notification system
 *  - APP INIT          : DOMContentLoaded bootstrap, routing, and page setup
 *  - MAP               : Leaflet.js map initialization and interaction
 *  - TABS (USER)       : User dashboard tab switching and content rendering
 *  - USER HOME         : User home card, mini-map, and stat rendering
 *  - USER REPORTS      : User report history list rendering
 *  - TABS (ADMIN)      : Admin dashboard tab switching and content rendering
 *  - ADMIN HOME        : Admin stats card rendering
 *  - ADMIN REPORTS     : Admin report board rendering and status updates
 *  - ADMIN USERS       : Admin user management rendering and CRUD
 *  - PROFILE           : Shared profile/settings tab rendering
 *  - UPDATE PROFILE    : Profile and password update API calls
 *  - THEME             : Dark/light/system theme application
 *  - REFRESH           : Re-render current view (called on lang/theme change)
 *  - PWA EVENTS        : Install prompt, app installed, and update events
 *
 * Dependencies: Leaflet.js, Lucide Icons, Lottie Player (all via CDN)
 * Storage: localStorage (auth, theme, lang), PHP sessions (server-side auth)
 * =====================================================================
 */

// ============ DATA ============
const categories = ["enviromental", "water", "electricity", "waste", "other"];

// Standardized API base — set in config.js
const apiBase = window.API_BASE_URL || "api/";
const base = window.BASE_URL || "";
const isDashboard = typeof IS_DASHBOARD !== "undefined" ? IS_DASHBOARD : false;
const assetBase = base + "assets/";

console.log("EcoTaarifa App Init:", { apiBase, assetBase, isDashboard });

let reports = [];
let historyReports = [];
let users = [];

let adminStats = {
  totalUsers: 0,
  totalReports: 0,
  pendingReports: 0,
  inProgressReports: 0,
  resolvedReports: 0,
};

// ============ SECURITY & TIMEOUT ============
let inactivityTimer;
const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  if (currentUser) {
    inactivityTimer = setTimeout(handleInactivityTimeout, TIMEOUT_MS);
  }
}

async function handleInactivityTimeout() {
  console.log("Session timed out due to inactivity.");
  try {
    await fetch(apiBase + "logout.php");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    currentRole = null;
    currentUser = null;

    // Redirect with timeout flag
    window.location.href = base + "index.php?timeout=1";
  } catch (err) {
    console.error("Inactivity logout failed:", err);
  }
}

// ============ UI HELPERS ============
function setBtnLoading(btn, isLoading, originalText) {
  if (!btn) return;
  btn.disabled = isLoading;
  if (isLoading) {
    const spinner = `<span class="btn-spinner"></span>`;
    btn.innerHTML = btn.innerHTML.includes("data-lucide")
      ? spinner + btn.innerHTML.replace(btn.textContent.trim(), "")
      : spinner + (t("loading") || "Loading...");
  } else {
    btn.innerHTML = originalText;
  }
}

// Global listeners to reset timer
["mousemove", "mousedown", "keydown", "touchstart", "scroll"].forEach(
  (event) => {
    window.addEventListener(event, resetInactivityTimer, true);
  },
);

// ============ TRANSLATIONS ============
const translations = {
  en: {
    home: "Home", reports: "Reports", users: "Users", profile: "Profile", myReports: "My Reports",
    searchReports: "Search reports...", searchUsers: "Search users...", pending: "Pending",
    inProgress: "In Progress", resolved: "Resolved", all: "All", newReport: "Report An Issue",
    submit: "Submit", cancel: "Cancel", delete: "Delete", edit: "Edit", approve: "Approve",
    resolve: "Resolve", addUser: "Add User", name: "Name", email: "Email", password: "Password",
    location: "Location", category: "Category", description: "Description", date: "Date",
    action: "Action", status: "Status", reporter: "Reporter", title: "Title",
    totalReports: "Total Reports", totalUsers: "Total Users", pendingReports: "Pending",
    resolvedReports: "Resolved", inProgressReports: "In Progress", welcome: "Welcome back",
    logout: "Logout", changePassword: "Change Password", currentPassword: "Current Password",
    newPassword: "New Password", confirmPassword: "Confirm Password", updateProfile: "Update Profile",
    theme: "Theme", language: "Language", light: "Light", dark: "Dark", system: "System",
    save: "Save", saveChanges: "Save Changes", makeAdmin: "Make Admin",
    reportedIssues: "Reported Issues Nearby", overview: "Overview",
    preferences: "Preferences", fullName: "Full Name", first_name: "First Name", last_name: "Last Name", role: "Role", personalInfo: "Personal Details", noReports: "No reports found",
    confirmDelete: "Are you sure you want to delete this?", reportSubmitted: "Report submitted successfully",
    userAdded: "Account created successfully! You can now login", userUpdated: "User updated successful", userDeleted: "Deleted successful",
    profileUpdated: "Profile updated successfully", passwordChanged: "Password changed successfully",
    selectCategory: "Select category", descriptionPlaceholder: "Describe the issue in detail...",
    enterLocation: "Enter or detect location", gps: "GPS", sendReport: "Send Report",
    english: "English", swahili: "Swahili", appearance: "Appearance",
    chooseTheme: "Choose your preferred theme", chooseLanguage: "Choose your preferred language",
    admin: "Admin", user: "User", login: "Log In", signUp: "Sign Up", createAccount: "Create Account",
    noAccount: "Don't have an account?", hasAccount: "Already have an account?",
    emailRequired: "Valid email is required", passwordMin: "Password must be at least 6 characters",
    nameRequired: "Field is required",
    reportTitle: "Report Title", titlePlaceholder: "Brief title for the issue",
    view: "View", reportDetails: "Report Details", showPassword: "Show Password", hidePassword: "Hide Password",
    noUsers: "No users found", leaveBlankKeepCurrent: "leave blank to keep current",
    quickSupport: "Quick Support", followUs: "Follow Us", openingHours: "Opening Hours", contact: "Contact", email: "Email",
    visitSite: "Visit Site",
    enviromental: "Enviromental", water: "Water", electricity: "Electricity",
    waste: "Waste/Garbage", other: "Other",
    gotIt: "Got It",
    reportFromMap: "Report An Issue From The Map",
    tapToReport: "Tap anywhere on the map to report an issue at that location",
    sessionTimeout: "Session expired! Please login again.",
    installApp: "Install App",
    installPrompt: "Install EcoTaarifa for better experience!",
    updateAvailable: "A new version of EcoTaarifa is available!",
    updateNow: "Update Now",
  },
  sw: {
    home: "Nyumbani", reports: "Ripoti", users: "Watumiaji", profile: "Wasifu", myReports: "Ripoti Zangu",
    searchReports: "Tafuta ripoti...", searchUsers: "Tafuta watumiaji...", pending: "Inasubiri",
    inProgress: "Inaendelea", resolved: "Imetatuliwa", all: "Zote", newReport: "Ripoti Mpya",
    submit: "Tuma", cancel: "Ghairi", delete: "Futa", edit: "Hariri", approve: "Kubali",
    resolve: "Tatua", addUser: "Ongeza Mtumiaji", name: "Jina", email: "Barua pepe", password: "Nywila",
    location: "Mahali", category: "Aina", description: "Maelezo", date: "Tarehe", action: "Kitendo",
    status: "Hali", reporter: "Mripoti", title: "Kichwa", totalReports: "Jumla ya Ripoti",
    totalUsers: "Jumla ya Watumiaji", pendingReports: "Inasubiri", resolvedReports: "Imetatuliwa",
    inProgressReports: "Inaendelea", welcome: "Karibu tena", logout: "Ondoka",
    changePassword: "Badilisha Nywila", currentPassword: "Nywila ya Sasa", newPassword: "Nywila Mpya",
    confirmPassword: "Thibitisha Nywila", updateProfile: "Sasisha Wasifu", theme: "Mandhari",
    language: "Lugha", light: "Mwanga", dark: "Giza", system: "Mfumo", save: "Hifadhi",
    saveChanges: "Hifadhi Mabadiliko", makeAdmin: "Fanya Msimamizi",
    reportedIssues: "Matatizo Yaliyoripotiwa Karibu", overview: "Muhtasari",
    personalInfo: "Maelezo Binafsi", securitySettings: "Mipangilio ya Usalama",
    preferences: "Mapendeleo", fullName: "Jina Kamili", first_name: "Jina la Kwanza", last_name: "Jina la Mwisho", role: "Jukumu",
    view: "Angalia", reportDetails: "Maelezo ya Ripoti", noReports: "Hakuna ripoti zilizopatikana",
    confirmDelete: "Una uhakika unataka kufuta hii?",
    reportSubmitted: "Ripoti imetumwa kwa mafanikio", userAdded: "Akaunti imeundwa kikamilifu! Sasa unaweza kuingia",
    userUpdated: "Mtumiaji amesasishwa kwa mafanikio", profileUpdated: "Wasifu umesasishwa kwa mafanikio",
    passwordChanged: "Nywila imebadilishwa kwa mafanikio", selectCategory: "Chagua aina",
    descriptionPlaceholder: "Eleza tatizo kwa undani...", enterLocation: "Weka au gundua mahali",
    gps: "GPS", sendReport: "Tuma Ripoti", english: "Kiingereza", swahili: "Kiswahili",
    appearance: "Mwonekano", chooseTheme: "Chagua mandhari unayopendelea",
    chooseLanguage: "Chagua lugha unayopendelea", admin: "Msimamizi", user: "Mtumiaji",
    login: "Ingia", signUp: "Jisajili", createAccount: "Fungua Akaunti",
    noAccount: "Huna akaunti?", hasAccount: "Una akaunti tayari?",
    emailRequired: "Barua pepe sahihi inahitajika", passwordMin: "Nywila lazima iwe na herufi 6 au zaidi",
    nameRequired: "Sehemu hii inahitajika",
    reportTitle: "Kichwa cha Ripoti", titlePlaceholder: "Kichwa kifupi cha tatizo",
    passwordsNoMatch: "Nywila hazifanani", userDeleted: "Imefutwa kikamilifu",
    showPassword: "Onyesha Nywila", hidePassword: "Ficha Nywila",
    noUsers: "Hakuna watumiaji waliopatikana", leaveBlankKeepCurrent: "acha tupu ili kubaki na ya sasa",
    quickSupport: "Msaada wa Haraka", followUs: "Tufuate", openingHours: "Saa za Kazi", contact: "Mawasiliano", email: "Barua pepe",
    visitSite: "Tembelea Tovuti",
    enviromental: "Mazingira", water: "Maji", electricity: "Umeme",
    waste: "Taka/Takataka", other: "Nyingine",
    gotIt: "Nimeelewa",
    reportFromMap: "Ripoti Tatizo Kutoka Kwenye Ramani",
    tapToReport: "Gusa popote kwenye ramani ili kuripoti tatizo eneo hilo",
    sessionTimeout: "Session imeisha muda wake! Tafadhali ingia tena.",
    installApp: "Sakinisha Programu",
    installPrompt: "Sakinisha EcoTaarifa kwa uzoefu bora!",
    updateAvailable: "Toleo jipya la EcoTaarifa linapatikana!",
    updateNow: "Sasisha Sasa",
  }
};

let deferredPrompt = null;
let currentLang = localStorage.getItem("lang") || "en";
function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || key;
}
function setLang(l) {
  currentLang = l;
  localStorage.setItem("lang", l);
  refreshCurrentView();
}

// ============ TEMPLATE HELPERS ============
function applyTranslations(container) {
  if (!container) return;
  container.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  container.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });
}

function loadTemplate(id) {
  const tmpl = document.getElementById(id);
  if (!tmpl) return "";
  return tmpl.innerHTML;
}

function applyProfileState(container) {
  const currentTheme = localStorage.getItem("theme") || "system";
  const currentLang = localStorage.getItem("lang") || "en";
  container.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.getAttribute("data-theme") === currentTheme,
    );
  });
  container.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.getAttribute("data-lang") === currentLang,
    );
  });

  const installBtn = container.querySelector("#pwa-install-btn");
  if (installBtn) {
    if (deferredPrompt) {
      installBtn.classList.remove("hidden");
      installBtn.onclick = installPWA;
    } else {
      installBtn.classList.add("hidden");
    }
  }
}

function installPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
    deferredPrompt = null;
    refreshCurrentView();
  });
}

// ============ STATE ============
let currentUser = JSON.parse(localStorage.getItem("user") || "null");
let currentRole = localStorage.getItem("role") || null;
let isLogin = true;
let authTouched = {};
let userActiveTab = "home";
let userReportSearchVal = "";
let userReportFilter = "All";
let adminActiveTab = "home";
let adminReportFilter = "All";

async function fetchReports() {
  try {
    const response = await fetch(apiBase + "get_reports.php");
    const result = await response.json();
    if (result.success) {
      reports = result.data;
    }
  } catch (err) {
    console.error("Failed to fetch reports:", err);
  }
}

async function fetchHistory() {
  if (!currentUser) return;
  try {
    const response = await fetch(
      apiBase +
        "get_user_history.php?email=" +
        encodeURIComponent(currentUser.email),
    );
    const result = await response.json();
    if (result.success) {
      historyReports = result.data;
    }
  } catch (err) {
    console.error("Failed to fetch history:", err);
  }
}

// ============ INIT ============
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initial settings from localStorage
  const savedTheme = localStorage.getItem("theme") || "system";
  const savedLang = localStorage.getItem("lang") || "en";

  // 2. Apply settings
  applyTheme(savedTheme);
  setLang(savedLang);

  // 3. Check for recent PWA update
  if (localStorage.getItem("pwa_updated") === "true") {
    localStorage.removeItem("pwa_updated");
    showToast(
      "EcoTaarifa has been updated successfully!",
      "confirm",
      t("gotIt") || "Got It",
    );
  }

  if (isDashboard) {
    // We are on a dashboard page (admin or user)
    // Determine which dashboard based on what's in the DOM
    const isAdmin = !!document.getElementById("admin-dashboard");
    const prefix = isAdmin ? "admin" : "user";

    // Set header info from localStorage
    const nameEl = document.getElementById(`${prefix}-dashboard-name`);
    const roleEl = document.getElementById(`${prefix}-dashboard-role`);
    const avatarEl = document.getElementById(`${prefix}-dashboard-avatar`);
    if (nameEl) nameEl.textContent = currentUser?.name || "Citizen";
    if (roleEl) roleEl.textContent = isAdmin ? "Admin" : "Citizen";
    if (avatarEl)
      avatarEl.textContent = getInitials(currentUser?.name || "Citizen");

    // Initialize the correct tab
    if (isAdmin) switchAdminTab("home");
    else switchUserTab("home");

    // Background Data Fetching
    fetchReports().catch(console.error);
    if (isAdmin) {
      fetchUsers().catch(console.error);
      fetchStats().catch(console.error);
    }

    // Start polling for real-time updates every 1s
    setInterval(async () => {
      fetchReports().catch(console.error);
      if (isAdmin) {
        fetchUsers().catch(console.error);
        fetchStats().catch(console.error);
      } else {
        fetchHistory().catch(console.error);
        fetchStats().catch(console.error);
      }
      surgicalUpdate();
    }, 1000);
  } else {
    // We are on the auth page (index.php)
    showPage("auth-page");
  }

  lucide.createIcons();

  // Initial timer setup if logged in
  if (currentUser) resetInactivityTimer();

  // Check for timeout parameter on index
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("timeout")) {
    showToast(
      t("sessionTimeout") || "Session expired! Please login again.",
      "danger",
      t("gotIt"),
      null,
      false,
    );
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

function surgicalUpdate() {
  // Don't update if a modal is open or if user is searching
  if (!document.getElementById("modal-overlay").classList.contains("hidden"))
    return;
  if (document.getElementById("toast-container").classList.contains("active"))
    return;

  const searchInput = document.querySelector(
    ".search-wrapper input, .top-bar-search input",
  );
  if (searchInput && document.activeElement === searchInput) return;

  if (currentRole === "admin") {
    if (adminActiveTab === "home") updateAdminHomeUI();
    else if (adminActiveTab === "reports") updateAdminReportsUI();
    else if (adminActiveTab === "users") updateAdminUsersUI();
  } else if (currentRole === "user") {
    if (userActiveTab === "home") updateUserHomeUI();
    else if (userActiveTab === "reports") updateUserReportsUI();
  }
}

// Helper for surgical list updates to prevent animation re-triggering
function surgicalListUpdate(container, items, renderItemFn, idKey = "id") {
  if (!container) return;
  const existingMap = new Map();
  Array.from(container.children).forEach((el) => {
    const id = el.dataset.id;
    if (id) existingMap.set(String(id), el);
  });

  const newIds = new Set();
  const parser = document.createElement("template"); // Use template to preserve context-sensitive tags (like <tr>)

  items.forEach((item, index) => {
    const id = String(item[idKey]);
    newIds.add(id);

    let el = existingMap.get(id);
    if (el) {
      const newHTML = renderItemFn(item, index, false);
      parser.innerHTML = newHTML;
      const newNode = parser.content.firstElementChild;

      // Update content only if changed to avoid unnecessary DOM thrashing
      if (el.innerHTML !== newNode.innerHTML) {
        el.innerHTML = newNode.innerHTML;
        // Merge classes: Keep any classes on the existing element (like animations)
        // that are NOT in the incoming node's classList, but ensure incoming classes are applied.
        const currentClasses = Array.from(el.classList);
        const incomingClasses = Array.from(newNode.classList);

        incomingClasses.forEach((cls) => el.classList.add(cls));
        // Remove classes that are NOT in incoming AND NOT typical persistent classes (like animation classes)
        currentClasses.forEach((cls) => {
          if (
            !newNode.classList.contains(cls) &&
            !cls.startsWith("animate-") &&
            !cls.includes("fadeIn")
          ) {
            el.classList.remove(cls);
          }
        });
      }
    } else {
      // New item - render WITH animation
      const freshHTML = renderItemFn(item, index, true);
      container.insertAdjacentHTML("beforeend", freshHTML);
    }
  });

  // Remove missing items
  existingMap.forEach((el, id) => {
    if (!newIds.has(id)) el.remove();
  });
}

// ============ PAGE MANAGEMENT ============
function showPage(id) {
  document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  if (id === "user-dashboard" || id === "admin-dashboard") {
    const isMainAdmin = id === "admin-dashboard";
    const prefix = isMainAdmin ? "admin" : "user";
    const nameEl = document.getElementById(`${prefix}-dashboard-name`);
    const roleEl = document.getElementById(`${prefix}-dashboard-role`);
    const avatarEl = document.getElementById(`${prefix}-dashboard-avatar`);

    if (nameEl) nameEl.textContent = currentUser?.name || "Citizen";
    if (roleEl) roleEl.textContent = isMainAdmin ? "Admin" : "Citizen";
    if (avatarEl)
      avatarEl.textContent = getInitials(currentUser?.name || "Citizen");

    if (isMainAdmin) switchAdminTab("home");
    else switchUserTab("home");
  }
  lucide.createIcons();
}

function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

// ============ AUTH ============
function switchAuthTab(login) {
  isLogin = login;
  authTouched = {};

  const authPage = document.getElementById("auth-page");
  authPage.classList.toggle("signup-mode", !login);

  document.getElementById("login-tab").classList.toggle("active", login);
  document.getElementById("signup-tab").classList.toggle("active", !login);

  document.getElementById("auth-submit-btn").textContent = login
    ? t("login")
    : t("createAccount");
  document.getElementById("auth-footer-text").textContent = login
    ? t("noAccount") + " "
    : t("hasAccount") + " ";
  document.getElementById("auth-footer-link").textContent = login
    ? t("signUp")
    : t("login");
  document.getElementById("auth-footer-link").onclick = () =>
    switchAuthTab(!login);
  clearAuthErrors();
}

function touchAuthField(field) {
  authTouched[field] = true;
  validateAuthField(field);
}

function validateAuthField(field) {
  const el = document.getElementById("auth-" + field);
  const errEl = document.getElementById(field + "-error");
  if (!el || !errEl) return;
  const val = el.value;
  let err = "";

  if (!authTouched[field]) {
    errEl.textContent = "";
    return;
  }

  if (field === "email" && (!val.includes("@") || !val.includes(".")))
    err = t("emailRequired");

  // Password length check ONLY for registration
  if (field === "password") {
    if (!val.trim()) {
      err = t("nameRequired");
    } else if (!isLogin && val.length < 6) {
      err = t("passwordMin");
    }
  }

  if (
    (field === "first-name" || field === "last-name") &&
    !isLogin &&
    !val.trim()
  )
    err = t("nameRequired");

  errEl.textContent = err;
  el.classList.toggle("input-error", !!err);
  el.classList.toggle("input-valid", !err && val.length > 0);
}

function clearAuthErrors() {
  ["first-name", "last-name", "email", "password"].forEach((f) => {
    const el = document.getElementById("auth-" + f);
    const errEl = document.getElementById(f + "-error");
    if (el) {
      el.classList.remove("input-error", "input-valid", "animate-shake");
      el.value = "";
    }
    if (errEl) errEl.textContent = "";
  });
}

async function handleAuth(e) {
  e.preventDefault();
  const btn = document.getElementById("auth-submit-btn");
  const originalText = btn.innerHTML; // Changed to innerHTML for setBtnLoading

  authTouched = {
    email: true,
    password: true,
    "first-name": true,
    "last-name": true,
  };
  validateAuthField("email");
  validateAuthField("password");
  if (!isLogin) {
    validateAuthField("first-name");
    validateAuthField("last-name");
  }

  const email = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-password").value;
  const first_name = document.getElementById("auth-first-name")?.value || "";
  const last_name = document.getElementById("auth-last-name")?.value || "";

  let hasErr = false;
  ["email", "password"].forEach((f) => {
    if (document.getElementById(f + "-error").textContent) {
      shakeField("auth-" + f);
      hasErr = true;
    }
  });
  if (!isLogin) {
    if (document.getElementById("first-name-error").textContent) {
      shakeField("auth-first-name");
      hasErr = true;
    }
    if (document.getElementById("last-name-error").textContent) {
      shakeField("auth-last-name");
      hasErr = true;
    }
  }
  if (hasErr) return;

  setBtnLoading(btn, true, originalText); // Applied setBtnLoading

  if (!navigator.onLine) {
    showToast(
      "Your not connected! Please connect to the internet and try again",
      "offline",
    );
    setBtnLoading(btn, false, originalText); // Applied setBtnLoading
    return;
  }

  const endpoint = isLogin ? apiBase + "login.php" : apiBase + "register.php";
  const payload = isLogin
    ? { email, password }
    : { first_name, last_name, email, password };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      if (isLogin) {
        currentUser = result.user;
        currentRole = result.user.role;
        localStorage.setItem("role", currentRole);
        localStorage.setItem("user", JSON.stringify(currentUser));
        // Redirect to the correct dashboard page
        if (currentRole === "admin") {
          window.location.href = base + "admin/admin_dashboard.php";
        } else {
          window.location.href = base + "users/user_dashboard.php";
        }
        return;
      } else {
        showToast(t("userAdded"));
        switchAuthTab(true);
      }
    } else {
      showToast(result.message, "danger");
      if (result.message.toLowerCase().includes("email"))
        shakeField("auth-email");
      if (result.message.toLowerCase().includes("password"))
        shakeField("auth-password");
    }
  } catch (err) {
    showToast("Server error. Please try again.", "danger");
  } finally {
    setBtnLoading(btn, false, originalText); // Applied setBtnLoading
  }
}

function shakeField(id) {
  const el = document.getElementById(id);
  el.classList.remove("animate-shake");
  void el.offsetWidth; // reflow
  el.classList.add("animate-shake");
  // Haptic feedback
  if ("vibrate" in navigator) navigator.vibrate(200);
}

function togglePasswordVisibility(inputId, btn) {
  const inp = document.getElementById(inputId);
  const isPassword = inp.type === "password";
  inp.type = isPassword ? "text" : "password";
  // swap icon
  const icon = btn.querySelector("i");
  icon.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
  lucide.createIcons();
}

async function performLogout(reason = null) {
  try {
    await fetch(apiBase + "logout.php");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    currentRole = null;
    currentUser = null;
    // Redirect to login page (root)
    let url = base + "index.php";
    if (reason) url += "?" + reason + "=1";
    window.location.href = url;
  } catch (err) {
    showToast("Logout failed. Please try again.", "danger");
  }
}

function logout() {
  showToast(
    "Are you sure you want to logout?",
    "confirm",
    "Logout",
    performLogout,
    false,
    "Cancel",
  );
}

// ============ TOAST ============
function showToast(
  msg,
  type = "success",
  actionText = "Got It",
  onAction = null,
  autoDismiss = true,
  cancelText = null,
  onCancel = null,
) {
  // Haptic feedback for errors/important alerts
  if (
    ["danger", "warning", "offline"].includes(type) &&
    "vibrate" in navigator
  ) {
    navigator.vibrate([100, 50, 100]);
  }
  const container = document.getElementById("toast-container");
  container.innerHTML = "";

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let animationSrc = `${assetBase}Success.json`;
  if (type === "danger" || type === "warning")
    animationSrc = `${assetBase}Failed.json`;
  else if (type === "confirm") animationSrc = `${assetBase}Check Mark !.json`;
  else if (type === "offline")
    animationSrc = `${assetBase}No internet connection.json`;

  const encodedSrc = encodeURI(animationSrc);

  let footerHTML = `<button class="toast-action-btn">${actionText}</button>`;
  if (cancelText) {
    footerHTML = `
      <button class="toast-cancel-btn">${cancelText}</button>
      <button class="toast-action-btn">${actionText}</button>
    `;
  }

  toast.innerHTML = `
    <div class="toast-lottie-container">
      <lottie-player src="${encodedSrc}" background="transparent" speed="1" style="width: 80px; height: 80px;" autoplay></lottie-player>
    </div>
    <div class="toast-body">
      ${msg}
    </div>
    <div class="toast-footer">
      ${footerHTML}
    </div>
  `;
  container.appendChild(toast);
  container.classList.add("active");

  const dismiss = () => {
    toast.style.transform = "translateY(100%)";
    setTimeout(() => {
      toast.remove();
      if (container.querySelectorAll(".toast").length === 0) {
        container.classList.remove("active");
      }
    }, 400);
  };

  container.onclick = (e) => {
    if (e.target === container) {
      dismiss();
    }
  };

  const actionBtn = toast.querySelector(".toast-action-btn");
  if (actionBtn) {
    actionBtn.onclick = () => {
      if (onAction) onAction();
      dismiss();
    };
  }

  const cancelBtn = toast.querySelector(".toast-cancel-btn");
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      if (onCancel) onCancel();
      dismiss();
    };
  }

  if (autoDismiss) {
    setTimeout(dismiss, 5000);
  }
}

// ============ MODAL ============
function openModal(html, extraClass = "") {
  const overlay = document.getElementById("modal-overlay");
  overlay.className = "modal-overlay " + extraClass;
  document.getElementById("modal-body").innerHTML = html;
  overlay.classList.remove("hidden");
  lucide.createIcons();
}
function closeModal(e) {
  const overlay = document.getElementById("modal-overlay");
  if (e && e.target !== overlay) return;
  overlay.classList.add("hidden");
  overlay.className = "modal-overlay hidden";
}
function forceCloseModal() {
  const overlay = document.getElementById("modal-overlay");
  overlay.classList.add("hidden");
  overlay.className = "modal-overlay hidden";
}

// ============ USER DASHBOARD ============
function switchUserTab(tab) {
  userActiveTab = tab;
  document.querySelectorAll("#user-dashboard .nav-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tab);
  });
  updateUserNavLabels();

  const content = document.getElementById("user-content");
  if (!content) return;

  // Manage persistent tab wrappers
  let wrappers = content.querySelectorAll(".tab-wrapper");
  if (wrappers.length === 0) {
    content.innerHTML = `
      <div id="wrapper-user-home" class="tab-wrapper hidden"></div>
      <div id="wrapper-user-reports" class="tab-wrapper hidden"></div>
      <div id="wrapper-user-profile" class="tab-wrapper hidden"></div>
    `;
    wrappers = content.querySelectorAll(".tab-wrapper");
  }

  const activeWrapperId = `wrapper-user-${tab}`;
  wrappers.forEach((w) => {
    if (w.id === activeWrapperId) {
      w.classList.remove("hidden");
      if (!w.innerHTML.trim()) {
        const tmplId =
          tab === "home"
            ? "tmpl-user-home"
            : tab === "reports"
              ? "tmpl-user-reports"
              : "tmpl-user-profile";
        w.innerHTML = loadTemplate(tmplId);
        applyTranslations(w);

        if (tab === "home") {
          populateUserHome(w);
          initUserMap();
        } else if (tab === "reports") populateUserReports(w);
        else if (tab === "profile") populateProfile(w, false);
      } else {
        // Just refresh data and re-apply translations to the active tab
        applyTranslations(w);
        if (tab === "home") {
          updateUserHomeUI();
          if (userMap) {
            setTimeout(() => userMap.invalidateSize(), 50);
          } else {
            initUserMap();
          }
        } else if (tab === "reports") updateUserReportsUI();
        else if (tab === "profile") {
          populateProfile(w, false);
        }
      }
    } else {
      w.classList.add("hidden");
    }
  });

  lucide.createIcons();
}

function updateUserNavLabels() {
  const navBtns = document.querySelectorAll("#user-dashboard .nav-btn");
  const labels = [t("home"), t("myReports"), t("profile")];
  navBtns.forEach((btn, i) => {
    btn.querySelector("span").textContent = labels[i];
  });
}

function populateUserHome(container) {
  const userReports = getMyReports();
  const total = userReports.length;
  const pending = userReports.filter((r) => r.status === "Pending").length;
  const resolved = userReports.filter((r) => r.status === "Resolved").length;

  const nameEl = container.querySelector('[data-bind="user-name"]');
  if (nameEl) nameEl.textContent = currentUser?.name || "Citizen";

  const statsValues = {
    "total-reports": total,
    "pending-reports": pending,
    "resolved-reports": resolved,
  };

  Object.entries(statsValues).forEach(([key, val]) => {
    const el = container.querySelector(`[data-bind="${key}"]`);
    if (el) el.textContent = val;
  });

  // Map pins (visual only for Home template)
  const pinContainer = container.querySelector("#map-pins-container");
  if (pinContainer) {
    pinContainer.innerHTML = reports
      .map((r, i) => {
        const x = 12 + ((i * 37 + 13) % 72);
        const y = 18 + ((i * 29 + 7) % 58);
        const color =
          r.status === "Pending"
            ? "var(--eco-pending)"
            : r.status === "In Progress"
              ? "var(--eco-warning)"
              : "var(--eco-success)";
        return `<button class="map-pin" style="left:${x}%;top:${y}%" onclick="showMapPopup(${r.id})"><i data-lucide="map-pin" style="color:${color};fill:${color}"></i></button>`;
      })
      .join("");
  }
}

let userMap = null;
let userMarker = null;
let mapMarkers = new Map();

function initUserMap() {
  const container = document.getElementById("real-map-container");
  if (!container) return;

  if (userMap) {
    userMap.invalidateSize();
    syncMapMarkers(reports);
    return;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setupLeaflet(container, lat, lng);
      },
      () => {
        setupLeaflet(container, -6.7924, 39.2083);
        showToast("Location denied. Defaulting to Dar es Salaam.", "warning");
      },
    );
  } else {
    setupLeaflet(container, -6.7924, 39.2083);
  }
}

function setupLeaflet(container, lat, lng) {
  if (userMap) {
    userMap.remove();
    userMap = null;
  }
  userMap = L.map(container, {
    zoomControl: true,
    tap: false,
  }).setView([lat, lng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© EcoTaarifa",
  }).addTo(userMap);

  const RecenterControl = L.Control.extend({
    options: { position: "topleft" },
    onAdd: function () {
      const btn = L.DomUtil.create("button", "map-control-btn");
      btn.innerHTML =
        '<i data-lucide="crosshair" style="width:16px;height:16px;"></i>';
      btn.title = "Recenter";
      btn.onclick = () => {
        userMap.setView([lat, lng], 15);
        lucide.createIcons();
      };
      return btn;
    },
  });
  userMap.addControl(new RecenterControl());
  lucide.createIcons();

  const userIcon = L.divIcon({
    className: "user-location-marker",
    html: '<div class="pulse-ring"></div><div class="user-dot"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
  userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(userMap);
  userMarker.bindPopup("<b>Your Location</b>").openPopup();

  syncMapMarkers(reports);

  userMap.on("click", (e) => {
    const { lat: cLat, lng: cLng } = e.latlng;
    const locStr = `${cLat.toFixed(5)}, ${cLng.toFixed(5)}`;

    if (pendingReportData) {
      pendingReportData.location = locStr;
      openNewReportModal(pendingReportData);
      pendingReportData = null;
    } else {
      openNewReportModal({ location: locStr });
    }
  });
}

function syncMapMarkers(reportList) {
  if (!userMap) return;
  const currentIds = new Set();
  reportList.forEach((r) => {
    if (!r.location || !r.location.includes(",")) return;
    const [rLat, rLng] = r.location.split(",").map((c) => parseFloat(c.trim()));
    if (isNaN(rLat) || isNaN(rLng)) return;

    const id = String(r.id);
    currentIds.add(id);
    const color =
      r.status === "Pending"
        ? "#3b82f6"
        : r.status === "In Progress"
          ? "#f59e0b"
          : "#10b981";

    if (mapMarkers.has(id)) {
      mapMarkers.get(id).setStyle({ fillColor: color });
    } else {
      const m = L.circleMarker([rLat, rLng], {
        radius: 8,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(userMap);
      m.on("click", () => showMapPopup(r.id));
      mapMarkers.set(id, m);
    }
  });

  mapMarkers.forEach((m, id) => {
    if (!currentIds.has(id)) {
      userMap.removeLayer(m);
      mapMarkers.delete(id);
    }
  });
}

function updateUserHomeUI() {
  const userReports = getMyReports();
  const total = userReports.length;
  const pending = userReports.filter((r) => r.status === "Pending").length;
  const resolved = userReports.filter((r) => r.status === "Resolved").length;

  const statsValues = {
    "total-reports": total,
    "pending-reports": pending,
    "resolved-reports": resolved,
  };

  Object.entries(statsValues).forEach(([key, val]) => {
    const el = document.querySelector(`[data-bind="${key}"]`);
    if (el && el.textContent !== String(val)) el.textContent = val;
  });

  if (userMap) syncMapMarkers(reports);
}

function showMapPopup(id) {
  const r = reports.find((x) => x.id === id);
  if (!r) return;
  const statusClass =
    r.status === "Pending"
      ? "status-pending"
      : r.status === "In Progress"
        ? "status-inprogress"
        : "status-resolved";
  document.getElementById("map-popup").innerHTML = `
    <div class="map-popup">
      <button class="map-popup-close" onclick="document.getElementById('map-popup').innerHTML=''"><i data-lucide="x"></i></button>
      <span style="font-size:0.75rem;font-weight:600;color:var(--primary)">${t(r.category)}</span>
      <p class="report-title-text" style="font-size:0.875rem;font-weight:500;color:var(--foreground);margin-top:2px">${r.title}</p>
      <div style="display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap">
        <span style="font-size:11px;color:var(--muted-foreground)">${r.location}</span>
        <span class="status-badge ${statusClass}">${r.status}</span>
      </div>
      <span style="font-size:10px;color:var(--muted-foreground)">${r.date}</span>
    </div>
  `;
  lucide.createIcons();
}

function getMyReports() {
  if (!currentUser) return [];
  // Use historyReports for persistent user view
  return historyReports;
}

function populateUserReports(container) {
  // Build filter tabs
  const filterContainer = container.querySelector("#user-filter-tabs");
  if (filterContainer) {
    filterContainer.innerHTML = buildFilterTabs(
      userReportFilter,
      "refilterUserReports",
    );
  }

  // Set search value
  const searchInput = container.querySelector(".search-wrapper input");
  if (searchInput) searchInput.value = userReportSearchVal;

  // Populate report list
  updateUserReportsList(container);
}

function buildFilterTabs(activeFilter, callbackName) {
  return ["All", "Pending", "In Progress", "Resolved"]
    .map((f) => {
      const label =
        f === "All"
          ? t("all")
          : f === "Pending"
            ? t("pending")
            : f === "In Progress"
              ? t("inProgress")
              : t("resolved");
      return `<button class="filter-tab ${f === activeFilter ? "active" : ""}" onclick="${callbackName}('${f}')">${label}</button>`;
    })
    .join("");
}

function updateUserReportsList(container) {
  const list = container
    ? container.querySelector("#user-reports-list")
    : document.getElementById("user-reports-list");
  if (!list) return;

  const myReports = getMyReports();
  const filtered = myReports
    .filter((r) => userReportFilter === "All" || r.status === userReportFilter)
    .filter((r) => {
      if (!userReportSearchVal) return true;
      const s = userReportSearchVal.toLowerCase();
      return (
        r.title.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s) ||
        r.location.toLowerCase().includes(s) ||
        r.category.toLowerCase().includes(s)
      );
    });

  if (filtered.length === 0) {
    list.innerHTML = `<p class="empty-state-text">${t("noReports")}</p>`;
  } else {
    surgicalListUpdate(list, filtered, (r, i, animate) =>
      renderReportCard(r, i, animate),
    );
  }
  lucide.createIcons();
}

function renderReportCard(r, i, animate = true) {
  const sc =
    r.status === "Pending"
      ? "status-pending"
      : r.status === "In Progress"
        ? "status-inprogress"
        : "status-resolved";
  const style = animate ? `style="animation-delay:${i * 0.06}s"` : "";
  return `<div class="card report-card" data-id="${r.id}" ${style} onclick="viewReportDetails(${r.id})">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div><span class="report-category">${t(r.category)}</span><p class="report-title report-title-text">${r.title}</p></div>
          <span class="status-badge ${sc}">${r.status}</span>
        </div>
        <p class="report-desc">${r.description}</p>
        <div class="report-meta"><i data-lucide="map-pin"></i><span>${r.location}</span><span style="margin-left:auto">${r.date}</span></div>
      </div>`;
}

function updateUserReportsUI() {
  updateUserReportsList(null);
}

function refilterUserReports(f) {
  userReportFilter = f;
  switchUserTab("reports");
}

function refilterUserReportsSearch(val) {
  userReportSearchVal = val;
  // Only update the list, preserving search input focus
  updateUserReportsList(null);
}

function isSmallScreen() {
  return window.innerWidth < 480;
}

let pendingReportData = null; // Store form state during map selection

function openNewReportModal(initial = null) {
  const catOptions = categories
    .map((c) => {
      const selected = initial && initial.category === c ? "selected" : "";
      return `<option value="${c}" ${selected}>${t(c)}</option>`;
    })
    .join("");

  const titleVal = initial ? initial.title : "";
  const descVal = initial ? initial.description : "";
  const locVal = initial ? initial.location : "";

  openModal(`
    <div class="modal-header">
      <h3>${t("newReport")}</h3>
      <button class="modal-close" onclick="forceCloseModal()"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-form">
      <div>
        <label>${t("reportTitle")}</label>
        <input id="mr-title" placeholder="${t("titlePlaceholder")}" value="${titleVal}" autocomplete="off" />
        <p class="error-text" id="mr-title-err"></p>
      </div>
      <div>
        <label>${t("category")}</label>
        <select id="mr-category"><option value="">${t("selectCategory")}</option>${catOptions}</select>
        <p class="error-text" id="mr-category-err"></p>
      </div>
      <div>
        <label>${t("description")}</label>
        <textarea id="mr-desc" rows="4" placeholder="${t("descriptionPlaceholder")}" autocomplete="off">${descVal}</textarea>
        <p class="error-text" id="mr-desc-err"></p>
      </div>
      <div>
        <label>${t("location")}</label>
        <div class="location-row">
          <input id="mr-location" placeholder="${t("enterLocation")}" value="${locVal}" autocomplete="off" />
          <button class="btn-gps" onclick="getGPS()"><i data-lucide="map-pin"></i> ${t("gps")}</button>
        </div>
        <p class="error-text" id="mr-location-err"></p>
      </div>
      <button class="btn-save" onclick="submitNewReport()" style="display:flex;align-items:center;justify-content:center;gap:8px">
        <i data-lucide="send" style="width:16px;height:16px"></i> ${t("sendReport")}
      </button>
    </div>
  `);
}

function getGPS() {
  const title = document.getElementById("mr-title").value;
  const category = document.getElementById("mr-category").value;
  const description = document.getElementById("mr-desc").value;

  pendingReportData = { title, category, description };

  forceCloseModal();
  switchUserTab("home");
  showToast(t("tapToReport") || "Select location on map", "primary");
}

async function submitNewReport() {
  const title = document.getElementById("mr-title").value.trim();
  const category = document.getElementById("mr-category").value;
  const desc = document.getElementById("mr-desc").value.trim();
  const loc = document.getElementById("mr-location").value.trim();
  const btn = document.querySelector(".modal-form .btn-save");
  const originalText = btn ? btn.innerHTML : "";
  let valid = true;

  [
    ["mr-title", title, "mr-title-err"],
    ["mr-category", category, "mr-category-err"],
    ["mr-desc", desc, "mr-desc-err"],
    ["mr-location", loc, "mr-location-err"],
  ].forEach(([id, val, errId]) => {
    const errEl = document.getElementById(errId);
    if (!val) {
      errEl.textContent = t("nameRequired");
      document.getElementById(id).classList.add("input-error");
      valid = false;
    } else {
      errEl.textContent = "";
      document.getElementById(id).classList.remove("input-error");
    }
  });

  if (!valid) return;

  setBtnLoading(btn, true, originalText);
  try {
    const response = await fetch(apiBase + "create_report.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category,
        description: desc,
        location: loc,
        reporter: currentUser.name,
        reporterEmail: currentUser.email,
      }),
    });
    const result = await response.json();
    if (result.success) {
      forceCloseModal();
      showToast(t("reportSubmitted"));
      await fetchReports();
      switchUserTab("reports");
    } else {
      showToast("Error: " + result.message, "danger");
    }
  } catch (err) {
    showToast("Server error occurred.", "danger");
  } finally {
    setBtnLoading(btn, false, originalText);
  }
}

// ============ ADMIN DASHBOARD ============
function switchAdminTab(tab) {
  adminActiveTab = tab;
  document.querySelectorAll("#admin-dashboard .nav-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tab);
  });
  updateAdminNavLabels();

  const content = document.getElementById("admin-content");
  if (!content) return;

  // Manage persistent tab wrappers
  let wrappers = content.querySelectorAll(".tab-wrapper");
  if (wrappers.length === 0) {
    content.innerHTML = `
      <div id="wrapper-admin-home" class="tab-wrapper hidden"></div>
      <div id="wrapper-admin-reports" class="tab-wrapper hidden"></div>
      <div id="wrapper-admin-users" class="tab-wrapper hidden"></div>
      <div id="wrapper-admin-profile" class="tab-wrapper hidden"></div>
    `;
    wrappers = content.querySelectorAll(".tab-wrapper");
  }

  const activeWrapperId = `wrapper-admin-${tab}`;
  wrappers.forEach((w) => {
    if (w.id === activeWrapperId) {
      w.classList.remove("hidden");
      if (!w.innerHTML.trim()) {
        const tmplId =
          tab === "reports"
            ? "tmpl-admin-reports"
            : tab === "users"
              ? "tmpl-admin-users"
              : tab === "profile"
                ? "tmpl-admin-profile"
                : "tmpl-admin-home";
        w.innerHTML = loadTemplate(tmplId);
        applyTranslations(w);

        if (tab === "home") populateAdminHome(w);
        else if (tab === "reports") populateAdminReports(w);
        else if (tab === "users") {
          populateAdminUsers(w);
          fetchUsers();
        } else if (tab === "profile") populateProfile(w, true);
      } else {
        applyTranslations(w);
        if (tab === "home") updateAdminHomeUI();
        else if (tab === "reports") updateAdminReportsUI();
        else if (tab === "users") updateAdminUsersUI();
        else if (tab === "profile") populateProfile(w, true);
      }
    } else {
      w.classList.add("hidden");
    }
  });

  lucide.createIcons();
}

async function fetchStats() {
  if (currentUser && currentRole === "admin") {
    try {
      const response = await fetch(apiBase + "get_stats.php");
      const result = await response.json();
      if (result.success) {
        adminStats = result.data;
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  } else if (currentUser) {
    // Calculate user stats from history state
    adminStats = {
      totalReports: historyReports.length,
      pendingReports: historyReports.filter((r) => r.status === "Pending")
        .length,
      inProgressReports: historyReports.filter(
        (r) => r.status === "In Progress",
      ).length,
      resolvedReports: historyReports.filter((r) => r.status === "Resolved")
        .length,
      totalUsers: 0,
    };
  }
}

function updateAdminNavLabels() {
  const navBtns = document.querySelectorAll("#admin-dashboard .nav-btn");
  const labels = [t("home"), t("reports"), t("users"), t("profile")];
  navBtns.forEach((btn, i) => {
    btn.querySelector("span").textContent = labels[i];
  });
}

function populateAdminHome(container) {
  updateAdminStats(container);

  // Fill pending list
  const pendingList = container.querySelector("#admin-pending-list");
  if (pendingList) {
    const pendingReports = reports
      .filter((r) => r.status === "Pending")
      .sort((a, b) => b.date.localeCompare(a.date));

    surgicalListUpdate(pendingList, pendingReports, (r, i, animate) =>
      renderPendingReportItem(r, i, animate),
    );
  }
}

function updateAdminStats(container = document) {
  const bindings = {
    totalReports: adminStats.totalReports,
    totalUsers: adminStats.totalUsers,
    pendingReports: adminStats.pendingReports,
    inProgressReports: adminStats.inProgressReports,
    resolvedReports: adminStats.resolvedReports,
  };
  Object.entries(bindings).forEach(([key, val]) => {
    const el = container.querySelector(`[data-bind="${key}"]`);
    if (el && el.textContent !== String(val)) el.textContent = val;
  });
}

function renderPendingReportItem(r, i, animate = true) {
  const style = animate
    ? `style="animation: fadeIn 0.3s ease-out both; animation-delay:${i * 0.05}s"`
    : "";
  return `<div class="pending-item" data-id="${r.id}" ${style}>
      <div class="dot dot-pending"></div>
      <div class="pending-info"><p class="pending-title report-title-text">${r.title}</p><p class="pending-meta">${r.reporter} · ${r.location}</p></div>
      <span class="pending-date">${r.date}</span>
    </div>`;
}

function updateAdminHomeUI() {
  const content = document.getElementById("admin-content");
  if (adminActiveTab === "home" && content) {
    populateAdminHome(content);
    lucide.createIcons();
  }
}

function populateAdminReports(container) {
  // Build filter tabs
  const filterContainer = container.querySelector("#admin-filter-tabs");
  if (filterContainer) {
    filterContainer.innerHTML = buildFilterTabs(
      adminReportFilter,
      "refilterAdminReports",
    );
  }

  // Set search value
  const searchInput = container.querySelector(".search-wrapper input");
  if (searchInput) searchInput.value = adminSearchVal;

  // Populate table body
  updateAdminReportsTbody();
}

function renderAdminReportRow(r, i, animate = true) {
  const sc =
    r.status === "Pending"
      ? "status-pending"
      : r.status === "In Progress"
        ? "status-inprogress"
        : "status-resolved";
  const initials = getInitials(r.reporter);
  let actions = `<button class="action-btn action-btn-view" title="${t("view")}" onclick="viewReportDetails(${r.id})"><i data-lucide="eye"></i></button>`;
  if (r.status === "Pending")
    actions += `<button class="action-btn action-btn-warning" title="${t("approve")}" onclick="updateReportStatus(${r.id},'In Progress')"><i data-lucide="play-circle"></i></button>`;
  if (r.status !== "Resolved")
    actions += `<button class="action-btn action-btn-success" title="${t("resolve")}" onclick="updateReportStatus(${r.id},'Resolved')"><i data-lucide="check-circle-2"></i></button>`;
  actions += `<button class="action-btn action-btn-danger" title="${t("delete")}" onclick="deleteReport(${r.id})"><i data-lucide="trash-2"></i></button>`;

  const style = animate
    ? `style="animation: fadeIn 0.3s ease-out both; animation-delay:${i * 0.03}s"`
    : "";
  return `<tr data-id="${r.id}" ${style}>
    <td class="report-title-col"><div class="report-title-text">${r.title}</div><span class="status-badge ${sc}">${r.status}</span></td>
    <td class="report-reporter-col"><div class="reporter-cell"><div class="reporter-avatar">${initials}</div><div class="report-reporter-name">${r.reporter}</div></div></td>
    <td class="report-actions-col"><div class="actions-row actions-row-inline">${actions}</div></td>
  </tr>`;
}

function updateAdminReportsTbody() {
  const tbody = document.getElementById("admin-reports-tbody");
  if (!tbody) return;

  const searchInput = document.querySelector(".search-wrapper input");
  const searchVal = searchInput ? searchInput.value : "";

  const filtered = reports
    .filter(
      (r) => adminReportFilter === "All" || r.status === adminReportFilter,
    )
    .filter((r) => {
      if (!searchVal) return true;
      const s = searchVal.toLowerCase();
      return (
        r.title.toLowerCase().includes(s) ||
        r.reporter.toLowerCase().includes(s) ||
        r.location.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s) ||
        r.id.toString().includes(s)
      );
    });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="empty-state-text">${t("noReports")}</td></tr>`;
  } else {
    surgicalListUpdate(tbody, filtered, (r, i, animate) =>
      renderAdminReportRow(r, i, animate),
    );
  }
  lucide.createIcons();
}

function updateAdminReportsUI() {
  updateAdminReportsTbody();
}

function viewReportDetails(id) {
  const r =
    reports.find((rep) => rep.id === id) ||
    historyReports.find((rep) => rep.id === id);
  if (!r) return;

  const contentHTML = `
    <div class="modal-header">
      <h3 style="display:flex; align-items:center; gap:8px;">
        <i data-lucide="file-text" style="color:var(--primary); width:20px;"></i>
        ${t("reportDetails")}
      </h3>
      <button class="modal-close" onclick="forceCloseModal()"><i data-lucide="x"></i></button>
    </div>
    <div class="detail-item">
      <div class="detail-label">${t("title")}</div>
      <div class="detail-value report-title-text" style="font-size: 1.125rem; font-weight: 700; color: #0f172a;">${r.title}</div>
    </div>
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div class="detail-item">
        <div class="detail-label">${t("reporter")}</div>
        <div class="reporter-cell">
          <div class="reporter-avatar" style="width:24px; height:24px; font-size:0.6rem;">${getInitials(r.reporter)}</div>
          <div class="detail-value">${r.reporter}</div>
        </div>
      </div>
      <div class="detail-item">
        <div class="detail-label">${t("date")}</div>
        <div class="detail-value" style="display:flex; align-items:center; gap:6px;">
          <i data-lucide="calendar" style="width:14px; color:#64748b;"></i>
          ${r.date}
        </div>
      </div>
    </div>
    <div class="detail-item">
      <div class="detail-label">${t("location")}</div>
      <div class="detail-value" style="display:flex; align-items:flex-start; gap:6px;">
        <i data-lucide="map-pin" style="width:14px; color:#64748b; margin-top:3px;"></i>
        ${r.location}
      </div>
    </div>
    <div class="detail-item">
      <div class="detail-label">${t("category")}</div>
      <div class="detail-value">${t(r.category)}</div>
    </div>
    <div class="detail-item">
      <div class="detail-label">${t("description")}</div>
      <div class="detail-value" style="background: #f8fafc; padding: 12px; border-radius: 0.75rem; border: 1px solid #f1f5f9;">
        ${r.description}
      </div>
    </div>
    <div class="detail-item" style="margin-bottom:0;">
      <div class="detail-label">${t("status")}</div>
      <div style="margin-top:4px;">
        <span class="status-badge ${r.status === "Pending" ? "status-pending" : r.status === "In Progress" ? "status-inprogress" : "status-resolved"}">
          ${r.status}
        </span>
      </div>
    </div>
  `;
  openModal(contentHTML, "report-details-modal");
}

let adminSearchVal = "";
function refilterAdminReports(filter) {
  adminReportFilter = filter;
  const content = document.getElementById("admin-content");
  if (content) populateAdminReports(content);
}

function refilterAdminReportsSearch(val) {
  adminSearchVal = val;
  updateAdminReportsTbody();
}

async function updateReportStatus(id, status) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const btns = row ? row.querySelectorAll(".action-btn") : [];
  const originalBtnHtml = Array.from(btns).map((b) => b.innerHTML); // Store original HTML

  btns.forEach((b, i) => setBtnLoading(b, true, originalBtnHtml[i])); // Applied setBtnLoading

  try {
    const response = await fetch(apiBase + "update_report_status.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const result = await response.json();
    if (result.success) {
      showToast(`${t("status")}: ${status}`);
      await fetchReports();
      switchAdminTab("reports");
    } else {
      showToast(result.message, "danger");
    }
  } catch (err) {
    showToast("Failed to update status.", "danger");
  } finally {
    btns.forEach((b, i) => setBtnLoading(b, false, originalBtnHtml[i])); // Applied setBtnLoading
  }
}

async function performDeleteReport(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const btns = row ? row.querySelectorAll(".action-btn") : [];
  const originalBtnHtml = Array.from(btns).map((b) => b.innerHTML); // Store original HTML

  btns.forEach((b, i) => setBtnLoading(b, true, originalBtnHtml[i])); // Applied setBtnLoading

  try {
    const response = await fetch(apiBase + "delete_report.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await response.json();
    if (result.success) {
      showToast("Deleted successful");
      await fetchReports();
      switchAdminTab("reports");
    } else {
      showToast(result.message, "danger");
    }
  } catch (err) {
    showToast("Failed to delete report.", "danger");
  } finally {
    btns.forEach((b, i) => setBtnLoading(b, false, originalBtnHtml[i])); // Applied setBtnLoading
  }
}

function deleteReport(id) {
  showToast(
    t("confirmDelete"),
    "confirm",
    t("delete"),
    () => performDeleteReport(id),
    false,
    t("cancel"),
  );
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    btn.innerHTML = '<i data-lucide="eye-off"></i>';
  } else {
    input.type = "password";
    btn.innerHTML = '<i data-lucide="eye"></i>';
  }
  lucide.createIcons();
}

// ============ USER FETCHING ============
async function fetchUsers() {
  try {
    const res = await fetch(apiBase + "get_users.php");
    const data = await res.json();
    if (data.success) {
      // Backend uses first_name/last_name, but frontend might expect 'name' for some shared components
      users = data.data.map((u) => ({
        ...u,
        name: `${u.first_name} ${u.last_name}`,
      }));
      // Surgical update is handled by the polling loop
    }
  } catch (e) {
    console.error("Error fetching users:", e);
  }
}

// ============ ADMIN USERS ============
let adminUserSearch = "";

function populateAdminUsers(container) {
  adminUserSearch = "";
  const searchInput = container.querySelector(".search-wrapper input");
  if (searchInput) searchInput.value = adminUserSearch;

  updateAdminUsersTable();
}

function renderAdminUserRow(u, i, animate = true) {
  const initials = getInitials(`${u.first_name || ""} ${u.last_name || ""}`);
  const style = animate
    ? `style="animation: fadeIn 0.3s ease-out both; animation-delay:${i * 0.03}s"`
    : "";
  return `
    <tr data-id="${u.id}" ${style}>
      <td>
        <div class="reporter-cell">
          <div class="reporter-avatar">${initials}</div>
          <div style="font-weight: 500;">${u.first_name} ${u.last_name}</div>
        </div>
      </td>
      <td>${u.email}</td>
      <td>
        <span class="status-badge ${u.role === "admin" ? "status-resolved" : "status-inprogress"}">
          ${u.role}
        </span>
      </td>
      <td style="text-align: right;">
        <div class="actions-row actions-row-inline">
          <button class="action-btn action-btn-view" title="${t("edit")}" onclick="openEditUserModal(${u.id})"><i data-lucide="edit-3"></i></button>
          <button class="action-btn action-btn-danger" title="${t("delete")}" onclick="deleteUser(${u.id})"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    </tr>
  `;
}

function updateAdminUsersTable() {
  const tbody = document.getElementById("admin-users-tbody");
  if (!tbody) return;

  const filtered = users.filter((u) => {
    if (!adminUserSearch) return true;
    const s = adminUserSearch.toLowerCase();
    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
    return (
      fullName.includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.role.toLowerCase().includes(s)
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state-text">${t("noUsers")}</td></tr>`;
  } else {
    surgicalListUpdate(tbody, filtered, (u, i, animate) =>
      renderAdminUserRow(u, i, animate),
    );
  }
  lucide.createIcons();
}

function updateAdminUsersUI() {
  updateAdminUsersTable();
}

function refreshAdminUsers(val) {
  adminUserSearch = val;
  updateAdminUsersTable();
}

// ============ USER MODAL & ACTIONS ============
function openAddUserModal() {
  const content = `
    <div class="modal-header">
      <h3><i data-lucide="user-plus" style="color:var(--primary)"></i>${t("addUser")}</h3>
      <button class="modal-close" onclick="forceCloseModal()"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-form">
      <div class="form-row">
        <div><label>${t("first_name")}</label><input id="mu-fname" placeholder="" autocomplete="off" /><p class="error-text" id="mu-fname-err"></p></div>
        <div><label>${t("last_name")}</label><input id="mu-lname" placeholder="" autocomplete="off" /><p class="error-text" id="mu-lname-err"></p></div>
      </div>
      <div><label>${t("email")}</label><input type="email" id="mu-email" placeholder="" autocomplete="off" /><p class="error-text" id="mu-email-err"></p></div>
      <div><label>${t("role")}</label><select id="mu-role"><option value="user">${t("user")}</option><option value="admin">${t("admin")}</option></select></div>
      <div class="password-field-wrapper">
        <label>${t("password")}</label>
        <div class="input-with-icon">
          <input type="password" id="mu-password" autocomplete="new-password" />
          <button class="password-toggle" type="button" onclick="togglePasswordVisibility('mu-password', this)"><i data-lucide="eye"></i></button>
        </div>
        <p class="error-text" id="mu-password-err"></p>
      </div>
      <div class="btn-row"><button class="btn-cancel" onclick="forceCloseModal()">${t("cancel")}</button><button class="btn-save" onclick="saveUser(false)">${t("save")}</button></div>
    </div>
  `;
  openModal(content, "user-modal");
}

function openEditUserModal(id) {
  const u = users.find((x) => x.id === id);
  if (!u) return;
  openModal(`
    <div class="modal-header"><h3>${t("edit")}</h3><button class="modal-close" onclick="forceCloseModal()"><i data-lucide="x"></i></button></div>
    <div class="modal-form">
      <input type="hidden" id="mu-edit-id" value="${u.id}" />
      <div class="form-row">
        <div><label>${t("first_name")}</label><input id="mu-fname" value="${u.first_name || ""}" /><p class="error-text" id="mu-fname-err"></p></div>
        <div><label>${t("last_name")}</label><input id="mu-lname" value="${u.last_name || ""}" /><p class="error-text" id="mu-lname-err"></p></div>
      </div>
      <div><label>${t("email")}</label><input type="email" id="mu-email" value="${u.email}" /><p class="error-text" id="mu-email-err"></p></div>
      <div><label>${t("role")}</label><select id="mu-role"><option value="user" ${u.role === "user" ? "selected" : ""}>${t("user")}</option><option value="admin" ${u.role === "admin" ? "selected" : ""}>${t("admin")}</option></select></div>
      <div class="password-field-wrapper">
        <label>${t("password")} <small style="font-weight:400;opacity:0.7">(${t("leaveBlankKeepCurrent") || "leave blank to keep current"})</small></label>
        <div class="input-with-icon">
          <input type="password" id="mu-password" autocomplete="new-password" />
          <button class="password-toggle" type="button" onclick="togglePasswordVisibility('mu-password', this)"><i data-lucide="eye"></i></button>
        </div>
        <p class="error-text" id="mu-password-err"></p>
      </div>
      <div class="btn-row"><button class="btn-cancel" onclick="forceCloseModal()">${t("cancel")}</button><button class="btn-save" onclick="saveUser(true)">${t("save")}</button></div>
    </div>
  `);
}

async function saveUser(editing = false) {
  const firstName = document.getElementById("mu-fname").value.trim();
  const lastName = document.getElementById("mu-lname").value.trim();
  const email = document.getElementById("mu-email").value.trim();
  const role = document.getElementById("mu-role").value;
  const password = document.getElementById("mu-password").value;
  const btn = document.querySelector(".modal-form .btn-save");
  const originalText = btn ? btn.innerHTML : "";
  let valid = true;

  // Reset errors
  ["mu-fname", "mu-lname", "mu-email", "mu-password"].forEach((id) => {
    const err = document.getElementById(`${id}-err`);
    if (err) err.textContent = "";
    const input = document.getElementById(id);
    if (input) input.classList.remove("input-error");
  });

  if (!firstName) {
    document.getElementById("mu-fname-err").textContent = t("nameRequired");
    document.getElementById("mu-fname").classList.add("input-error");
    valid = false;
  }
  if (!lastName) {
    document.getElementById("mu-lname-err").textContent = t("nameRequired");
    document.getElementById("mu-lname").classList.add("input-error");
    valid = false;
  }
  if (!email.includes("@")) {
    document.getElementById("mu-email-err").textContent = t("emailRequired");
    document.getElementById("mu-email").classList.add("input-error");
    valid = false;
  }

  if (!editing && password.length < 6) {
    document.getElementById("mu-password-err").textContent = t("passwordMin");
    document.getElementById("mu-password").classList.add("input-error");
    valid = false;
  } else if (editing && password && password.length < 6) {
    document.getElementById("mu-password-err").textContent = t("passwordMin");
    document.getElementById("mu-password").classList.add("input-error");
    valid = false;
  }

  if (!valid) return;

  setBtnLoading(btn, true, originalText); // Applied setBtnLoading
  const url = editing
    ? apiBase + "update_user.php"
    : apiBase + "create_user.php";
  const body = {
    first_name: firstName,
    last_name: lastName,
    email,
    role,
    password,
  };
  if (editing) body.id = parseInt(document.getElementById("mu-edit-id").value);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      showToast(editing ? t("userUpdated") : t("adminUserAdded"));
      forceCloseModal();
      fetchUsers();
    } else {
      showToast(data.message, "danger");
    }
  } catch (e) {
    showToast("Server error", "danger");
  } finally {
    setBtnLoading(btn, false, originalText); // Applied setBtnLoading
  }
}

function deleteUser(id) {
  showToast(
    t("confirmDelete") || "Are you sure you want to delete this user?",
    "confirm",
    t("delete"),
    () => performDeleteUser(id),
    false,
    t("cancel"),
  );
}

async function performDeleteUser(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const btns = row ? row.querySelectorAll(".action-btn") : [];
  const originalBtnHtml = Array.from(btns).map((b) => b.innerHTML); // Store original HTML

  btns.forEach((b, i) => setBtnLoading(b, true, originalBtnHtml[i])); // Applied setBtnLoading

  try {
    const res = await fetch(apiBase + "delete_user.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(t("userDeleted") || "Deleted successful");
      fetchUsers();
    } else {
      showToast(data.message, "danger");
    }
  } catch (e) {
    showToast("Server error", "danger");
  } finally {
    btns.forEach((b, i) => setBtnLoading(b, false, originalBtnHtml[i])); // Applied setBtnLoading
  }
}

// ============ PROFILE (shared) ============
function populateProfile(container, isAdmin) {
  const user = currentUser || { name: "User", email: "" };

  // Fill personal info
  const nameInput = container.querySelector('[data-bind="pf-name"]');
  if (nameInput) nameInput.value = user.name;

  const emailInput = container.querySelector('[data-bind="pf-email"]');
  if (emailInput) emailInput.value = user.email;

  // Apply button states (theme/lang)
  applyProfileState(container);
}

async function saveProfileInfo() {
  const name = document.getElementById("pf-name").value.trim();
  const email = document.getElementById("pf-email").value.trim();
  const btn = document.querySelector("#personal-info-card .btn-save");
  const originalText = btn ? btn.innerHTML : "";

  if (!name || !email) {
    showToast(t("fillAllFields") || "Please fill all fields", "danger");
    return;
  }

  setBtnLoading(btn, true, originalText); // Applied setBtnLoading
  try {
    const res = await fetch(apiBase + "update_profile.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    if (data.success) {
      currentUser = { ...currentUser, name, email };
      localStorage.setItem("user", JSON.stringify(currentUser));
      // Update header
      if (document.getElementById(`${currentRole}-dashboard-name`)) {
        document.getElementById(`${currentRole}-dashboard-name`).textContent =
          name;
      }
      showToast(t("profileUpdated"));
    } else {
      showToast(data.message, "danger");
    }
  } catch (e) {
    showToast("Server error", "danger");
  }
}

async function changeProfilePassword() {
  const cur = document.getElementById("pf-curpw").value;
  const newP = document.getElementById("pf-newpw").value;
  const conf = document.getElementById("pf-confpw").value;
  const btn = document.querySelector(".card .btn-eco");
  const originalText = btn ? btn.innerHTML : "";
  let valid = true;

  // Reset errors
  ["pf-curpw", "pf-newpw", "pf-confpw"].forEach((id) => {
    document.getElementById(`${id}-err`).textContent = "";
    document.getElementById(id).classList.remove("input-error");
  });

  if (!cur) {
    document.getElementById("pf-curpw-err").textContent = t("passwordMin");
    document.getElementById("pf-curpw").classList.add("input-error");
    valid = false;
  }

  if (newP.length < 6) {
    document.getElementById("pf-newpw-err").textContent = t("passwordMin");
    document.getElementById("pf-newpw").classList.add("input-error");
    valid = false;
  }

  if (newP !== conf) {
    document.getElementById("pf-confpw-err").textContent =
      t("passwordsNoMatch");
    document.getElementById("pf-confpw").classList.add("input-error");
    valid = false;
  }

  if (!valid) return;

  setBtnLoading(btn, true, originalText);
  try {
    const res = await fetch(apiBase + "update_profile.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: currentUser.name,
        email: currentUser.email,
        current_password: cur,
        new_password: newP,
      }),
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById("pf-curpw").value = "";
      document.getElementById("pf-newpw").value = "";
      document.getElementById("pf-confpw").value = "";
      showToast(t("passwordChanged"));
    } else {
      showToast(data.message, "danger");
    }
  } catch (e) {
    showToast("Server error", "danger");
  } finally {
    setBtnLoading(btn, false, originalText);
  }
}

// ============ THEME ============
function applyTheme(theme) {
  localStorage.setItem("theme", theme);
  if (theme === "dark") document.documentElement.classList.add("dark");
  else if (theme === "light") document.documentElement.classList.remove("dark");
  else {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches)
      document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }
  refreshCurrentView();
}

// ============ REFRESH ============
function refreshCurrentView() {
  applyTranslations(document.body);
  if (currentRole === "admin") switchAdminTab(adminActiveTab);
  else if (currentRole === "user") switchUserTab(userActiveTab);
  // Also re-render auth labels if on auth page
  if (!currentRole) {
    switchAuthTab(isLogin);
  }
}

// ============ PWA EVENTS ============
window.addEventListener("beforeinstallprompt", (e) => {
  // Capture for custom UI and prevent default
  e.preventDefault();
  deferredPrompt = e;
  refreshCurrentView();
});

window.addEventListener("appinstalled", (evt) => {
  deferredPrompt = null;
  refreshCurrentView();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      navigator.standalone;

    if (isStandalone) {
      showToast(
        "A new version of EcoTaarifa is available!",
        "confirm",
        "Update",
        () => {
          localStorage.setItem("pwa_updated", "true");
          window.location.reload();
        },
        false,
        "Cancel",
      );
    }
  });
}
