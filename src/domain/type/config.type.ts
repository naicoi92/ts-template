import type z from "zod";
import type { ConfigSchema, DatabaseConfigSchema, EnvSchema } from "../schema";

export type EnvConfigDto = z.infer<typeof EnvSchema>;
export type DatabaseConfigDto = z.infer<typeof DatabaseConfigSchema>;
export type ConfigDto = z.infer<typeof ConfigSchema>;
