// Content script for Temu Dark Mode
(function() {
  'use strict';
  
  let currentSettings = { enabled: false, intensity: 100, smartInvert: true };
  
  // Load and apply settings on page load
  loadSettings().then(applyDarkMode);
  
  // Handle SPA navigation
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    setTimeout(() => applyDarkMode(), 100);
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    setTimeout(() => applyDarkMode(), 100);
  };
  
  window.addEventListener('popstate', () => {
    setTimeout(() => applyDarkMode(), 100);
  });
  
  // Watch for DOM changes
  const observer = new MutationObserver(() => {
    if (currentSettings.enabled && !document.documentElement.classList.contains('temu-darkmode-enabled')) {
      applyDarkMode();
    }
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Listen for messages from popup
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'applySettings') {
      currentSettings = message.settings;
      applyDarkMode();
    }
  });
  
  async function loadSettings() {
    try {
      const result = await browser.storage.sync.get({
        enabled: false,
        intensity: 100,
        smartInvert: true
      });
      currentSettings = result;
      return result;
    } catch (e) {
      // Fallback to local storage
      const result = await browser.storage.local.get({
        enabled: false,
        intensity: 100,
        smartInvert: true
      });
      currentSettings = result;
      return result;
    }
  }
  
  function applyDarkMode() {
    const html = document.documentElement;
    
    if (currentSettings.enabled) {
      html.classList.add('temu-darkmode-enabled');
      if (!currentSettings.smartInvert) {
        html.classList.add('no-smart-invert');
      } else {
        html.classList.remove('no-smart-invert');
      }
      
      // Set intensity via CSS variable
      const intensity = currentSettings.intensity / 100;
      html.style.setProperty('--temu-dark-intensity', intensity.toString());
    } else {
      html.classList.remove('temu-darkmode-enabled', 'no-smart-invert');
      html.style.removeProperty('--temu-dark-intensity');
    }
  }
})();