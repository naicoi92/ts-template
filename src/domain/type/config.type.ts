import type z from "zod";
import type { ConfigSchema, DatabaseConfigSchema } from "../schema";

export type DatabaseConfigDto = z.infer<typeof DatabaseConfigSchema>;
export type ConfigDto = z.infer<typeof ConfigSchema>;
