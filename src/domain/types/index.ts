/**
 * Domain Types Index
 *
 * Centralized exports for all domain types
 * Organized by responsibility for clean architecture
 */

// Schema types (from schemas directly to maintain single source of truth)
export type { CreateUserInput, UpdateUserInput } from "../schemas/user.schema";
// Core types
export * from "./common.types";
export * from "./config.types";
// DTO types
export * from "./dto.types";
// Entity types
export * from "./entity.types";
// Route and HTTP types
export type { EmptyParams } from "./route.types";
export { EmptyParamsSchema } from "./route.types";
// Use case types
export * from "./use-case.types";
export type { UserParams } from "./user.types";
export { UserParamsSchema } from "./user.types";

// Validation types
export * from "./validation.types";
