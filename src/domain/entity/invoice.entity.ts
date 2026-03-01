import { InvoiceFieldNotFoundError } from "../error";
import { InvoiceStatus } from "../enum";
import type { InvoiceSelectDto } from "../type";

export class Invoice {
	constructor(private _data: InvoiceSelectDto) {}

	get invoiceId(): number {
		if (!this._data.invoiceId) throw new InvoiceFieldNotFoundError("invoiceId");
		return this._data.invoiceId;
	}

	get code(): string {
		if (!this._data.code) throw new InvoiceFieldNotFoundError("code");
		return this._data.code;
	}

	get email(): string {
		if (!this._data.email) throw new InvoiceFieldNotFoundError("email");
		return this._data.email;
	}

	get orderId(): string {
		if (!this._data.orderId) throw new InvoiceFieldNotFoundError("orderId");
		return this._data.orderId;
	}

	get amount(): number {
		if (!this._data.amount) throw new InvoiceFieldNotFoundError("amount");
		return this._data.amount;
	}

	get customerId(): number {
		if (!this._data.customerId) throw new InvoiceFieldNotFoundError("customerId");
		return this._data.customerId;
	}

	get createdAt(): Date {
		if (!this._data.createdAt) throw new InvoiceFieldNotFoundError("createdAt");
		return this._data.createdAt;
	}

	get updatedAt(): Date {
		if (!this._data.updatedAt) throw new InvoiceFieldNotFoundError("updatedAt");
		return this._data.updatedAt;
	}

	get status(): InvoiceStatus {
		if (!this._data.status) throw new InvoiceFieldNotFoundError("status");
		return this._data.status;
	}

	get isPaid(): boolean {
		return this.status === InvoiceStatus.PAID;
	}

	isAmountMatch(amount: number): boolean {
		return this.amount === amount;
	}
}
