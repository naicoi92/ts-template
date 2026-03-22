import type z from "zod";
import type { HealthResponseSchema, HealthStatusSchema } from "../schema";

export type HealthStatus = z.infer<typeof HealthStatusSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
