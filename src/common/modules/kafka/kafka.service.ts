import * as fs from "fs";

import {
  Kafka,
  Producer,
  Consumer,
  TopicMessages,
  ProducerBatch,
} from "kafkajs";
import { injectable } from "tsyringe";

import { DocumentStatus, Topic } from "@common/enums";
import { ExcelWriter } from "@common/helpers";
import { LoggerService } from "@common/services";

@injectable()
export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(private logger: LoggerService) {
    this.kafka = new Kafka({
      clientId: "nodejshandler",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({
      groupId: "consumer-group-handler",
    });
  }

  public async connectProducer(): Promise<void> {
    try {
      await this.producer.connect();
      this.logger.info("Kafka Producer connected");
    } catch (error) {
      this.logger.error("Failed to connect Kafka Producer", error);
    }
  }

  public async connectConsumer(): Promise<void> {
    try {
      await this.consumer.connect();
      this.logger.info("Kafka Consumer connected");
    } catch (error) {
      this.logger.error("Failed to connect Kafka Consumer", error);
    }
  }

  public async sendMessage(
    topic: string,
    key: string,
    value: string
  ): Promise<void> {
    try {
      const topicMessages: TopicMessages = {
        topic,
        messages: [{ key, value }],
      };

      const batch: ProducerBatch = {
        topicMessages: [topicMessages],
      };

      await this.producer.sendBatch(batch);
      this.logger.info(`Message sent to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to send message to topic ${topic}`, error);
    }
  }

  public async consumeMessages(topic: Topic): Promise<void> {
    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      this.logger.info(`Message subscribed to topic ${topic}`);

      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (message.key && topic === Topic.FILE_CREATED) {
            const data = JSON.parse(message.value?.toString() || "[]");
            const key = message.key.toString() || "";
            try {
              const buffer = await ExcelWriter.toBase64(data);
              const filePrefix = process.env.FILE_PREFIX || "";
              const folder = "public";

              if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder);
              }

              const fileName = `${folder}/${key}.xlsx`;

              fs.writeFileSync(fileName, buffer);

              await this.sendMessage(
                Topic.FILE_CREATED_REPLY,
                key,
                JSON.stringify({
                  id: key,
                  status: DocumentStatus.COMPLETED,
                  path: `${filePrefix}${fileName}`,
                })
              );
            } catch (error) {
              this.logger.error(
                `Error processing message from topic ${topic}, key ${key}: ${error.message}`,
                error
              );
              await this.sendMessage(
                Topic.FILE_CREATED_REPLY,
                key,
                JSON.stringify({
                  id: key,
                  status: DocumentStatus.FAILED,
                  path: null,
                })
              );
            }
          }
        },
      });
    } catch (error) {
      this.logger.error("Failed to start Kafka consumer", error);
    }
  }
}
