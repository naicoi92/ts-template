import { asClass, createContainer } from "awilix";
import { CreateInvoiceUseCase } from "../application/use-case/create-invoice.use-case";
import { AppConfig } from "../infrastructure/config/app.config";
import { KyselyDatabase } from "../infrastructure/database/kysely";
import { LogLayerLogger } from "../infrastructure/logger";
import {
	KyselyCustomerRepository,
	KyselyInvoiceRepository,
} from "../infrastructure/repositories";
import { BunServer } from "../infrastructure/server/bun.server";
import { CreateInvoiceHandler } from "../presentation/handler/create-invoice.handler";
import { BunRoutes } from "../presentation/routes/bun.routes";

export const container = createContainer();

container.register({
	config: asClass(AppConfig).singleton(),
	logger: asClass(LogLayerLogger).singleton(),
	database: asClass(KyselyDatabase).singleton(),
	invoiceRepository: asClass(KyselyInvoiceRepository).singleton(),
	customerRepository: asClass(KyselyCustomerRepository).singleton(),
	createInvoiceHandler: asClass(CreateInvoiceHandler).singleton(),
	createInvoiceUseCase: asClass(CreateInvoiceUseCase).singleton(),
	bunRoutes: asClass(BunRoutes).singleton(),
	bunServer: asClass(BunServer).singleton(),
});
