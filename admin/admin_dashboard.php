<?php
require_once '../includes/auth_guard.php';
require_admin();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EcoTaarifa | Admin Dashboard</title>

  <link rel="shortcut icon" sizes="32x32" href="../assets/favicon.svg" type="image/xml + svg">
  <link rel="shortcut icon" sizes="48x48" href="../assets/favicon.png" type="image/png">
  <link rel="shortcut icon" sizes="180x180" href="../assets/favicon.svg" type="image/xml + svg">

  <meta name="description" content="EcoTaarifa Admin Dashboard" />
  <link rel="stylesheet" href="../css/styles.css?v=27" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
  <!-- Lottie Player -->
  <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
  <script src="../js/config.js"></script>
  <script>
    const IS_DASHBOARD = true;
  </script>
  <!-- PWA & Mobile Optimization -->
  <link rel="manifest" href="../manifest.json">
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

  <!-- ===================== ADMIN DASHBOARD ===================== -->
  <div id="admin-dashboard" class="page">
    <!-- Header -->
    <div class="dash-header eco-gradient">
      <div class="dash-header-left">
        <div class="user-avatar" id="admin-dashboard-avatar"></div>
        <div>
          <h1 class="dash-header-title" id="admin-dashboard-name">Admin</h1>
          <p class="dash-header-sub" id="admin-dashboard-role">Admin</p>
        </div>
      </div>
      <button class="header-btn" onclick="logout()">
        <i data-lucide="log-out" class="icon-sm icon-white"></i>
      </button>
    </div>

    <!-- Content -->
    <div class="dash-content" id="admin-content">
      <!-- Filled by JS -->
    </div>

    <!-- Bottom Nav -->
    <nav class="bottom-nav">
      <button class="nav-btn active" data-tab="home" onclick="switchAdminTab('home')">
        <i data-lucide="home" class="icon-sm"></i>
        <span>Home</span>
      </button>
      <button class="nav-btn" data-tab="reports" onclick="switchAdminTab('reports')">
        <i data-lucide="file-text" class="icon-sm"></i>
        <span>Reports</span>
      </button>
      <button class="nav-btn" data-tab="users" onclick="switchAdminTab('users')">
        <i data-lucide="users" class="icon-sm"></i>
        <span>Users</span>
      </button>
      <button class="nav-btn" data-tab="profile" onclick="switchAdminTab('profile')">
        <i data-lucide="user" class="icon-sm"></i>
        <span>Profile</span>
      </button>
    </nav>
  </div>

  <!-- ===================== TEMPLATES ===================== -->

  <!-- ADMIN HOME TEMPLATE -->
  <template id="tmpl-admin-home">
    <h2 class="section-title" data-i18n="overview"></h2>
    <div class="stats-grid-admin stats-grid-mb">
      <div class="stat-card stat-card-span2" style="animation-delay:0s">
        <i data-lucide="file-text" class="icon-sm stat-icon stat-icon-primary"></i>
        <p class="stat-value" data-stat-key="file-text" data-bind="totalReports">0</p>
        <p class="stat-label" data-i18n="totalReports"></p>
      </div>
      <div class="stat-card" style="animation-delay:0.05s">
        <i data-lucide="users" class="icon-sm stat-icon stat-icon-primary"></i>
        <p class="stat-value" data-stat-key="users" data-bind="totalUsers">0</p>
        <p class="stat-label" data-i18n="totalUsers"></p>
      </div>
      <div class="stat-card" style="animation-delay:0.1s">
        <i data-lucide="clock" class="icon-sm stat-icon stat-icon-pending"></i>
        <p class="stat-value" data-stat-key="clock" data-bind="pendingReports">0</p>
        <p class="stat-label" data-i18n="pendingReports"></p>
      </div>
      <div class="stat-card" style="animation-delay:0.15s">
        <i data-lucide="zap" class="icon-sm stat-icon stat-icon-warning"></i>
        <p class="stat-value" data-stat-key="zap" data-bind="inProgressReports">0</p>
        <p class="stat-label" data-i18n="inProgressReports"></p>
      </div>
      <div class="stat-card" style="animation-delay:0.2s">
        <i data-lucide="check-circle-2" class="icon-sm stat-icon stat-icon-success"></i>
        <p class="stat-value" data-stat-key="check-circle-2" data-bind="resolvedReports">0</p>
        <p class="stat-label" data-i18n="resolvedReports"></p>
      </div>
    </div>
    <h3 class="section-title"><span data-i18n="reports"></span> — <span data-i18n="pending"></span></h3>
    <div id="admin-pending-list">
      <!-- Filled by JS -->
    </div>
  </template>

  <!-- ADMIN REPORTS TEMPLATE -->
  <template id="tmpl-admin-reports">
    <div class="search-wrapper">
      <i data-lucide="search"></i>
      <input data-i18n-placeholder="searchReports" oninput="refilterAdminReportsSearch(this.value)" />
    </div>
    <div class="filter-tabs" id="admin-filter-tabs">
      <!-- Filled by JS -->
    </div>
    <div class="admin-table-container animate-fadeIn">
      <table class="admin-table">
        <thead>
          <tr>
            <th><span data-i18n="title"></span> / <span data-i18n="status"></span></th>
            <th data-i18n="reporter"></th>
            <th class="text-right" data-i18n="action"></th>
          </tr>
        </thead>
        <tbody id="admin-reports-tbody">
          <!-- Filled by JS -->
        </tbody>
      </table>
    </div>
  </template>

  <!-- ADMIN USERS TEMPLATE -->
  <template id="tmpl-admin-users">
    <div class="top-bar-search">
      <button class="btn-add full-width-mobile" onclick="openAddUserModal()"><i data-lucide="plus"></i> <span data-i18n="addUser"></span></button>
      <div class="search-wrapper"><i data-lucide="search"></i><input data-i18n-placeholder="searchUsers" oninput="refreshAdminUsers(this.value)" /></div>
    </div>
    <div class="admin-table-container animate-fadeIn">
      <table class="admin-table">
        <thead>
          <tr>
            <th data-i18n="name"></th>
            <th data-i18n="email"></th>
            <th data-i18n="role"></th>
            <th class="text-right" data-i18n="action"></th>
          </tr>
        </thead>
        <tbody id="admin-users-tbody">
          <!-- Filled by JS -->
        </tbody>
      </table>
    </div>
  </template>

  <!-- ADMIN PROFILE TEMPLATE -->
  <template id="tmpl-admin-profile">
    <div class="card profile-card">
      <div class="profile-card-header"><i data-lucide="user"></i><h3 data-i18n="personalInfo"></h3></div>
      <div class="profile-field"><label data-i18n="fullName"></label><input id="pf-name" data-bind="pf-name" /></div>
      <div class="profile-field"><label data-i18n="email"></label><input id="pf-email" type="email" data-bind="pf-email" /></div>
      <button class="btn-eco" onclick="saveProfileInfo()" data-i18n="saveChanges"></button>
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
