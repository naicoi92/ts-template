/**
 * DTO (Data Transfer Object) Types
 *
 * Types for data transfer between layers
 * Domain layer definitions for application DTOs
 */

/**
 * User related DTOs
 */
export interface UserResponseDto {
	id: string;
	name: string;
	email: string;
	createdAt: string;
	updatedAt: string;
}
