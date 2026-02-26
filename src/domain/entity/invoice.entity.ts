import { InvoiceStatus } from "../enum";
import type { InvoiceSelectDto } from "../type";

export class Invoice {
	constructor(private _data: InvoiceSelectDto) {}

	get invoiceId(): number {
		if (!this._data.invoiceId) throw new Error("invoiceId is required");
		return this._data.invoiceId;
	}

	get code(): string {
		if (!this._data.code) throw new Error("code is required");
		return this._data.code;
	}

	get email(): string {
		if (!this._data.email) throw new Error("email is required");
		return this._data.email;
	}

	get orderId(): string {
		if (!this._data.orderId) throw new Error("orderId is required");
		return this._data.orderId;
	}

	get amount(): number {
		if (!this._data.amount) throw new Error("amount is required");
		return this._data.amount;
	}

	get customerId(): number {
		if (!this._data.customerId) throw new Error("customerId is required");
		return this._data.customerId;
	}

	get createdAt(): Date {
		if (!this._data.createdAt) throw new Error("createdAt is required");
		return this._data.createdAt;
	}

	get updatedAt(): Date {
		if (!this._data.updatedAt) throw new Error("updatedAt is required");
		return this._data.updatedAt;
	}

	get status(): InvoiceStatus {
		if (!this._data.status) throw new Error("status is required");
		return this._data.status;
	}

	get isPaid(): boolean {
		return this.status === InvoiceStatus.PAID;
	}
}
