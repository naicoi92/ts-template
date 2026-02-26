import { asClass, asFunction, createContainer } from "awilix";
import { CreateInvoiceUseCase } from "../application/use-case/create-invoice.use-case";
import { GetInvoiceUseCase } from "../application/use-case/get-invoice.use-case";
import { AppConfig } from "../infrastructure/config/app.config";
import { KyselyDatabase } from "../infrastructure/database/kysely";
import {
	LogConsoleTransport,
	LogLayerLogger,
	LogPinoTransport,
} from "../infrastructure/logger";
import {
	KyselyCustomerRepository,
	KyselyInvoiceRepository,
} from "../infrastructure/repositories";
import { BunServer } from "../infrastructure/server/bun.server";
import { CreateInvoiceHandler } from "../presentation/handler/create-invoice.handler";
import { GetInvoiceHandler } from "../presentation/handler/get-invoice.handler";

export const container = createContainer();

container.register({
	config: asClass(AppConfig).singleton(),
	logger: asClass(LogLayerLogger).singleton(),
	logTransports: asFunction(() => [
		container.build(LogPinoTransport),
		container.build(LogConsoleTransport),
	]).singleton(),
	kysely: asClass(KyselyDatabase).singleton(),
	invoiceRepository: asClass(KyselyInvoiceRepository).singleton(),
	customerRepository: asClass(KyselyCustomerRepository).singleton(),
	createInvoiceUseCase: asClass(CreateInvoiceUseCase).singleton(),
	getInvoiceUseCase: asClass(GetInvoiceUseCase).singleton(),
	server: asClass(BunServer).singleton(),
	handlers: asFunction(() => [
		container.build(CreateInvoiceHandler),
		container.build(GetInvoiceHandler),
	]).singleton(),
});
