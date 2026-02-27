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
import {
	DatabaseHealthCheckService,
	TimestampInvoiceCodeGenerator,
} from "../infrastructure/service";
import {
	CreateInvoiceHandler,
	GetInvoiceHandler,
	HealthHandler,
} from "../presentation/handler";
import { BunRoutes } from "../presentation/routes";

export const container = createContainer();

container.register({
	// Config & Logger
	config: asClass(AppConfig).singleton(),
	logger: asClass(LogLayerLogger).singleton(),
	logTransports: asFunction(() => [
		container.build(LogPinoTransport),
		container.build(LogConsoleTransport),
	]).singleton(),

	// Database
	kysely: asClass(KyselyDatabase).singleton(),

	// Repositories
	invoiceRepository: asClass(KyselyInvoiceRepository).singleton(),
	customerRepository: asClass(KyselyCustomerRepository).singleton(),

	// Services
	invoiceCodeGenerator: asClass(TimestampInvoiceCodeGenerator).singleton(),
	healthCheckService: asClass(DatabaseHealthCheckService).singleton(),

	// Use Cases
	createInvoiceUseCase: asClass(CreateInvoiceUseCase).singleton(),
	getInvoiceUseCase: asClass(GetInvoiceUseCase).singleton(),

	// Handlers (must be Handler[])
	handlers: asFunction(() => [
		container.build(HealthHandler),
		container.build(CreateInvoiceHandler),
		container.build(GetInvoiceHandler),
	]).singleton(),

	// Routes & Server
	routes: asClass(BunRoutes).singleton(),
	server: asClass(BunServer).singleton(),
});
