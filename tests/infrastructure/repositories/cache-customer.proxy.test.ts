import { describe, expect, test, beforeEach } from "bun:test";
import { CustomerNotFoundError } from "../../../src/domain/error";
import { CacheCustomerProxy } from "../../../src/infrastructure/repositories/cache-customer.proxy";
import { MockCustomerRepository } from "../../mocks/repository.mock";
import { customerFixtures } from "../../fixtures/customer.fixture";

describe("CacheCustomerProxy", () => {
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

	test("1. cache hit returns customer without calling underlying repo", async () => {
		const dto = customerFixtures.complete();
		const email = dto.email as string;
		mockRepo.seedCustomer(await import("../../../src/domain/entity").then((m) => new m.Customer({
			customerId: dto.customerId as number,
			email,
			createdAt: dto.createdAt as Date,
			updatedAt: dto.updatedAt as Date,
		})));

		const proxy = new CacheCustomerProxy({ customerRepository: mockRepo });

		await proxy.findByEmail(email);
		expect(counter.findByEmail).toBe(1);

		await proxy.findByEmail(email);
		expect(counter.findByEmail).toBe(1);
	});

	test("2. cache miss calls underlying repo and caches result", async () => {
		const dto = customerFixtures.complete();
		const email = dto.email as string;
		mockRepo.seedCustomer(await import("../../../src/domain/entity").then((m) => new m.Customer({
			customerId: dto.customerId as number,
			email,
			createdAt: dto.createdAt as Date,
			updatedAt: dto.updatedAt as Date,
		})));

		const proxy = new CacheCustomerProxy({ customerRepository: mockRepo });

		const result = await proxy.findByEmail(email);

		expect(result.email).toBe(email);
		expect(counter.findByEmail).toBe(1);
		expect((proxy as unknown as { customers: Map<string, unknown> }).customers.has(email)).toBe(true);
	});

	test("3. cache miss + not found triggers auto-create via create({ email })", async () => {
		const email = "notfound@example.com";

		class CustomerNotFoundRepo extends MockCustomerRepository {
			override async findByEmail(_email: string): Promise<never> {
				throw new CustomerNotFoundError(_email);
			}
		}

		const notFoundRepo = new CustomerNotFoundRepo();
		const originalCreate = notFoundRepo.create.bind(notFoundRepo);
		notFoundRepo.create = async (data) => {
			counter.create++;
			return originalCreate(data);
		};

		const proxy = new CacheCustomerProxy({ customerRepository: notFoundRepo });

		const result = await proxy.findByEmail(email);

		expect(counter.create).toBe(1);
		expect(result.email).toBe(email);
		// Result should be cached
		expect((proxy as unknown as { customers: Map<string, unknown> }).customers.has(email)).toBe(true);
	});

	test("4. non-CustomerNotFoundError propagates unchanged", async () => {
		const email = "error@example.com";

		class OtherErrorRepo extends MockCustomerRepository {
			override async findByEmail(_email: string): Promise<never> {
				throw new Error("database connection lost");
			}
		}

		const errorRepo = new OtherErrorRepo();
		const proxy = new CacheCustomerProxy({ customerRepository: errorRepo });

		await expect(proxy.findByEmail(email)).rejects.toThrow("database connection lost");
		await expect(proxy.findByEmail(email)).rejects.not.toThrow(CustomerNotFoundError);
	});

	test("5. fresh proxy per test verifies per-request semantics", async () => {
		const dto = customerFixtures.complete();
		const email = dto.email as string;
		mockRepo.seedCustomer(await import("../../../src/domain/entity").then((m) => new m.Customer({
			customerId: dto.customerId as number,
			email,
			createdAt: dto.createdAt as Date,
			updatedAt: dto.updatedAt as Date,
		})));

		const proxy1 = new CacheCustomerProxy({ customerRepository: mockRepo });
		await proxy1.findByEmail(email);
		expect(counter.findByEmail).toBe(1);

		const proxy2 = new CacheCustomerProxy({ customerRepository: mockRepo });
		await proxy2.findByEmail(email);
		expect(counter.findByEmail).toBe(2);

		expect((proxy1 as unknown as { customers: Map<string, unknown> }).customers.size).toBe(1);
		expect((proxy2 as unknown as { customers: Map<string, unknown> }).customers.size).toBe(1);
	});

	test("6. create caches the customer for future findByEmail", async () => {
		const email = "newcustomer@example.com";
		const proxy = new CacheCustomerProxy({ customerRepository: mockRepo });

		await proxy.create({ email });

		// findByEmail should now return the created customer from cache
		const result = await proxy.findByEmail(email);
		expect(result.email).toBe(email);
		// Underlying repo should NOT have been called since it's cached
		expect(counter.findByEmail).toBe(0);
	});
});
