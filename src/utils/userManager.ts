/**
 * User Manager - Handles user signup, authentication, and greeting
 * Uses localStorage for persistence (no backend auth)
 * Handles broken localStorage gracefully
 */

const STORAGE_KEY = "sscprep_user";
const VALID_STREAMS = ["Science", "Commerce", "Arts"];

interface User {
  name: string;
  stream: "Science" | "Commerce" | "Arts";
  createdAt: string;
}

/**
 * Check if localStorage is available and working
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * In-memory fallback cache when localStorage fails
 */
const memoryCache: { user?: User } = {};

/**
 * Validate stream name against available streams
 */
function isValidStream(
  stream: string,
): stream is "Science" | "Commerce" | "Arts" {
  return VALID_STREAMS.includes(stream);
}

/**
 * Validate user inputs
 */
function validateInputs(
  name: string,
  stream: string,
): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Name cannot be empty" };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: "Name must be at least 2 characters" };
  }

  if (!isValidStream(stream)) {
    return {
      valid: false,
      error: `Invalid stream. Valid streams: ${VALID_STREAMS.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Sign up a new user with name and stream
 * Returns user data on success, error message on failure
 */
export function signup(
  name: string,
  stream: string,
): { success: boolean; user?: User; error?: string } {
  const validation = validateInputs(name, stream);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const user: User = {
    name: name.trim(),
    stream: stream as "Science" | "Commerce" | "Arts",
    createdAt: new Date().toISOString(),
  };

  const isStorageAvailable = isLocalStorageAvailable();

  try {
    if (isStorageAvailable) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      // Fallback to memory cache if localStorage fails
      memoryCache.user = user;
    }

    return { success: true, user };
  } catch (error) {
    // Storage full or other error - use memory cache
    memoryCache.user = user;
    return { success: true, user };
  }
}

/**
 * Get current logged-in user
 * Returns null if no user is signed up
 */
export function getCurrentUser(): User | null {
  const isStorageAvailable = isLocalStorageAvailable();

  try {
    if (isStorageAvailable) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as User;
      }
    }
  } catch (error) {
    // localStorage corrupted or unreadable - fall back to memory
  }

  // Return from memory cache if available
  return memoryCache.user || null;
}

/**
 * Get a greeting message for the user
 * Returns formatted greeting with user name and stream
 */
export function getGreeting(): string {
  const user = getCurrentUser();

  if (!user) {
    return "Welcome to SSCPrep! Please sign up to get started.";
  }

  const hour = new Date().getHours();
  let timeGreeting = "Welcome back";

  if (hour < 12) {
    timeGreeting = "Good morning";
  } else if (hour < 18) {
    timeGreeting = "Good afternoon";
  } else {
    timeGreeting = "Good evening";
  }

  return `${timeGreeting}, ${user.name}! 👋 You're studying ${user.stream} stream.`;
}

/**
 * Clear user data (logout)
 */
export function logout(): void {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore errors
  }
  memoryCache.user = undefined;
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Recovery function for broken localStorage
 * Attempts to clear and re-initialize localStorage
 */
export function recoverFromBrokenStorage(): boolean {
  try {
    // Try to clear the corrupted key
    localStorage.removeItem(STORAGE_KEY);

    // Verify localStorage is working again
    if (isLocalStorageAvailable()) {
      // If we have a user in memory cache, restore it
      if (memoryCache.user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache.user));
      }
      return true;
    }
  } catch {
    // Storage is completely broken
  }
  return false;
}
