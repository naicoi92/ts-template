export type ProxyCtor<T, D = void> = [D] extends [void]
	? new (target: T) => T
	: new (target: T, deps: D) => T;

type ProxyDeps<C extends new (target: any, ...args: any[]) => any> =
	ConstructorParameters<C> extends [any, infer D, ...any[]] ? D : void;
type ProxyDepsArgs<C extends new (target: any, ...args: any[]) => any> = [ProxyDeps<C>] extends [
	void,
]
	? [] | [deps: ProxyDeps<C>]
	: [deps: ProxyDeps<C>];

export class ProxyBuilder<T> {
	constructor(private current: T) {}

	withProxy<C extends new (target: T, ...args: any[]) => T>(
		ProxyClass: C,
		...[deps]: ProxyDepsArgs<C>
	): this {
		if (deps === undefined) {
			this.current = new ProxyClass(this.current);
			return this;
		}

		this.current = new ProxyClass(this.current, deps);
		return this;
	}

	build(): T {
		return this.current;
	}
}
