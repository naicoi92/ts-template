export class CustomerNotFoundError extends Error {
	constructor(email: string) {
		super(`customer with email ${email} not found`);
	}
}

export class CreateCustomerError extends Error {
	constructor(email: string, error: Error) {
		super(`failed to create customer with email ${email}: ${error.message}`);
	}
}
