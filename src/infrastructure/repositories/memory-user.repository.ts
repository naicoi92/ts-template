import { injectable } from "tsyringe";
import { ConflictError } from "@/domain/errors/conflict.error";
import { NotFoundError } from "@/domain/errors/not-found.error";
import type { IUserRepository } from "@/domain/interfaces/user.repository.interface";
import type { User } from "@/domain/types/entity.types";

@injectable()
export class MemoryUserRepository implements IUserRepository {
	private users: Map<string, User> = new Map();
	private idCounter = 1;

	async findById(id: string): Promise<User> {
		const user = this.users.get(id);
		if (!user) {
			throw new NotFoundError("User", id);
		}
		return user;
	}

	async findAll(): Promise<User[]> {
		return Array.from(this.users.values());
	}

	async create(
		userData: Omit<User, "id" | "createdAt" | "updatedAt">,
	): Promise<User> {
		// Check for duplicate email
		const existingUser = Array.from(this.users.values()).find(
			(user) => user.email === userData.email,
		);
		if (existingUser) {
			throw new ConflictError(
				"User with this email already exists",
				"User",
				"email",
			);
		}

		const id = String(this.idCounter++);
		const now = new Date();
		const user: User = {
			id,
			...userData,
			createdAt: now,
			updatedAt: now,
		};
		this.users.set(id, user);
		return user;
	}

	async update(id: string, userData: Partial<User>): Promise<User> {
		const user = this.users.get(id);
		if (!user) {
			throw new NotFoundError("User", id);
		}

		// Check for duplicate email if email is being updated
		if (userData.email && userData.email !== user.email) {
			const existingUser = Array.from(this.users.values()).find(
				(u) => u.email === userData.email && u.id !== id,
			);
			if (existingUser) {
				throw new ConflictError(
					"User with this email already exists",
					"User",
					"email",
				);
			}
		}

		const updatedUser: User = {
			...user,
			...userData,
			id: user.id, // ID không thể thay đổi
			createdAt: user.createdAt, // createdAt không thể thay đổi
			updatedAt: new Date(),
		};

		this.users.set(id, updatedUser);
		return updatedUser;
	}

	async delete(id: string): Promise<boolean> {
		return this.users.delete(id);
	}
}
