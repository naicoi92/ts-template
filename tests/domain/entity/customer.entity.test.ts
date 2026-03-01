import { describe, expect, test } from "bun:test";
import { CustomerFieldNotFoundError } from "../../../src/domain/error";
import { Customer } from "../../../src/domain/entity";
import { customerFixtures } from "../../fixtures/index.ts";

describe("Customer Entity", () => {
	describe("constructor", () => {
		test("should create customer with complete data", () => {
			const data = customerFixtures.complete();
			const customer = new Customer(data);

			expect(customer).toBeDefined();
		});

		test("should create customer with minimal data", () => {
			const data = customerFixtures.minimal();
			const customer = new Customer(data);

			expect(customer).toBeDefined();
		});
	});

	describe("getters", () => {
		test("should return customerId when present", () => {
			const data = customerFixtures.complete();
			const customer = new Customer(data);

			expect(customer.customerId).toBe(1);
		});

		test("should throw CustomerFieldNotFoundError when customerId is missing", () => {
			const data = customerFixtures.minimal();
			const customer = new Customer(data);

			expect(() => customer.customerId).toThrow(CustomerFieldNotFoundError);
		});

		test("should return email when present", () => {
			const data = customerFixtures.complete();
			const customer = new Customer(data);

			expect(customer.email).toBe("customer@example.com");
		});

		test("should throw CustomerFieldNotFoundError when email is missing", () => {
			const customer = new Customer({});

			expect(() => customer.email).toThrow(CustomerFieldNotFoundError);
		});

		test("should return createdAt when present", () => {
			const data = customerFixtures.complete();
			const customer = new Customer(data);

			expect(customer.createdAt).toBeInstanceOf(Date);
		});

		test("should throw CustomerFieldNotFoundError when createdAt is missing", () => {
			const data = customerFixtures.minimal();
			const customer = new Customer(data);

			expect(() => customer.createdAt).toThrow(CustomerFieldNotFoundError);
		});

		test("should return updatedAt when present", () => {
			const data = customerFixtures.complete();
			const customer = new Customer(data);

			expect(customer.updatedAt).toBeInstanceOf(Date);
		});

		test("should throw CustomerFieldNotFoundError when updatedAt is missing", () => {
			const data = customerFixtures.minimal();
			const customer = new Customer(data);

			expect(() => customer.updatedAt).toThrow(CustomerFieldNotFoundError);
		});
	});
});
