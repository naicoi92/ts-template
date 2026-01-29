import type { CustomerSelectDto } from "../type";

export class Customer {
  constructor(private _data: CustomerSelectDto) { }
  get id(): number {
    if (!this._data.id) throw new Error("customer id is not defined");
    return this._data.id;
  }
  get email(): string {
    if (!this._data.email) throw new Error("customer email is not defined");
    return this._data.email;
  }
}
