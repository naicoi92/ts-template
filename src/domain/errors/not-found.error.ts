export class NotFoundError extends Error {
	constructor(
		public resource: string,
		public identifier: string,
	) {
		super(`${resource} with identifier ${identifier} not found`);
		this.name = "NotFoundError";
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}
}
