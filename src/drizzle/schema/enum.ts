/**
 * CORE ENUMS
 * Framework-level enums only
 * Domain-specific enums should be defined in their respective modules
 */

import { pgEnum } from "drizzle-orm/pg-core"
import { z } from "zod"

// ============================================
// AUTHENTICATION ENUMS (Supabase/NextAuth)
// ============================================
export const keyStatus = pgEnum("key_status", ['default', 'valid', 'invalid', 'expired'])
export const keyType = pgEnum("key_type", ['aead-ietf', 'aead-det', 'hmacsha512', 'hmacsha256', 'auth', 'shorthash', 'generichash', 'kdf', 'secretbox', 'secretstream', 'stream_xchacha20'])
export const factorType = pgEnum("factor_type", ['totp', 'webauthn'])
export const factorStatus = pgEnum("factor_status", ['unverified', 'verified'])
export const aalLevel = pgEnum("aal_level", ['aal1', 'aal2', 'aal3'])
export const codeChallengeMethod = pgEnum("code_challenge_method", ['s256', 'plain'])
export const equalityOp = pgEnum("equality_op", ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in'])
export const action = pgEnum("action", ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ERROR'])

// ============================================
// USER & ROLE ENUMS
// ============================================
// ⚠️ DEPRECATED: Legacy single-role system
// Use role-system.ts (roles, userRoles tables) instead
export const userRole = pgEnum("UserRole", ['user', 'admin', 'superAdmin'])
export const userStatus = pgEnum("UserStatus", ['active', 'inactive'])

// ============================================
// MENU ENUMS
// ============================================
export const menuStatus = pgEnum("MenuStatus", ['active', 'inactive'])
export const menuType = pgEnum("MenuType", ['menu', 'button', 'dir'])

// ============================================
// UI/UX ENUMS
// ============================================
export const theme = pgEnum("Theme", ['light', 'dark', 'system'])

// ============================================
// ZOD TYPE EXPORTS
// ============================================
export const Theme = z.enum(theme.enumValues)
export type Theme = z.infer<typeof Theme>

export const KeyStatus = z.enum(keyStatus.enumValues)
export type KeyStatus = z.infer<typeof KeyStatus>

export const KeyType = z.enum(keyType.enumValues)
export type KeyType = z.infer<typeof KeyType>

export const FactorType = z.enum(factorType.enumValues)
export type FactorType = z.infer<typeof FactorType>

export const FactorStatus = z.enum(factorStatus.enumValues)
export type FactorStatus = z.infer<typeof FactorStatus>

export const AalLevel = z.enum(aalLevel.enumValues)
export type AalLevel = z.infer<typeof AalLevel>

export const CodeChallengeMethod = z.enum(codeChallengeMethod.enumValues)
export type CodeChallengeMethod = z.infer<typeof CodeChallengeMethod>

export const EqualityOp = z.enum(equalityOp.enumValues)
export type EqualityOp = z.infer<typeof EqualityOp>

export const Action = z.enum(action.enumValues)
export type Action = z.infer<typeof Action>

export const UserRole = z.enum(userRole.enumValues)
export type UserRole = z.infer<typeof UserRole>

export const MenuType = z.enum(menuType.enumValues)
export type MenuType = z.infer<typeof MenuType>

export const MenuStatus = z.enum(menuStatus.enumValues)
export type MenuStatus = z.infer<typeof MenuStatus>

export const UserStatus = z.enum(userStatus.enumValues)
export type UserStatus = z.infer<typeof UserStatus>