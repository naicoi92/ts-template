import type { User } from "@/domain/types/entity.types";

export interface IUserRepository {
	findById(id: string): Promise<User>;
	findAll(): Promise<User[]>;
	create(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
	update(id: string, user: Partial<User>): Promise<User>;
	delete(id: string): Promise<boolean>;
}
