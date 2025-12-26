import { RabbitMQService } from "./service/mq.service";

export const OtpService = new RabbitMQService("otp-queue");