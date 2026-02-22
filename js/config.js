/**
 * EcoTaarifa Configuration
 * Centralized settings for API URLs and Environments
 */

// Detect Base URL dynamically for Web
const getBaseURL = () => {
    let path = window.location.pathname;
    // Ensure we don't have double slashes and handle decoding
    path = decodeURIComponent(path).replace(/\/+/g, '/');

    const parts = path.split('/').filter(p => p.length > 0);
    let base = window.location.origin;

    // Logic: If we are in 'admin' or 'users', the base is 2 levels up
    // Otherwise, the base is 1 level up (the directory of the current file)
    if (path.includes('/admin/') || path.includes('/users/')) {
        // e.g., /EcoTaarifa/admin/dashboard.php -> /EcoTaarifa/
        base += '/' + parts.slice(0, parts.length - 2).join('/') + '/';
    } else if (parts.length > 0 && path.endsWith('.php')) {
        // e.g., /EcoTaarifa/index.php -> /EcoTaarifa/
        base += '/' + parts.slice(0, parts.length - 1).join('/') + '/';
    } else {
        // Fallback or root
        base += path.endsWith('/') ? path : path + '/';
    }
    
    // Clean up trailing double slashes
    return base.replace(/\/+$/, '/');
};

window.BASE_URL = getBaseURL();
window.env = "api/";
window.API_BASE_URL = window.BASE_URL + window.env;

console.log("EcoTaarifa Config Loaded:", { 
  BASE_URL: window.BASE_URL, 
  API_BASE_URL: window.API_BASE_URL 
});
