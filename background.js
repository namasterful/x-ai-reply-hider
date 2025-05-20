chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    enabled: true,
    blockedTags: ['@grok'],
    hiddenCount: 0
  }).catch(error => {
    console.error('[X AI Reply Hider] Error setting default values:', error);
  });
});