import type { ConfigLoader } from "../../domain/interface";
import type { ConfigDto } from "../../domain/type";

export class EnvConfigLoader implements ConfigLoader {
	load(): ConfigDto {
		throw new Error("Method not implemented.");
	}
}
