import { injectable } from "tsyringe";
import { createLogger, format, transports, Logger } from "winston";

@injectable()
export class LoggerService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: "info",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
      ),
      defaultMeta: {},
      transports: [
        new transports.File({ filename: "error.log", level: "error" }),
        new transports.File({ filename: "combined.log" }),
      ],
    });

    if (process.env.NODE_ENV !== "production") {
      this.logger.add(
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        }),
      );
    }
  }

  public info<T>(message: string, ...meta: T[]): void {
    this.logger.info(message, ...meta);
  }

  public error<T>(message: string, ...meta: T[]): void {
    this.logger.error(message, ...meta);
  }

  public warn<T>(message: string, ...meta: T[]): void {
    this.logger.warn(message, ...meta);
  }

  public debug<T>(message: string, ...meta: T[]): void {
    this.logger.debug(message, ...meta);
  }
}
