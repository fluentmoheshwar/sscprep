/**
 * Simple User Manager Tests - No localStorage setup needed
 * These tests work by calling functions directly
 */

import {
  getCurrentUser,
  getGreeting,
  isLoggedIn,
  logout,
  recoverFromBrokenStorage,
  signup,
} from "./userManager";

// Test helper: simple pass/fail counter
let passed = 0;
let failed = 0;

function test(description: string, fn: () => boolean) {
  try {
    const result = fn();
    if (result) {
      console.log(`✓ ${description}`);
      passed++;
    } else {
      console.log(`✗ ${description}`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ ${description} - Error: ${error}`);
    failed++;
  }
}

console.log("=== User Manager Tests (No localStorage required) ===\n");

// Signup tests
console.log("Signup Tests:");
test("Should successfully sign up a user with valid name and stream", () => {
  const result = signup("John Doe", "Science");
  return (
    result.success &&
    result.user?.name === "John Doe" &&
    result.user?.stream === "Science"
  );
});

test("Should reject empty name", () => {
  const result = signup("", "Arts");
  return !result.success && result.error?.includes("Name cannot be empty");
});

test("Should reject name with only whitespace", () => {
  const result = signup("   ", "Science");
  return !result.success && result.error?.includes("Name cannot be empty");
});

test("Should reject name shorter than 2 characters", () => {
  const result = signup("A", "Commerce");
  return !result.success && result.error?.includes("at least 2 characters");
});

test("Should reject invalid stream", () => {
  const result = signup("Bob Johnson", "Engineering");
  return !result.success && result.error?.includes("Invalid stream");
});

test("Should trim whitespace from name", () => {
  const result = signup("  Alice Smith  ", "Commerce");
  return result.success && result.user?.name === "Alice Smith";
});

test("Should accept all valid streams", () => {
  const streams = ["Science", "Commerce", "Arts"];
  return streams.every((stream) => {
    const result = signup("Test User", stream);
    return result.success && result.user?.stream === stream;
  });
});

// GetCurrentUser tests
console.log("\nGetCurrentUser Tests:");
test("Should return the signed-up user", () => {
  signup("Jane Doe", "Arts");
  const user = getCurrentUser();
  return user?.name === "Jane Doe" && user?.stream === "Arts";
});

test("Should include createdAt timestamp", () => {
  const beforeSignup = new Date();
  const signupResult = signup("Test User", "Commerce");
  const afterSignup = new Date();

  const createdAt = new Date(signupResult.user!.createdAt);
  return (
    createdAt.getTime() >= beforeSignup.getTime() &&
    createdAt.getTime() <= afterSignup.getTime()
  );
});

// GetGreeting tests
console.log("\nGetGreeting Tests:");
test("Should return welcome message when no user is signed up", () => {
  logout();
  const greeting = getGreeting();
  return (
    greeting.includes("Welcome to SSCPrep") && greeting.includes("sign up")
  );
});

test("Should include user name in greeting", () => {
  signup("Charlie Brown", "Commerce");
  const greeting = getGreeting();
  return greeting.includes("Charlie Brown");
});

test("Should include stream in greeting", () => {
  signup("Test User", "Science");
  const greeting = getGreeting();
  return greeting.includes("Science");
});

test("Should return appropriate time-based greeting", () => {
  signup("Alice", "Arts");
  const greeting = getGreeting();
  const validGreetings = [
    "Good morning",
    "Good afternoon",
    "Good evening",
    "Welcome back",
  ];
  return validGreetings.some((g) => greeting.includes(g));
});

// Logout tests
console.log("\nLogout Tests:");
test("Should clear user after logout", () => {
  signup("Test User", "Science");
  logout();
  return getCurrentUser() === null;
});

test("Should not throw when logging out without a user", () => {
  logout();
  return true; // If we got here, no exception was thrown
});

// IsLoggedIn tests
console.log("\nIsLoggedIn Tests:");
test("Should return true after signup", () => {
  signup("Test User", "Science");
  return isLoggedIn();
});

test("Should return false after logout", () => {
  signup("Test User", "Science");
  logout();
  return !isLoggedIn();
});

// Integration tests
console.log("\nIntegration Tests:");
test("Should handle complete user flow: signup -> greeting -> logout", () => {
  logout();
  const loggedInBefore = isLoggedIn();

  signup("Integration Test", "Science");
  const loggedInAfter = isLoggedIn();
  const greeting = getGreeting();
  const greetingValid = greeting.includes("Integration Test");

  logout();
  const loggedInAfter2 = isLoggedIn();

  return !loggedInBefore && loggedInAfter && greetingValid && !loggedInAfter2;
});

test("Should handle multiple users (last one overwrites)", () => {
  signup("User One", "Science");
  const first = getCurrentUser()?.name === "User One";

  signup("User Two", "Commerce");
  const second =
    getCurrentUser()?.name === "User Two" &&
    getCurrentUser()?.stream === "Commerce";

  return first && second;
});

// Recovery tests
console.log("\nRecovery Tests:");
test("Should provide recovery function that returns boolean", () => {
  const result = recoverFromBrokenStorage();
  return typeof result === "boolean";
});

// Print summary
console.log("\n=== Test Summary ===");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed === 0) {
  console.log("\n✓ All tests passed!");
} else {
  console.log(`\n✗ ${failed} test(s) failed`);
  process.exit(1);
}
