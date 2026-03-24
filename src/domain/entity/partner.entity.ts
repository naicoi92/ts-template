import { PartnerFieldNotFoundError } from "../error";
import type { PartnerSelectDto } from "../type";

export class Partner {
	constructor(private _data: PartnerSelectDto) {}

	get partnerId(): number {
		if (!this._data.partnerId) throw new PartnerFieldNotFoundError("partnerId");
		return this._data.partnerId;
	}

	get name(): string {
		if (!this._data.name) throw new PartnerFieldNotFoundError("name");
		return this._data.name;
	}

	get token(): string {
		if (!this._data.token) throw new PartnerFieldNotFoundError("token");
		return this._data.token;
	}
}
