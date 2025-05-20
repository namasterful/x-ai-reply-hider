(async function () {
  const DEFAULT_TAGS = ['@grok', '@perplexity', '@openai', '@chatgpt'];

  let hiddenCount = 0;
  let updateTimeout;
  let commitScheduled = false;

  const getSettings = async () => {
    const result = await chrome.storage.local.get(['enabled', 'blockedTags']);
    return {
      enabled: result.enabled ?? true,
      blockedTags: result.blockedTags ?? DEFAULT_TAGS,
    };
  };

  const commitHiddenCount = async () => {
    if (commitScheduled) {
      return;
    }

    commitScheduled = true;

    try {
      const stored = await chrome.storage.local.get('hiddenCount');
      const current = stored.hiddenCount ?? 0;
      await chrome.storage.local.set({ hiddenCount: current + hiddenCount });
    } catch (error) {
      console.error('[X AI Reply Hider] Error committing hidden count:', error);
    } finally {
      hiddenCount = 0;
      commitScheduled = false;
    }
  };

  const scheduleCommit = () => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    updateTimeout = setTimeout(() => {
      commitHiddenCount();
      updateTimeout = null;
    }, 1000);
  };

  const tryFilter = async (post) => {
    try {
      const settings = await getSettings();
      if (!settings.enabled) return;
      const text = post.innerText?.toLowerCase?.();
      if (!text) return;
      for (const tag of settings.blockedTags) {
        if (text.includes(tag.toLowerCase())) {
          post.style.display = 'none';
          hiddenCount++;
          scheduleCommit();
          break;
        }
      }
    } catch (error) {
      console.error('[X AI Reply Hider] Error filtering post:', error);
    }
  };

  const observer = new MutationObserver((mutations) => {
    const timeline = document.querySelector('main');
    if (!timeline) {
      return;
    }

    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (timeline.contains(node)) {
          if (node.nodeType === 1 && node.tagName === 'ARTICLE') {
            tryFilter(node);
          } else if (node.nodeType === 1) {
            node.querySelectorAll?.('article').forEach(article => tryFilter(article));
          }
        }
      });
    });
  });

  const observeTimeline = () => {
    const timeline = document.querySelector('main');
    if (timeline) {
      observer.observe(timeline, { childList: true, subtree: true });
    } else {
      setTimeout(observeTimeline, 1000);
    }
  };

  observeTimeline();
})();