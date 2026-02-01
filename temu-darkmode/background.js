// Background script for Temu Dark Mode extension
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'applyToActiveTab') {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('temu.com')) {
        browser.tabs.sendMessage(tabs[0].id, {
          action: 'applySettings',
          settings: message.settings
        });
      }
    });
  }
});