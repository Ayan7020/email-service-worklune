import { RabbitMQService } from "./service/mq.service";

export const EmailService = new RabbitMQService("email-queue");