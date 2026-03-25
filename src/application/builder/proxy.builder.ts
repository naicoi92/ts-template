export type ProxyCtor<T, D = void> = new (
	target: T,
	deps: [D] extends [void] ? D | undefined : D,
) => T;

export class ProxyBuilder<T> {
	constructor(private current: T) {}

	withProxy<D = void>(
		ProxyClass: ProxyCtor<T, D>,
		deps?: [D] extends [void] ? D | undefined : D,
	): this {
		this.current = new ProxyClass(this.current, deps as [D] extends [void] ? D | undefined : D);
		return this;
	}

	build(): T {
		return this.current;
	}
}
