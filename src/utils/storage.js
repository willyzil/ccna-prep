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
  } catch {}
}

// Bookmarks: { 'domain-topic': true/false }
export function getBookmarks() {
  if (!storageAvailable) return {};
  try {
    const saved = localStorage.getItem('ccna-prep-bookmarks');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveBookmarks(bookmarks) {
  if (!storageAvailable) return;
  try {
    localStorage.setItem('ccna-prep-bookmarks', JSON.stringify(bookmarks));
  } catch {}
}

// History: { 'YYYY-MM-DD': { correct, total, domainBreakdown: { [domain]: { correct, total } } } }
export function getHistory() {
  if (!storageAvailable) return {};
  try {
    const saved = localStorage.getItem('ccna-prep-history');
    const history = saved ? JSON.parse(saved) : {};
    // Prune entries older than 30 days
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const pruned = {};
    for (const [date, data] of Object.entries(history)) {
      if (new Date(date).getTime() >= cutoff) {
        pruned[date] = data;
      }
    }
    return pruned;
  } catch {
    return {};
  }
}

export function saveHistory(history) {
  if (!storageAvailable) return;
  try {
    // Prune before saving
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const pruned = {};
    for (const [date, data] of Object.entries(history)) {
      if (new Date(date).getTime() >= cutoff) {
        pruned[date] = data;
      }
    }
    localStorage.setItem('ccna-prep-history', JSON.stringify(pruned));
  } catch {}
}
