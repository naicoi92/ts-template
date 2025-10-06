/**
 * Domain Interfaces Index
 *
 * Centralized exports for all domain interfaces
 * Follows Clean Architecture - these are core abstractions
 */

// Note: Config interface has been removed - use Config type from domain/types/config.types.ts
// HTTP and routing interfaces
export * from "./http-routing.interface";
// Service interfaces
export * from "./logger.interface";
// Validation interfaces
export * from "./server.interface";
export * from "./user.repository.interface";
export * from "./validation.interface";
