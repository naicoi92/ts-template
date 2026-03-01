import type { CustomerSelectDto } from "../type";

export class Customer {
	constructor(private _data: CustomerSelectDto) {}

	get customerId(): number {
		if (!this._data.customerId) throw new Error("customerId not found");
		return this._data.customerId;
	}

	get email(): string {
		if (!this._data.email) throw new Error("email not found");
		return this._data.email;
	}

	get createdAt(): Date {
		if (!this._data.createdAt) throw new Error("createdAt not found");
		return this._data.createdAt;
	}

	get updatedAt(): Date {
		if (!this._data.updatedAt) throw new Error("updatedAt not found");
		return this._data.updatedAt;
	}
}
