export class PartnerNotFoundError extends Error {
	constructor(name: string) {
		super(`partner with name "${name}" not found`);
	}
}
