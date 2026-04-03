import type { RequestHeader } from "../interface";

/**
 * Raw authentication source data from partner request.
 *
 * Used by proxy-owned derivation to pass auth-related request
 * information without coupling to specific HTTP frameworks.
 */
export type PartnerAuthSource = {
	headers: RequestHeader;
	method: string;
	pathname: string;
};
