<?php
session_start();

if (isset($_SESSION['user_id'])) {
    if ($_SESSION['role'] === 'admin') {
        header("Location: admin/admin_dashboard.php");
    } else {
        header("Location: users/user_dashboard.php");
    }
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EcoTaarifa | Environmental Issue Reporter</title>

  <link rel="shortcut icon" sizes="32x32" href="assets/favicon.svg" type="image/xml + svg">
  <link rel="shortcut icon" sizes="48x48" href="assets/favicon.png" type="image/png">
  <link rel="shortcut icon" sizes="180x180" href="assets/favicon.svg" type="image/xml + svg">

  <meta name="description" content="EcoTaarifa PWA for reporting and managing environmental issues" />
  <link rel="stylesheet" href="css/styles.css?v=27" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
  <!-- Lottie Player -->
  <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
  <!-- PWA & Mobile Optimization -->
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#10b981">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="EcoTaarifa">
  <link rel="apple-touch-icon" href="assets/apple-touch-icon-180.png">
  <link rel="apple-touch-icon" sizes="152x152" href="assets/apple-touch-icon-180.png">
  <link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon-180.png">
  <link rel="apple-touch-icon" sizes="167x167" href="assets/apple-touch-icon-180.png">
</head>
<body>

  <!-- ===================== AUTH PAGE ===================== -->
  <div id="auth-page" class="page auth-page">
    <div class="auth-logo" id="auth-logo">
      
      <div class="auth-logo-icon">
        <img src="assets/logo.svg" alt="EcoReport Logo" class="auth-logo-img">
      </div>
      <p class="auth-subtitle">Report. Track. Resolve.</p>
    </div>

    <div class="auth-form-wrapper" id="auth-form-wrapper">
      <!-- Toggle -->
      <div class="auth-toggle">
        <button class="auth-toggle-btn active" id="login-tab" onclick="switchAuthTab(true)">Log In</button>
        <button class="auth-toggle-btn" id="signup-tab" onclick="switchAuthTab(false)">Sign Up</button>
      </div>

      <form id="auth-form" onsubmit="handleAuth(event)" novalidate autocomplete="off">
        <!-- Name (signup only) -->
        <div class="name-field-container">
          <div class="name-field-inner">
            <div id="first-name-field" class="form-group">
              <div class="input-wrapper">
                <i data-lucide="user" class="input-icon"></i>
                <input type="text" id="auth-first-name" placeholder="First Name" oninput="validateAuthField('first-name')" onblur="touchAuthField('first-name')" autocomplete="off" />
              </div>
              <p class="error-text" id="first-name-error"></p>
            </div>
            <div id="last-name-field" class="form-group">
              <div class="input-wrapper">
                <i data-lucide="user" class="input-icon"></i>
                <input type="text" id="auth-last-name" placeholder="Last Name" oninput="validateAuthField('last-name')" onblur="touchAuthField('last-name')" autocomplete="off" />
              </div>
              <p class="error-text" id="last-name-error"></p>
            </div>
          </div>
        </div>

        <!-- Email -->
        <div class="form-group">
          <div class="input-wrapper">
            <i data-lucide="mail" class="input-icon"></i>
            <input type="email" id="auth-email" placeholder="Email" oninput="validateAuthField('email')" onblur="touchAuthField('email')" autocomplete="off" />
          </div>
          <p class="error-text" id="email-error"></p>
        </div>

        <!-- Password -->
        <div class="form-group">
          <div class="input-wrapper">
            <i data-lucide="lock" class="input-icon"></i>
            <input type="password" id="auth-password" placeholder="Password" oninput="validateAuthField('password')" onblur="touchAuthField('password')" autocomplete="new-password" />
            <button type="button" class="pw-toggle" onclick="togglePasswordVisibility('auth-password', this)">
              <i data-lucide="eye" class="input-icon-right"></i>
            </button>
          </div>
          <p class="error-text" id="password-error"></p>
        </div>

        <button type="submit" class="btn-primary eco-gradient" id="auth-submit-btn">Log In</button>
      </form>

      <p class="auth-footer">
        <span id="auth-footer-text">Don't have an account? </span>
        <button class="link-btn" id="auth-footer-link" onclick="switchAuthTab(false)">Sign Up</button>
      </p>

    </div>
  </div>

  <!-- ===================== MODAL OVERLAY ===================== -->
  <div id="modal-overlay" class="modal-overlay hidden" onclick="closeModal(event)">
    <div class="modal-content" id="modal-body" onclick="event.stopPropagation()">
      <!-- Filled by JS -->
    </div>
  </div>

  <!-- Toast container -->
  <div id="toast-container" class="toast-container"></div>

  <script src="js/config.js"></script>
  <script src="js/app.js?v=27"></script>
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js');
      });
    }
  </script>
</body>
</html>
