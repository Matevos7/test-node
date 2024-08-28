import { config } from "dotenv";
import Joi from "joi";

const schema = Joi.object({
  PORT: Joi.number().default(3000),
});

export function validateEnv(): void {
  const { error } = schema.validate(process.env, {
    abortEarly: false,
    allowUnknown: true,
  });
  if (error) {
    console.error("Environment variable validation error:");
    error.details.forEach((err) => {
      console.error(err.message);
    });
    process.exit(1);
  }
}

export function loadEnv(): void {
  config();
  validateEnv();
}
