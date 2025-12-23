import { RabbitMQService } from "./service/mq.service";

export const OtpService = new RabbitMQService("email-queue");