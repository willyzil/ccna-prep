export const storageAvailable = (() => {
  try {
    const test = '__ccna_storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
})();

export function getProgress() {
  if (!storageAvailable) return {};
  try {
    const saved = localStorage.getItem('ccna-prep-progress');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress) {
  if (!storageAvailable) return;
  try {
    localStorage.setItem('ccna-prep-progress', JSON.stringify(progress));
  } catch {
    // silently fail
  }
}
