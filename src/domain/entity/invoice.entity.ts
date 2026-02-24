import type { InvoiceSelectDto } from "../type";

export class Invoice {
	constructor(private _data: InvoiceSelectDto) {
		this.validate();
	}

	private validate() {
		if (!this._data.orderId) throw new Error("orderId is required");
		if (!this._data.amount || this._data.amount <= 0)
			throw new Error("amount must be greater than 0");
		if (!this._data.customerId) throw new Error("customerId is required");
	}

	get id(): number {
		return this._data.id;
	}

	get email(): string {
		return this._data.email;
	}

	get orderId(): string {
		return this._data.orderId;
	}

	get amount(): number {
		return this._data.amount;
	}

	get customerId(): number {
		return this._data.customerId;
	}

	get createdAt(): Date {
		return this._data.createdAt;
	}

	get updatedAt(): Date {
		return this._data.updatedAt;
	}

	equals(invoice: Invoice): boolean {
		return this._data.orderId === invoice._data.orderId;
	}
}
