// Popup script for Temu Dark Mode
document.addEventListener('DOMContentLoaded', async () => {
  const enabledToggle = document.getElementById('enabled');
  const intensitySlider = document.getElementById('intensity');
  const intensityValue = document.getElementById('intensity-value');
  const smartInvertCheckbox = document.getElementById('smart-invert');
  const notTemuMessage = document.getElementById('not-temu');
  const controls = document.getElementById('controls');
  
  // Check if current tab is Temu
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const isTemuTab = tabs[0] && tabs[0].url && tabs[0].url.includes('temu.com');
  
  if (!isTemuTab) {
    notTemuMessage.style.display = 'block';
    controls.style.display = 'none';
    return;
  }
  
  // Load current settings
  let settings;
  try {
    settings = await browser.storage.sync.get({
      enabled: false,
      intensity: 100,
      smartInvert: true
    });
  } catch (e) {
    settings = await browser.storage.local.get({
      enabled: false,
      intensity: 100,
      smartInvert: true
    });
  }
  
  // Update UI
  enabledToggle.checked = settings.enabled;
  intensitySlider.value = settings.intensity;
  intensityValue.textContent = settings.intensity;
  smartInvertCheckbox.checked = settings.smartInvert;
  
  // Event listeners
  enabledToggle.addEventListener('change', saveAndApply);
  intensitySlider.addEventListener('input', (e) => {
    intensityValue.textContent = e.target.value;
    saveAndApply();
  });
  smartInvertCheckbox.addEventListener('change', saveAndApply);
  
  async function saveAndApply() {
    const newSettings = {
      enabled: enabledToggle.checked,
      intensity: parseInt(intensitySlider.value),
      smartInvert: smartInvertCheckbox.checked
    };
    
    // Save settings
    try {
      await browser.storage.sync.set(newSettings);
    } catch (e) {
      await browser.storage.local.set(newSettings);
    }
    
    // Apply to current tab
    browser.runtime.sendMessage({
      action: 'applyToActiveTab',
      settings: newSettings
    });
  }
});