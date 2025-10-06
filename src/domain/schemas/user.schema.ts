import z from "zod";

/**
 * User Domain Schemas
 *
 * Zod schemas for user data validation following Clean Architecture principles
 * These schemas define the validation rules for user-related data structures
 */

/**
 * Email validation schema with proper format checking
 */
const EmailSchema = z.email().toLowerCase().trim();

/**
 * Name validation schema with length constraints
 */
const NameSchema = z
	.string()
	.min(1, { error: "Name is required" })
	.max(100, { error: "Name must be less than 100 characters" })
	.trim();

/**
 * Schema for creating a new user
 * Validates required fields with proper formatting
 */
export const CreateUserSchema = z.object({
	name: NameSchema,
	email: EmailSchema,
});

/**
 * Schema for updating an existing user
 * All fields are optional for partial updates
 */
export const UpdateUserSchema = z
	.object({
		name: NameSchema.optional(),
		email: EmailSchema.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided for update",
	});

/**
 * Schema for user ID route parameters
 * Used for GET /users/:id endpoint
 */
export const UserParamsSchema = z.object({
	id: z.string().min(1, { error: "User ID is required" }),
});
