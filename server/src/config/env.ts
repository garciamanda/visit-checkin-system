import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  PORT: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
});

export const env = envSchema.parse(process.env);
