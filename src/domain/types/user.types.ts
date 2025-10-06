import type z from "zod";
import type {
	CreateUserSchema,
	UpdateUserSchema,
	UserParamsSchema,
} from "../schemas/user.schema";

/**
 * User Domain Types
 *
 * Type definitions related to user entities
 */

/**
 * Type for user ID route parameters
 * Inferred from UserParamsSchema
 */
export type UserParams = z.infer<typeof UserParamsSchema>;

/**
 * Type for creating a new user
 * Inferred from CreateUserSchema
 */
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

/**
 * Type for updating an existing user
 * Inferred from UpdateUserSchema
 */
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
