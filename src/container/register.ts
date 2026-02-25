import { asClass, asValue, createContainer } from "awilix";
import { CreateInvoiceUseCase } from "../application/use-case/create-invoice.use-case";
import { AppConfig } from "../infrastructure/config/app.config";
import { Logger as LoglayerLogger } from "../infrastructure/logger/loglayer.logger";
import { KyselyCustomerRepository } from "../infrastructure/repositories/kysely-customer.repository";
import { KyselyInvoiceRepository } from "../infrastructure/repositories/kysely-invoice.repository";
import { InvoiceRouter } from "../infrastructure/router/invoice.router";
import { BunServer } from "../infrastructure/server/bun.server";
import { CreateInvoiceHandler } from "../presentation/handler/create-invoice.handler";

export const container = createContainer();

container.register({
	config: asValue(AppConfig.instance),
	logger: asClass(LoglayerLogger).singleton(),
	database: asClass(KyselyInvoiceRepository).singleton(),
	invoiceRepository: asClass(KyselyInvoiceRepository).singleton(),
	customerRepository: asClass(KyselyCustomerRepository).singleton(),
	invoiceRouter: asClass(InvoiceRouter).singleton(),
	bunRoutes: asClass(BunRoutes).singleton(),
	bunServer: asClass(BunServer).singleton(),
	createInvoiceHandler: asClass(CreateInvoiceHandler).singleton(),
	createInvoiceUseCase: asClass(CreateInvoiceUseCase).singleton(),
});
