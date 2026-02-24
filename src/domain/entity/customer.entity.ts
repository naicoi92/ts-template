import type { CustomerCreateDto } from "../type";

export class Customer {
	private _data: CustomerCreateDto;

	constructor(data: CustomerCreateDto) {
		this._data = data;
		this.validate();
	}

	private validate() {
		if (!this._data.email) throw new Error("email is required");
		if (!this._data.email.includes("@"))
			throw new Error("invalid email format");
		if (!this._data.id) throw new Error("id is required");
	}

	get id(): number {
		return this._data.id;
	}

	get email(): string {
		return this._data.email;
	}

	get createdAt(): Date {
		return this._data.createdAt;
	}

	get updatedAt(): Date {
		return this._data.updatedAt;
	}

	equals(customer: Customer): boolean {
		return this._data.email === customer._data.email;
	}
}
