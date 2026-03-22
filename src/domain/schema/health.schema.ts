import z from "zod";

export const HealthStatusSchema = z.object({
	status: z.enum(["healthy", "unhealthy", "degraded"]),
	timestamp: z.string(),
	error: z.unknown().optional(),
	details: z.record(z.string(), z.unknown()).optional(),
});
export const HealthResponseSchema = HealthStatusSchema.pick({
	status: true,
	timestamp: true,
});
