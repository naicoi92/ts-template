import { CustomerFieldNotFoundError } from "../error";
import type { CustomerSelectDto } from "../type";

export class Customer {
	constructor(private _data: CustomerSelectDto) {}

	get customerId(): number {
		if (!this._data.customerId) throw new CustomerFieldNotFoundError("customerId");
		return this._data.customerId;
	}

	get email(): string {
		if (!this._data.email) throw new CustomerFieldNotFoundError("email");
		return this._data.email;
	}

	get createdAt(): Date {
		if (!this._data.createdAt) throw new CustomerFieldNotFoundError("createdAt");
		return this._data.createdAt;
	}

	get updatedAt(): Date {
		if (!this._data.updatedAt) throw new CustomerFieldNotFoundError("updatedAt");
		return this._data.updatedAt;
	}
}
