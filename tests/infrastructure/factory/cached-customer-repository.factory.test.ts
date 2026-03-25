import { describe, expect, test, beforeEach } from "bun:test";
import { CachedCustomerRepositoryFactory } from "../../../src/infrastructure/factory/cached-customer-repository.factory";
import { MockCustomerRepository } from "../../mocks/repository.mock";
import { customerFixtures } from "../../fixtures/customer.fixture";

describe("CachedCustomerRepositoryFactory", () => {
	let mockRepo: MockCustomerRepository;
	const counter = { findByEmail: 0, create: 0 };

	beforeEach(() => {
		mockRepo = new MockCustomerRepository();
		counter.findByEmail = 0;
		counter.create = 0;

		const originalFindByEmail = mockRepo.findByEmail.bind(mockRepo);
		const originalCreate = mockRepo.create.bind(mockRepo);

		mockRepo.findByEmail = async (email: string) => {
			counter.findByEmail++;
			return originalFindByEmail(email);
		};

		mockRepo.create = async (data) => {
			counter.create++;
			return originalCreate(data);
		};
	});

	test("1. returns CustomerRepository interface type", async () => {
		const factory = new CachedCustomerRepositoryFactory();
		const cachedRepo = factory.create(mockRepo);

		expect(cachedRepo).toHaveProperty("findByEmail");
		expect(cachedRepo).toHaveProperty("create");
		expect(typeof cachedRepo.findByEmail).toBe("function");
		expect(typeof cachedRepo.create).toBe("function");
	});

	test("2. creates fresh proxy per invocation (no shared cache)", async () => {
		const factory = new CachedCustomerRepositoryFactory();
		const dto = customerFixtures.complete();
		const email = dto.email as string;
		mockRepo.seedCustomer(await import("../../../src/domain/entity").then((m) => new m.Customer({
			customerId: dto.customerId as number,
			email,
			createdAt: dto.createdAt as Date,
			updatedAt: dto.updatedAt as Date,
		})));

		const cachedRepo1 = factory.create(mockRepo);
		await cachedRepo1.findByEmail(email);
		expect(counter.findByEmail).toBe(1);

		const cachedRepo2 = factory.create(mockRepo);
		await cachedRepo2.findByEmail(email);
		expect(counter.findByEmail).toBe(2);
	});

	test("3. each proxy instance has independent cache", async () => {
		const factory = new CachedCustomerRepositoryFactory();
		const dto = customerFixtures.complete();
		const email = dto.email as string;
		mockRepo.seedCustomer(await import("../../../src/domain/entity").then((m) => new m.Customer({
			customerId: dto.customerId as number,
			email,
			createdAt: dto.createdAt as Date,
			updatedAt: dto.updatedAt as Date,
		})));

		const cachedRepo1 = factory.create(mockRepo);
		await cachedRepo1.findByEmail(email);
		expect(counter.findByEmail).toBe(1);

		const cachedRepo2 = factory.create(mockRepo);
		await cachedRepo2.findByEmail(email);
		expect(counter.findByEmail).toBe(2);

		expect((cachedRepo1 as unknown as { customers: Map<string, unknown> }).customers.size).toBe(1);
		expect((cachedRepo2 as unknown as { customers: Map<string, unknown> }).customers.size).toBe(1);
	});

	test("4. proxy delegates to underlying repository", async () => {
		const factory = new CachedCustomerRepositoryFactory();
		const dto = customerFixtures.complete();
		const email = dto.email as string;
		mockRepo.seedCustomer(await import("../../../src/domain/entity").then((m) => new m.Customer({
			customerId: dto.customerId as number,
			email,
			createdAt: dto.createdAt as Date,
			updatedAt: dto.updatedAt as Date,
		})));

		const cachedRepo = factory.create(mockRepo);
		const result = await cachedRepo.findByEmail(email);

		expect(result.email).toBe(email);
		expect(counter.findByEmail).toBe(1);
	});

	test("5. create operation caches result for findByEmail", async () => {
		const factory = new CachedCustomerRepositoryFactory();
		const email = "newcustomer@example.com";

		const cachedRepo = factory.create(mockRepo);
		await cachedRepo.create({ email });

		const result = await cachedRepo.findByEmail(email);
		expect(result.email).toBe(email);
		expect(counter.findByEmail).toBe(0);
	});
});
