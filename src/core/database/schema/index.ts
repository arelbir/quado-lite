/**
 * SCHEMA INDEX - CORE FRAMEWORK MODULES ONLY
 * Import order is important for foreign key relationships
 */

// ============================================
// CORE ENUMS
// ============================================
export * from "./enum";

// ============================================
// AUTHENTICATION & AUTHORIZATION
// ============================================
export * from "./auth";

// ============================================
// ORGANIZATION STRUCTURE
// ============================================
export * from "./organization";

// ============================================
// ROLE & PERMISSION SYSTEM
// (Must be before user to allow import)
// ============================================
export * from "./role-system";

// ============================================
// USER MANAGEMENT
// (After role-system so it can import userRoles table)
// ============================================
export * from "./user";

// ============================================
// TEAMS & GROUPS
// ============================================
export * from "./teams-groups";

// ============================================
// MENU SYSTEM
// ============================================
export * from "./menu";

// ============================================
// WORKFLOW ENGINE
// ============================================
export * from "./workflow";
export * from "./workflow-definition";

// ============================================
// CUSTOM FIELDS SYSTEM
// ============================================
export * from "./custom-field";

// ============================================
// HR INTEGRATION
// ============================================
export * from "./hr-sync";

// ============================================
// NOTIFICATION SYSTEM
// ============================================
export * from "./notification";

// ============================================
// FORM BUILDER SYSTEM
// ============================================
export * from "./forms";
