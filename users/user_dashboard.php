<?php
require_once '../includes/auth_guard.php';
require_login();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EcoTaarifa | User Dashboard</title>

  <link rel="shortcut icon" sizes="32x32" href="../assets/favicon.svg" type="image/xml + svg">
  <link rel="shortcut icon" sizes="48x48" href="../assets/favicon.png" type="image/png">
  <link rel="shortcut icon" sizes="180x180" href="../assets/favicon.svg" type="image/xml + svg">

  <meta name="description" content="EcoTaarifa User Dashboard" />
  <link rel="stylesheet" href="../css/styles.css?v=27" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <!-- Leaflet CSS & JS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
  <!-- Lottie Player -->
  <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
  <script src="../js/config.js"></script>
  <script>
    const IS_DASHBOARD = true;
  </script>
  <!-- PWA & Mobile Optimization -->
  <link rel="manifest" href="/manifest.json" crossorigin="use-credentials">
  <meta name="theme-color" content="#10b981">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="EcoTaarifa">
  <link rel="apple-touch-icon" href="../assets/apple-touch-icon-180.png">
  <link rel="apple-touch-icon" sizes="152x152" href="../assets/apple-touch-icon-180.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon-180.png">
  <link rel="apple-touch-icon" sizes="167x167" href="../assets/apple-touch-icon-180.png">
