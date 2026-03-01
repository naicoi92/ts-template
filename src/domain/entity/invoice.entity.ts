import { InvoiceStatus } from "../enum";
import type { InvoiceSelectDto } from "../type";

export class Invoice {
	constructor(private _data: InvoiceSelectDto) {}

	get invoiceId(): number {
		if (!this._data.invoiceId) throw new Error("invoiceId not found");
		return this._data.invoiceId;
	}

	get code(): string {
		if (!this._data.code) throw new Error("code not found");
		return this._data.code;
	}

	get email(): string {
		if (!this._data.email) throw new Error("email not found");
		return this._data.email;
	}

	get orderId(): string {
		if (!this._data.orderId) throw new Error("orderId not found");
		return this._data.orderId;
	}

	get amount(): number {
		if (!this._data.amount) throw new Error("amount not found");
		return this._data.amount;
	}

	get customerId(): number {
		if (!this._data.customerId) throw new Error("customerId not found");
		return this._data.customerId;
	}

	get createdAt(): Date {
		if (!this._data.createdAt) throw new Error("createdAt not found");
		return this._data.createdAt;
	}

	get updatedAt(): Date {
		if (!this._data.updatedAt) throw new Error("updatedAt not found");
		return this._data.updatedAt;
	}

	get status(): InvoiceStatus {
		if (!this._data.status) throw new Error("status not found");
		return this._data.status;
	}

	get isPaid(): boolean {
		return this.status === InvoiceStatus.PAID;
	}

	isAmountMatch(amount: number): boolean {
		return this.amount === amount;
	}
}
