/**
 * Entity Types
 *
 * Core domain entity types
 * These represent the main business objects
 */

/**
 * User entity - core business object
 */
export interface User {
	id: string;
	name: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
}
