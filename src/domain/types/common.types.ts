import { z } from "zod";

/**
 * Common Domain Types
 *
 * Reusable types and schemas used across the application
 */

/**
 * Schema for empty route parameters
 * Used by handlers that don't require any URL parameters
 */
export const EmptyParamsSchema = z.object({});

/**
 * Type for empty route parameters
 * Inferred from EmptyParamsSchema
 */
export type EmptyParams = z.infer<typeof EmptyParamsSchema>;
