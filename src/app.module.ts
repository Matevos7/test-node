import "reflect-metadata";
import path from "path";

import express from "express";
import { container, singleton } from "tsyringe";

import { KafkaModule } from "@common/modules";
import { LoggerService } from "@common/services";

const app = express();
@singleton()
export class AppModule {
  constructor() {
    app.use("/public", express.static(path.resolve(__dirname, "../public/")));
    container.registerInstance("App", app);
    container.resolve(LoggerService);
  }

  public async initializeModules() {
    const kafkaModule = container.resolve(KafkaModule);
    await kafkaModule.initialize();
  }

  public start() {
    const PORT = process.env.PORT || 3000;
    const logger = container.resolve(LoggerService);
    app.listen(PORT, () => {
      logger.info(`Server started on http://localhost:${PORT}`);
    });
  }
}
