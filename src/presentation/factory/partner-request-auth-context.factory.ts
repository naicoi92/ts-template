import type { AuthContext } from "../../application/proxy/usecase-partner-auth.proxy";
import type { HeaderProvider } from "../../domain/interface/header-provider.interface";
import type { SignatureVerificationRequest } from "../../domain/interface/signature-verifier.interface";

export class PartnerRequestAuthContextFactory {
	create(input: {
		headers: HeaderProvider;
		method: string;
		pathname: string;
		data?: unknown;
	}): AuthContext {
		const request: SignatureVerificationRequest = {
			method: input.method,
			pathname: input.pathname,
			timestamp: input.headers.get("x-timestamp") ?? "",
		};

		if (input.data !== undefined) {
			request.data = input.data;
		}

		return {
			partnerName: input.headers.get("x-partner-name") ?? "",
			signature: input.headers.get("x-signature") ?? "",
			request: request,
		};
	}
}
