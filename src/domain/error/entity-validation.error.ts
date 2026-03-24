/**
 * Domain error for Customer entity field validation
 * Thrown when a required field is missing in Customer entity
 */
export class CustomerFieldNotFoundError extends Error {
	constructor(public readonly field: "customerId" | "email" | "createdAt" | "updatedAt") {
		super(`${field} not found`);
		this.name = "CustomerFieldNotFoundError";
	}
}

/**
 * Domain error for Invoice entity field validation
 * Thrown when a required field is missing in Invoice entity
 */
export class InvoiceFieldNotFoundError extends Error {
	constructor(
		public readonly field:
			| "invoiceId"
			| "code"
			| "email"
			| "orderId"
			| "amount"
			| "customerId"
			| "createdAt"
			| "updatedAt"
			| "status",
	) {
		super(`${field} not found`);
		this.name = "InvoiceFieldNotFoundError";
	}
}

/**
 * Domain error for Partner entity field validation
 * Thrown when a required field is missing in Partner entity
 */
export class PartnerFieldNotFoundError extends Error {
	constructor(
		public readonly field: "partnerId" | "name" | "token",
	) {
		super(`${field} not found`);
		this.name = "PartnerFieldNotFoundError";
	}
}
