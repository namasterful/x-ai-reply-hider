document.addEventListener('DOMContentLoaded', async () => {
  const enabled = document.getElementById('enabled');
  const newTagInput = document.getElementById('new-tag');
  const addTagButton = document.getElementById('add-tag');
  const tagListDiv = document.getElementById('tag-list');
  const hiddenCountSpan = document.getElementById('hidden-count');

  const renderTags = (tags) => {
    tagListDiv.innerHTML = '';
    tags.forEach((tag, index) => {
      const div = document.createElement('div');
      div.className = 'tag-item';

      const input = document.createElement('input');
      input.value = tag;
      input.addEventListener('change', () => updateTag(index, input.value));

      const del = document.createElement('button');
      del.textContent = 'Remove';
      del.addEventListener('click', () => removeTag(index));

      div.appendChild(input);
      div.appendChild(del);
      tagListDiv.appendChild(div);
    });
  };

  const saveTags = async (tags) => {
    await chrome.storage.local.set({ blockedTags: tags }).catch(error => {
      console.error('[AI Filter Popup] Error saving tags:', error);
    });
  };

  const updateTag = async (index, newValue) => {
    const data = await chrome.storage.local.get('blockedTags');
    const tags = data.blockedTags ?? [];
    tags[index] = newValue;
    await saveTags(tags);
    renderTags(tags);
  };

  const removeTag = async (index) => {
    const data = await chrome.storage.local.get('blockedTags');
    const tags = data.blockedTags ?? [];
    tags.splice(index, 1);
    await saveTags(tags);
    renderTags(tags);
  };

  const addTag = async () => {
    const tag = newTagInput.value.trim();
    if (!tag) return;
    const data = await chrome.storage.local.get('blockedTags');
    const tags = data.blockedTags ?? [];
    tags.push(tag);
    newTagInput.value = '';
    await saveTags(tags);
    renderTags(tags);
  };

  const updateEnabled = async (value) => {
    await chrome.storage.local.set({ enabled: value }).catch(error => {
      console.error('[AI Filter Popup] Error saving enabled state:', error);
    });
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const settings = await chrome.storage.local.get(['enabled', 'blockedTags', 'hiddenCount']);

  enabled.checked = settings.enabled;
  hiddenCountSpan.textContent = formatNumber(settings.hiddenCount ?? 0);
  renderTags(settings.blockedTags ?? []);

  enabled.addEventListener('change', () => updateEnabled(enabled.checked));
  addTagButton.addEventListener('click', addTag);

  const enabledCheckbox = document.getElementById('enabled');
  const enabledLabel = document.getElementById('enabled-label');

  const updateToggleLabel = () => {
    enabledLabel.textContent = enabledCheckbox.checked ? 'Enabled' : 'Disabled';
  };

  enabledCheckbox.addEventListener('change', () => {
    updateToggleLabel();
  });

  newTagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTag();
    }
  });

  updateToggleLabel();
});