import "reflect-metadata";
import { container } from "tsyringe";

import { loadEnv } from "@common/validators";

import { AppModule } from "./app.module";

async function bootstrap() {
  loadEnv();

  const appModule = container.resolve(AppModule);
  await appModule.initializeModules();
  appModule.start();
}

bootstrap();
