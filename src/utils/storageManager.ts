/**
 * Storage Manager - Safe localStorage wrapper with fallback
 * Handles JSON serialization, error cases, and provides warnings
 */

interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const STORAGE_PREFIX = "sscprep_";

/**
 * Check if localStorage is available and functional
 */
function isStorageAvailable(): boolean {
  try {
    const test = "__test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get completed chapters from localStorage
 */
export function getCompletedChapters(
  subjectName: string,
): StorageResult<string[]> {
  if (!isStorageAvailable()) {
    return {
      success: false,
      data: [],
      error: "localStorage unavailable",
    };
  }

  try {
    const key = `${STORAGE_PREFIX}${subjectName}`;
    const stored = localStorage.getItem(key);
    const data = stored ? JSON.parse(stored) : [];
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: `Failed to parse stored data: ${error}`,
    };
  }
}

/**
 * Save completed chapters to localStorage
 */
export function saveCompletedChapters(
  subjectName: string,
  chapterIds: string[],
): StorageResult<void> {
  if (!isStorageAvailable()) {
    return {
      success: false,
      error: "localStorage unavailable - changes will not persist",
    };
  }

  try {
    const key = `${STORAGE_PREFIX}${subjectName}`;
    localStorage.setItem(key, JSON.stringify(chapterIds));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to save: ${error}`,
    };
  }
}

/**
 * Toggle chapter completion status
 */
export function toggleChapter(
  subjectName: string,
  chapterId: string,
): StorageResult<string[]> {
  const result = getCompletedChapters(subjectName);

  if (!result.success) {
    return result;
  }

  const completed = result.data || [];
  const isCompleted = completed.includes(chapterId);
  const updated = isCompleted
    ? completed.filter((id) => id !== chapterId)
    : [...completed, chapterId];

  const saveResult = saveCompletedChapters(subjectName, updated);

  if (!saveResult.success) {
    return {
      success: false,
      error: saveResult.error,
    };
  }

  return { success: true, data: updated };
}

/**
 * Clear all stored data (for testing)
 */
export function clearAllStorage(): void {
  if (!isStorageAvailable()) return;
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith(STORAGE_PREFIX),
  );
  keys.forEach((key) => localStorage.removeItem(key));
}
