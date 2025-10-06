import { z } from "zod";

/**
 * User Domain Types
 *
 * Type definitions and schemas related to user entities
 */

/**
 * Schema for user ID route parameters
 * Used for GET /users/:id endpoint
 */
export const UserParamsSchema = z.object({
	id: z.string().min(1, "User ID is required"),
});

/**
 * Type for user ID route parameters
 * Inferred from UserParamsSchema
 */
export type UserParams = z.infer<typeof UserParamsSchema>;
