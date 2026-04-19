/**
 * User Manager - Demo & Example Usage
 * Shows how the accounts feature works
 */

import {
  getCurrentUser,
  getGreeting,
  isLoggedIn,
  logout,
  signup,
} from "./userManager";

// ============================================
// EXAMPLE USAGE DEMONSTRATION
// ============================================

console.log("=== SSCPrep User Manager Demo ===\n");

// 1. Check initial state
console.log("1. Initial state:");
console.log(`   Is logged in: ${isLoggedIn()}`);
console.log(`   Current user: ${getCurrentUser()}`);
console.log(`   Greeting: "${getGreeting()}"`);
console.log();

// 2. Sign up first user
console.log("2. Signing up first user (Raj Kumar, Science):");
const signup1 = signup("Raj Kumar", "Science");
console.log(`   Success: ${signup1.success}`);
console.log(`   User: ${JSON.stringify(signup1.user)}`);
console.log(`   Is logged in: ${isLoggedIn()}`);
console.log(`   Greeting: "${getGreeting()}"`);
console.log();

// 3. Retrieve current user
console.log("3. Retrieving current user:");
const user = getCurrentUser();
console.log(`   Name: ${user?.name}`);
console.log(`   Stream: ${user?.stream}`);
console.log(`   Created: ${user?.createdAt}`);
console.log();

// 4. Sign up different user (overwrites)
console.log("4. Signing up different user (Priya Sharma, Commerce):");
const signup2 = signup("Priya Sharma", "Commerce");
console.log(`   Success: ${signup2.success}`);
console.log(
  `   New user: ${getCurrentUser()?.name} (${getCurrentUser()?.stream})`,
);
console.log(`   Greeting: "${getGreeting()}"`);
console.log();

// 5. Test validation errors
console.log("5. Testing validation (empty name):");
const invalidSignup1 = signup("", "Arts");
console.log(`   Success: ${invalidSignup1.success}`);
console.log(`   Error: ${invalidSignup1.error}`);
console.log();

console.log("6. Testing validation (invalid stream):");
const invalidSignup2 = signup("Test User", "Engineering");
console.log(`   Success: ${invalidSignup2.success}`);
console.log(`   Error: ${invalidSignup2.error}`);
console.log();

// 6. Logout
console.log("7. Logging out:");
logout();
console.log(`   Is logged in: ${isLoggedIn()}`);
console.log(`   Current user: ${getCurrentUser()}`);
console.log(`   Greeting: "${getGreeting()}"`);
console.log();

console.log("=== Demo Complete ===");
