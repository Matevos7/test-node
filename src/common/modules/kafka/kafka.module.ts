import { container } from "tsyringe";

import { Topic } from "@common/enums";
import { LoggerService } from "@common/services";

import { KafkaService } from "./kafka.service";

export class KafkaModule {
  constructor() {
    container.registerSingleton(KafkaService);
  }

  public async initialize(): Promise<void> {
    const kafkaService = container.resolve(KafkaService);
    const logger = container.resolve(LoggerService);

    await kafkaService.connectProducer();
    await kafkaService.connectConsumer();
    await kafkaService.consumeMessages(Topic.FILE_CREATED);
    logger.info("Kafka module initialized.");
  }
}
