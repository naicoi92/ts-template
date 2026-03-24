import type { UseCase } from "../../src/domain/interface/usecase.interface";

export class MockUseCase<I, O> implements UseCase<I, O> {
	private _execute: (input: I) => Promise<O>;
	private _callCount = 0;
	private _lastInput: I | undefined;

	constructor(options?: { execute?: (input: I) => Promise<O> }) {
		if (options?.execute) {
			this._execute = options.execute;
		} else {
			this._execute = async (input: I) => {
				return { success: true, input } as unknown as O;
			};
		}
	}

	async execute(input: I): Promise<O> {
		this._callCount++;
		this._lastInput = input;
		return this._execute(input);
	}

	get callCount(): number {
		return this._callCount;
	}

	get lastInput(): I | undefined {
		return this._lastInput;
	}

	reset(): void {
		this._callCount = 0;
		this._lastInput = undefined;
	}

	setExecuteFn(fn: (input: I) => Promise<O>): void {
		this._execute = fn;
	}
}
