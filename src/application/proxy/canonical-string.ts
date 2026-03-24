/**
 * Builds a deterministic canonical string for signature verification.
 * Format: METHOD + "\n" + PATHNAME + "\n" + DATA_JSON_OR_EMPTY
 *
 * Object keys are sorted recursively to ensure deterministic output
 * regardless of original key order.
 */

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function sortKeys(value: JsonValue): JsonValue {
	if (value === null || typeof value !== "object") {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map(sortKeys);
	}

	const sortedEntries = Object.entries(value)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([k, v]) => [k, sortKeys(v)]);

	return Object.fromEntries(sortedEntries);
}

export function buildCanonicalString(method: string, pathname: string, data?: unknown): string {
	const upperMethod = method.toUpperCase();

	let dataSegment = "";
	if (data !== undefined && data !== null) {
		const sorted = sortKeys(data as JsonValue);
		dataSegment = JSON.stringify(sorted);
	}

	return `${upperMethod}\n${pathname}\n${dataSegment}`;
}
