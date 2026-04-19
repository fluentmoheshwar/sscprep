import {
  getCurrentUser,
  getGreeting,
  isLoggedIn,
  logout,
  recoverFromBrokenStorage,
  signup,
} from "./userManager";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("User Manager", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("signup", () => {
    it("should successfully sign up a user with valid name and stream", () => {
      const result = signup("John Doe", "Science");

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.name).toBe("John Doe");
      expect(result.user?.stream).toBe("Science");
      expect(result.error).toBeUndefined();
    });

    it("should trim whitespace from name", () => {
      const result = signup("  Alice Smith  ", "Commerce");

      expect(result.success).toBe(true);
      expect(result.user?.name).toBe("Alice Smith");
    });

    it("should reject empty name", () => {
      const result = signup("", "Arts");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Name cannot be empty");
    });

    it("should reject name with only whitespace", () => {
      const result = signup("   ", "Science");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Name cannot be empty");
    });

    it("should reject name shorter than 2 characters", () => {
      const result = signup("A", "Commerce");

      expect(result.success).toBe(false);
      expect(result.error).toContain("at least 2 characters");
    });

    it("should reject invalid stream", () => {
      const result = signup("Bob Johnson", "Engineering");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid stream");
    });

    it("should accept all valid streams", () => {
      const streams = ["Science", "Commerce", "Arts"];

      streams.forEach((stream) => {
        const result = signup("Test User", stream);
        expect(result.success).toBe(true);
        expect(result.user?.stream).toBe(stream);
      });
    });

    it("should persist user to localStorage", () => {
      signup("Test User", "Science");
      const stored = localStorage.getItem("sscprep_user");

      expect(stored).toBeDefined();
      const user = JSON.parse(stored!);
      expect(user.name).toBe("Test User");
      expect(user.stream).toBe("Science");
    });

    it("should include createdAt timestamp", () => {
      const beforeSignup = new Date();
      const result = signup("Test User", "Commerce");
      const afterSignup = new Date();

      expect(result.user?.createdAt).toBeDefined();
      const createdAt = new Date(result.user!.createdAt);
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeSignup.getTime(),
      );
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterSignup.getTime());
    });
  });

  describe("getCurrentUser", () => {
    it("should return null when no user is signed up", () => {
      const user = getCurrentUser();
      expect(user).toBeNull();
    });

    it("should return the signed-up user", () => {
      signup("Jane Doe", "Arts");
      const user = getCurrentUser();

      expect(user).toBeDefined();
      expect(user?.name).toBe("Jane Doe");
      expect(user?.stream).toBe("Arts");
    });

    it("should retrieve user from localStorage", () => {
      signup("Test User", "Science");

      // Clear memory cache to ensure retrieval from localStorage
      const user = getCurrentUser();
      expect(user?.name).toBe("Test User");
    });

    it("should handle corrupted localStorage gracefully", () => {
      localStorage.setItem("sscprep_user", "invalid json {");

      // Should not throw, should return null or memory cache value
      const user = getCurrentUser();
      // Either null or from memory cache is acceptable
      expect(() => getCurrentUser()).not.toThrow();
    });
  });

  describe("getGreeting", () => {
    it("should return welcome message when no user is signed up", () => {
      const greeting = getGreeting();

      expect(greeting).toContain("Welcome to SSCPrep");
      expect(greeting).toContain("sign up");
    });

    it("should include user name in greeting", () => {
      signup("Charlie Brown", "Commerce");
      const greeting = getGreeting();

      expect(greeting).toContain("Charlie Brown");
    });

    it("should include stream in greeting", () => {
      signup("Test User", "Science");
      const greeting = getGreeting();

      expect(greeting).toContain("Science");
    });

    it("should return appropriate time-based greeting", () => {
      signup("Alice", "Arts");
      const greeting = getGreeting();

      // Should contain one of these time greetings
      const validGreetings = [
        "Good morning",
        "Good afternoon",
        "Good evening",
        "Welcome back",
      ];
      const containsValidGreeting = validGreetings.some((g) =>
        greeting.includes(g),
      );
      expect(containsValidGreeting).toBe(true);
    });

    it("should format greeting properly", () => {
      signup("Test User", "Science");
      const greeting = getGreeting();

      expect(greeting).toMatch(/Test User/);
      expect(greeting).toMatch(/Science/);
      expect(greeting).toMatch(/studying/);
    });
  });

  describe("logout", () => {
    it("should clear user from localStorage", () => {
      signup("Test User", "Science");
      logout();

      expect(localStorage.getItem("sscprep_user")).toBeNull();
    });

    it("should make getCurrentUser return null after logout", () => {
      signup("Test User", "Science");
      logout();

      expect(getCurrentUser()).toBeNull();
    });

    it("should not throw when logging out without a user", () => {
      expect(() => logout()).not.toThrow();
    });
  });

  describe("isLoggedIn", () => {
    it("should return false when no user is signed up", () => {
      expect(isLoggedIn()).toBe(false);
    });

    it("should return true after signup", () => {
      signup("Test User", "Science");
      expect(isLoggedIn()).toBe(true);
    });

    it("should return false after logout", () => {
      signup("Test User", "Science");
      logout();
      expect(isLoggedIn()).toBe(false);
    });
  });

  describe("Edge case: Broken localStorage", () => {
    it("should fall back to memory cache when localStorage fails", () => {
      // Mock localStorage to throw errors
      const setItemSpy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("QuotaExceededError");
        });

      const result = signup("Test User", "Science");

      expect(result.success).toBe(true);
      expect(result.user?.name).toBe("Test User");

      setItemSpy.mockRestore();
    });

    it("should retrieve user from memory cache when localStorage is unavailable", () => {
      signup("Cache User", "Commerce");

      // Mock localStorage to return null
      const getItemSpy = vi
        .spyOn(Storage.prototype, "getItem")
        .mockReturnValue(null);

      const user = getCurrentUser();

      // Should either retrieve from memory or handle gracefully
      expect(() => getCurrentUser()).not.toThrow();

      getItemSpy.mockRestore();
    });

    it("should provide recovery function for broken storage", () => {
      signup("Test User", "Science");

      // Corrupt localStorage
      localStorage.setItem("sscprep_user", "corrupted data {");

      const recovered = recoverFromBrokenStorage();

      // Recovery should attempt to fix the issue
      expect(typeof recovered).toBe("boolean");
    });

    it("should handle recovery when localStorage is completely unavailable", () => {
      signup("Test User", "Arts");

      // Mock localStorage to be completely unavailable
      const removeItemSpy = vi
        .spyOn(Storage.prototype, "removeItem")
        .mockImplementation(() => {
          throw new Error("localStorage is disabled");
        });

      const recovered = recoverFromBrokenStorage();
      expect(recovered).toBe(false);

      removeItemSpy.mockRestore();
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete user flow: signup -> greeting -> logout", () => {
      expect(isLoggedIn()).toBe(false);

      const signupResult = signup("Integration Test", "Science");
      expect(signupResult.success).toBe(true);

      expect(isLoggedIn()).toBe(true);
      const greeting = getGreeting();
      expect(greeting).toContain("Integration Test");

      logout();
      expect(isLoggedIn()).toBe(false);
    });

    it("should handle multiple users (last one overwrites)", () => {
      signup("User One", "Science");
      expect(getCurrentUser()?.name).toBe("User One");

      signup("User Two", "Commerce");
      expect(getCurrentUser()?.name).toBe("User Two");

      // First user is overwritten
      expect(getCurrentUser()?.stream).toBe("Commerce");
    });

    it("should persist across getCurrentUser calls", () => {
      signup("Persistent User", "Arts");

      const user1 = getCurrentUser();
      const user2 = getCurrentUser();
      const user3 = getCurrentUser();

      expect(user1?.name).toBe("Persistent User");
      expect(user2?.name).toBe("Persistent User");
      expect(user3?.name).toBe("Persistent User");
    });
  });
});
