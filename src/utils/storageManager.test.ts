import {
  clearAllStorage,
  getCompletedChapters,
  saveCompletedChapters,
  toggleChapter,
} from "./storageManager";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("StorageManager", () => {
  beforeEach(() => {
    clearAllStorage();
  });

  afterEach(() => {
    clearAllStorage();
  });

  describe("getCompletedChapters", () => {
    it("should return empty array for new subject", () => {
      const result = getCompletedChapters("NewSubject");
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should retrieve saved chapters", () => {
      saveCompletedChapters("Math", ["ch1", "ch2"]);
      const result = getCompletedChapters("Math");
      expect(result.success).toBe(true);
      expect(result.data).toEqual(["ch1", "ch2"]);
    });

    it("should handle corrupted JSON gracefully", () => {
      // Simulate corrupted data
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("sscprep_BadSubject", "invalid json {");
        const result = getCompletedChapters("BadSubject");
        expect(result.success).toBe(false);
        expect(result.error).toContain("Failed to parse");
      }
    });
  });

  describe("saveCompletedChapters", () => {
    it("should save chapters to localStorage", () => {
      const chapters = ["physics-1", "physics-2", "physics-3"];
      const result = saveCompletedChapters("Physics", chapters);
      expect(result.success).toBe(true);

      const retrieved = getCompletedChapters("Physics");
      expect(retrieved.data).toEqual(chapters);
    });

    it("should overwrite existing data", () => {
      saveCompletedChapters("Chemistry", ["ch1", "ch2"]);
      saveCompletedChapters("Chemistry", ["ch3"]);

      const result = getCompletedChapters("Chemistry");
      expect(result.data).toEqual(["ch3"]);
    });
  });

  describe("toggleChapter", () => {
    it("should add chapter when not completed", () => {
      const result = toggleChapter("Biology", "bio-1");
      expect(result.success).toBe(true);
      expect(result.data).toContain("bio-1");
    });

    it("should remove chapter when already completed", () => {
      toggleChapter("Biology", "bio-1");
      const result = toggleChapter("Biology", "bio-1");
      expect(result.success).toBe(true);
      expect(result.data).not.toContain("bio-1");
    });

    it("should handle multiple toggles", () => {
      toggleChapter("History", "hist-1");
      toggleChapter("History", "hist-2");
      const result = toggleChapter("History", "hist-3");

      expect(result.data).toContain("hist-1");
      expect(result.data).toContain("hist-2");
      expect(result.data).toContain("hist-3");
    });

    it("should maintain idempotency", () => {
      const data1 = toggleChapter("Geography", "geo-1").data;
      const data2 = getCompletedChapters("Geography").data;
      expect(data1).toEqual(data2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty chapter ID", () => {
      const result = toggleChapter("Subject", "");
      expect(result.success).toBe(true);
      expect(result.data).toContain("");
    });

    it("should isolate data between subjects", () => {
      toggleChapter("Subject1", "ch-1");
      toggleChapter("Subject2", "ch-1");

      const sub1 = getCompletedChapters("Subject1");
      const sub2 = getCompletedChapters("Subject2");

      expect(sub1.data).toEqual(["ch-1"]);
      expect(sub2.data).toEqual(["ch-1"]);
      expect(sub1.data).toEqual(sub2.data); // Same data, different keys
    });

    it("should handle localStorage quota exceeded", () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error("QuotaExceededError");
      });

      const result = saveCompletedChapters("LargeSubject", [
        "ch1",
        "ch2",
        "ch3",
      ]);
      expect(result.success).toBe(false);

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe("Data Integrity", () => {
    it("should preserve array order on multiple updates", () => {
      toggleChapter("Subject", "ch-3");
      toggleChapter("Subject", "ch-1");
      toggleChapter("Subject", "ch-2");

      const result = getCompletedChapters("Subject");
      expect(result.data).toEqual(["ch-3", "ch-1", "ch-2"]);
    });

    it("should not have duplicate entries", () => {
      // Manually add duplicates and test
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(
          "sscprep_TestSubject",
          JSON.stringify(["ch1", "ch1", "ch2"]),
        );
      }
      toggleChapter("TestSubject", "ch1");
      const result = getCompletedChapters("TestSubject");
      const uniqueCount = new Set(result.data).size;
      expect(uniqueCount).toBe(result.data?.length);
    });
  });
});
