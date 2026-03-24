import { asClass, asFunction, createContainer } from "awilix";
import { AppConfig } from "../infrastructure/config/app.config";
import { KyselyDatabase } from "../infrastructure/database/kysely";
import { LogConsoleTransport, LogLayerLogger, LogPinoTransport } from "../infrastructure/logger";
import {
	KyselyCustomerRepository,
	KyselyInvoiceRepository,
	KyselyPartnerRepository,
} from "../infrastructure/repositories";
import { BunServer } from "../infrastructure/server/bun.server";
import { BunHeaderProvider } from "../infrastructure/server/bun-header-provider";
import {
	DatabaseHealthCheckService,
	HmacSignatureVerifierService,
	TimestampInvoiceCodeGenerator,
} from "../infrastructure/service";
import { CreateInvoiceHandler, GetInvoiceHandler, HealthHandler } from "../presentation/handler";
import { BunRoutes } from "../presentation/routes";
import { JsonBodyParser, FormUrlEncodedBodyParser } from "../presentation/adapter/body-parser";

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
	partnerRepository: asClass(KyselyPartnerRepository).singleton(),

	// Services
	invoiceCodeGenerator: asClass(TimestampInvoiceCodeGenerator).singleton(),
	healthCheckService: asClass(DatabaseHealthCheckService).singleton(),
	signatureVerifier: asClass(HmacSignatureVerifierService).singleton(),

	// Body Parsers
	bodyParsers: asFunction(() => [
		container.build(JsonBodyParser),
		container.build(FormUrlEncodedBodyParser),
	]).singleton(),

	// Header Provider Factory
	headerProviderFactory: asFunction(
		() => (headers: Headers) => new BunHeaderProvider(headers),
	).singleton(),

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
