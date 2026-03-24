export class PartnerNotFoundError extends Error {
	constructor(partnerId: number) {
		super(`partner with id ${partnerId} not found`);
	}
}

export class CreatePartnerError extends Error {
	constructor(name: string, error: Error) {
		super(`failed to create partner ${name}: ${error.message}`);
	}
}
