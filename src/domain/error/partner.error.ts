export class PartnerNotFoundError extends Error {
	constructor(name: string) {
		super(`partner with name "${name}" not found`);
	}
}

export class CreatePartnerError extends Error {
	constructor(name: string, error: Error) {
		super(`failed to create partner ${name}: ${error.message}`);
	}
}
