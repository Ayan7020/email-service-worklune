import express from "express";
import http from "http";
import { OtpService } from "./emailService";
import { ConsumeMessage } from "amqplib";
import { sendMailViaSmtp } from "./service/email.service";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
let server: http.Server;

const startServer = async () => {
    try {
        await OtpService.connect();
        console.log("Queue Connected");
        await OtpService.consumeQueues(async (msg: ConsumeMessage) => {
            const payload = JSON.parse(msg.content.toString());
            if (!payload?.email) {
                console.warn("[Consumer] Invalid payload: Missing email.");
                return false;
            }
            console.log(`[Consumer] Processing email for: ${payload.email}`);
            return await sendMailViaSmtp(payload);
        });
        console.log("Email Service connected to email Queue as consumer")
        server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error: any) {
        console.error("[Startup Error]", error);
        process.exit(1);
    }
};

startServer();