import type { HttpRouter } from "@/application/services/http-router.service";
import { container } from "@/container";
import { TOKENS } from "@/tokens";

export default {
	fetch(request: Request) {
		const router = container.resolve<HttpRouter>(TOKENS.HTTP_ROUTER);
		return router.handle(request);
	},
};
