/**
 * Common Domain Types
 *
 * Reusable types used across the application
 */

/**
 * Generic key-value pair type for flexible data structures
 */
export type KeyValuePair<T = unknown> = Record<string, T>;

/**
 * Optional type utility
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Required type utility for nested objects
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