</head>
<body>

  <!-- ===================== USER DASHBOARD ===================== -->
  <div id="user-dashboard" class="page">
    <!-- Header -->
    <div class="dash-header eco-gradient">
      <div class="dash-header-left">
        <div class="user-avatar" id="user-dashboard-avatar"></div>
        <div>
          <h1 class="dash-header-title" id="user-dashboard-name">Citizen</h1>
          <p class="dash-header-sub" id="user-dashboard-role">Citizen</p>
        </div>
      </div>
      <button class="header-btn" onclick="logout()">
        <i data-lucide="log-out" class="icon-sm icon-white"></i>
      </button>
    </div>

    <!-- Content -->
    <div class="dash-content" id="user-content">
      <!-- Filled by JS -->
    </div>

    <!-- Bottom Nav -->
    <nav class="bottom-nav">
      <button class="nav-btn active" data-tab="home" onclick="switchUserTab('home')">
        <i data-lucide="home" class="icon-sm"></i>
        <span>Home</span>
      </button>
      <button class="nav-btn" data-tab="reports" onclick="switchUserTab('reports')">
        <i data-lucide="clipboard-list" class="icon-sm"></i>
        <span>My Reports</span>
      </button>
      <button class="nav-btn" data-tab="profile" onclick="switchUserTab('profile')">
        <i data-lucide="user" class="icon-sm"></i>
        <span>Profile</span>
      </button>
    </nav>
  </div>

  <!-- ===================== TEMPLATES ===================== -->

  <!-- USER HOME TEMPLATE -->
  <template id="tmpl-user-home">
    <div class="welcome-card">
      <p class="wc-sub" data-i18n="welcome"></p>
      <h1 class="wc-name" data-bind="user-name"></h1>
    </div>
    <div class="stats-grid stats-grid-mb">
      <div class="stat-card" style="animation-delay:0s">
        <i data-lucide="file-text" class="icon-sm stat-icon stat-icon-primary"></i>
        <p class="stat-value" data-stat-key="file-text" data-bind="total-reports">0</p>
        <p class="stat-label" data-i18n="totalReports"></p>
      </div>
      <div class="stat-card" style="animation-delay:0.06s">
        <i data-lucide="clock" class="icon-sm stat-icon stat-icon-pending"></i>
        <p class="stat-value" data-stat-key="clock" data-bind="pending-reports">0</p>
        <p class="stat-label" data-i18n="pendingReports"></p>
      </div>
      <div class="stat-card" style="animation-delay:0.12s">
        <i data-lucide="check-circle-2" class="icon-sm stat-icon stat-icon-success"></i>
        <p class="stat-value" data-stat-key="check-circle-2" data-bind="resolved-reports">0</p>
        <p class="stat-label" data-i18n="resolvedReports"></p>
      </div>
    </div>

    <h2 class="section-title" data-i18n="reportFromMap"></h2>
    <div class="map-container" id="real-map-container" style="height: 350px;">
      <!-- Leaflet map will be initialized here -->
    </div>

    <div class="quick-support-section">
      <h3 class="section-title section-title-sm" data-i18n="quickSupport"></h3>
      <div class="support-grid">
        <!-- Location -->
        <div class="support-card" style="animation-delay:0.1s">
          <div class="support-icon-wrapper"><i data-lucide="map-pin"></i></div>
          <div class="support-content">
            <h4 data-i18n="location"></h4>
            <p>Dar es Salaam, Tanzania</p>
          </div>
        </div>
        <!-- Contact -->
        <div class="support-card" style="animation-delay:0.15s">
          <div class="support-icon-wrapper"><i data-lucide="phone"></i></div>
          <div class="support-content">
            <h4 data-i18n="contact"></h4>
            <p>+255 123 456 789</p>
          </div>
        </div>
        <!-- Socials -->
        <div class="support-card" style="animation-delay:0.2s">
          <div class="support-icon-wrapper"><i data-lucide="share-2"></i></div>
          <div class="support-content">
            <h4 data-i18n="followUs"></h4>
            <div class="social-links">
               <a href="#" class="social-link"><i data-lucide="globe"></i></a>
               <a href="#" class="social-link"><i data-lucide="instagram"></i></a>
               <a href="#" class="social-link"><i data-lucide="facebook"></i></a>
               <a href="#" class="social-link"><i data-lucide="twitter"></i></a>
            </div>
          </div>
        </div>
        <!-- Email -->
        <div class="support-card" style="animation-delay:0.25s">
          <div class="support-icon-wrapper"><i data-lucide="mail"></i></div>
          <div class="support-content">
            <h4 data-i18n="email"></h4>
            <p>support@ecoreport.com</p>
          </div>
        </div>
      </div>
    </div>
  </template>

  <!-- USER REPORTS TEMPLATE -->
  <template id="tmpl-user-reports">
    <div class="top-bar reports-top-bar">
      <h2 data-i18n="myReports"></h2>
      <button class="btn-add full-width-mobile" onclick="openNewReportModal()"><i data-lucide="plus"></i> <span data-i18n="newReport"></span></button>
      <div class="search-wrapper">
        <i data-lucide="search"></i>
        <input data-i18n-placeholder="searchReports" oninput="refilterUserReportsSearch(this.value)" />
      </div>
    </div>
    <div class="filter-tabs" id="user-filter-tabs">
      <!-- Filled by JS -->
    </div>
    <div id="user-reports-list">
      <!-- Filled by JS -->
    </div>
  </template>

  <!-- USER PROFILE TEMPLATE -->
  <template id="tmpl-user-profile">
    <div class="card profile-card">
      <div class="profile-card-header"><i data-lucide="user"></i><h3 data-i18n="personalInfo"></h3></div>
      <div class="profile-field"><label data-i18n="fullName"></label><input data-bind="pf-name" disabled class="input-disabled" /></div>
      <div class="profile-field"><label data-i18n="email"></label><input data-bind="pf-email" disabled class="input-disabled" /></div>
    </div>
    <div class="card profile-card" style="animation-delay:0.05s">
      <div class="profile-card-header"><i data-lucide="lock"></i><h3 data-i18n="changePassword"></h3></div>
      <div class="profile-field">
        <label data-i18n="currentPassword"></label>
        <div class="input-with-icon">
          <input type="password" id="pf-curpw" readonly onfocus="this.removeAttribute('readonly')" autocomplete="off" />
          <button class="password-toggle" type="button" onclick="togglePasswordVisibility('pf-curpw', this)"><i data-lucide="eye"></i></button>
        </div>
        <p class="error-text" id="pf-curpw-err"></p>
      </div>
      <div class="profile-field">
        <label data-i18n="newPassword"></label>
        <div class="input-with-icon">
          <input type="password" id="pf-newpw" readonly onfocus="this.removeAttribute('readonly')" autocomplete="new-password" />
          <button class="password-toggle" type="button" onclick="togglePasswordVisibility('pf-newpw', this)"><i data-lucide="eye"></i></button>
        </div>
        <p class="error-text" id="pf-newpw-err"></p>
      </div>
      <div class="profile-field">
        <label data-i18n="confirmPassword"></label>
        <div class="input-with-icon">
          <input type="password" id="pf-confpw" readonly onfocus="this.removeAttribute('readonly')" autocomplete="new-password" />
          <button class="password-toggle" type="button" onclick="togglePasswordVisibility('pf-confpw', this)"><i data-lucide="eye"></i></button>
        </div>
        <p class="error-text" id="pf-confpw-err"></p>
      </div>
      <button class="btn-eco" onclick="changeProfilePassword()" data-i18n="changePassword"></button>
    </div>
    <div class="card profile-card" style="animation-delay:0.1s">
      <h3 class="profile-appearance-title" data-i18n="appearance"></h3>
      <p class="section-subtitle" data-i18n="chooseTheme"></p>
      <div class="option-grid option-grid-3">
        <button class="option-btn" data-theme="light" onclick="applyTheme('light')"><i data-lucide="sun"></i><span data-i18n="light"></span></button>
        <button class="option-btn" data-theme="dark" onclick="applyTheme('dark')"><i data-lucide="moon"></i><span data-i18n="dark"></span></button>
        <button class="option-btn" data-theme="system" onclick="applyTheme('system')"><i data-lucide="monitor"></i><span data-i18n="system"></span></button>
      </div>
    </div>
    <div class="card profile-card" style="animation-delay:0.15s">
      <div class="profile-card-header"><i data-lucide="globe"></i><h3 data-i18n="language"></h3></div>
      <p class="section-subtitle" data-i18n="chooseLanguage"></p>
      <div class="option-grid option-grid-2">
        <button class="lang-btn" data-lang="en" onclick="setLang('en')"><span class="flag">🇬🇧</span><span data-i18n="english"></span></button>
        <button class="lang-btn" data-lang="sw" onclick="setLang('sw')"><span class="flag">🇹🇿</span><span data-i18n="swahili"></span></button>
      </div>
      <button id="pwa-install-btn" class="btn-eco hidden" style="margin-top: 12px; background: var(--primary); color: white;">
        <i data-lucide="download"></i> <span data-i18n="installApp"></span>
      </button>
    </div>
    <a href="https://marsla-restaurant.gt.tc" class="visit-site-btn" style="animation-delay:0.2s" target="_blank" rel="noopener noreferrer">
      <i data-lucide="external-link"></i>
      <span data-i18n="visitSite"></span>
      <i data-lucide="arrow-right" class="visit-site-arrow"></i>
    </a>
  </template>

  <!-- ===================== MODAL OVERLAY ===================== -->
  <div id="modal-overlay" class="modal-overlay hidden" onclick="closeModal(event)">
    <div class="modal-content" id="modal-body" onclick="event.stopPropagation()">
      <!-- Filled by JS -->
    </div>
  </div>

  <!-- Toast container -->
  <div id="toast-container" class="toast-container"></div>

  <script src="../js/app.js?v=27"></script>
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('../sw.js');
      });
    }
  </script>
</body>
</html>
