/**
 * Presentation error for invalid HTTP method
 * Thrown when request method doesn't match handler's expected method
 */
export class InvalidRequestMethodError extends Error {
	constructor(public readonly method: string) {
		super(`Invalid method: ${method}`);
		this.name = "InvalidRequestMethodError";
	}
}

/**
 * Presentation error for JSON body parsing failure
 * Thrown when request body cannot be parsed as JSON
 */
export class InvalidJsonBodyError extends Error {
	constructor(public readonly reason: string) {
		super(`Invalid JSON body: ${reason}`);
		this.name = "InvalidJsonBodyError";
	}
}

/**
 * Presentation error for URL-encoded body parsing failure
 * Thrown when request body cannot be parsed as form-urlencoded
 */
export class InvalidTextBodyError extends Error {
	constructor(public readonly reason: string) {
		super(`Invalid TEXT body: ${reason}`);
		this.name = "InvalidTextBodyError";
	}
}
