import type { InvoiceSelectDto } from "../type";

export class Invoice {
  constructor(private _data: InvoiceSelectDto) {
  }
  get id(): number {
    if (!this._data.id) throw new Error("invoice id is not defined");
    return this._data.id;
  }
  get email(): string {
    if (!this._data.email) throw new Error("invoice email is not defined");
    return this._data.email;
  }
  get orderId(): string {
    if (!this._data.orderId) throw new Error("invoice orderId is not defined");
    return this._data.orderId;
  }
  get amount(): number {
    if (!this._data.amount) throw new Error("invoice amount is not defined");
    return this._data.amount;
  }
}
