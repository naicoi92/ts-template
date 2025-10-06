import { injectable } from "tsyringe";
import type { IUserRepository } from "@/domain/interfaces/user.repository.interface";
import type { User } from "@/domain/types/entity.types";

@injectable()
export class MemoryUserRepository implements IUserRepository {
	private users: Map<string, User> = new Map();
	private idCounter = 1;

	async findById(id: string): Promise<User | null> {
		return this.users.get(id) || null;
	}

	async findAll(): Promise<User[]> {
		return Array.from(this.users.values());
	}

	async create(
		userData: Omit<User, "id" | "createdAt" | "updatedAt">,
	): Promise<User> {
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

	async update(id: string, userData: Partial<User>): Promise<User | null> {
		const user = this.users.get(id);
		if (!user) {
			return null;
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
