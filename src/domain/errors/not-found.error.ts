import { ApplicationError } from "./application.error";

export class NotFoundError extends ApplicationError {
	constructor(
		public resource: string,
		public identifier: string,
	) {
		super(
			`${resource} with identifier ${identifier} not found`,
			"NOT_FOUND",
			404,
			{ resource, identifier },
		);
	}
}
