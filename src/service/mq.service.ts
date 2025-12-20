import { sleep } from "@/utils/sleep";
import amqp, { ConsumeMessage } from "amqplib";

export class RabbitMQService {
    private connection?: amqp.ChannelModel
    private channel?: amqp.Channel

    private queue: string = ""
    private maxReconnectTimes: number = 10;
    private reconnectDelay: number = 5000;

    private isReconnecting = false;
    private isClosing = false;

    constructor(queue: string) {
        if (!queue) {
            throw new Error("Provide the queue name");
        }
        this.queue = queue
    }

    public async connect(): Promise<amqp.Channel> {
        console.log(`connecting queue: ${this.queue}`)
        await this.createConnection();
        return this.channel!;
    }

    public async close(): Promise<void> {
        this.isClosing = true;
        await this.cleanup();
    }

    public async consumeQueues(
        consumeQueue: (msg: ConsumeMessage) => Promise<boolean>,
        consumeOptions: amqp.Options.Consume | null = {}
    ) {
        const name = this.queue;
        if (!name.trim()) {
            throw new Error("Queue name must be present");
        }
        await this.channel?.consume(
            name.trim(),
            async (msg) => {
                if (!msg) return;
                try {
                    const success = await consumeQueue(msg);
                    success && this.channel?.ack(msg);
                    !success && this.channel?.nack(msg, false, false);
                } catch (error: any) {
                    console.error("Error processing message:", error);
                    this.channel?.nack(msg, false, false);
                }
            },
            {
                noAck: false,
                ...consumeOptions
            }
        )
    }
    private async createConnection() {
        try {
            const connection = await amqp.connect({
                username: process.env.RABBITMQUSER,
                port: Number(process.env.RABBITMQPORT),
                hostname: process.env.RABBITMQHOST,
                password: process.env.RABBITMQPASSWORD
            });

            connection.on("close", () => {
                if (!this.isClosing) {
                    console.error("RabbitMQ connection closed");
                    this.Reconnect();
                }
            });

            connection.on("error", (err) => {
                if (!this.isClosing) {
                    console.error("RabbitMQ connection error:", err.message);
                    this.Reconnect();
                }
            });

            const channel = await connection.createChannel()
            await channel.assertQueue(this.queue, { durable: true });

            this.connection = connection;
            this.channel = channel;

        } catch (error: any) {
            throw error;
        }
    }

    private async Reconnect() {
        if (this.isReconnecting) return;
        this.isReconnecting = true;
        console.log("Starting RabbitMQ reconnect loop");
        for (let attempt = 1; attempt <= this.maxReconnectTimes; attempt++) {
            try {
                console.log(`Reconnect attempt ${attempt}/${this.maxReconnectTimes}`);

                await this.cleanup();
                await this.createConnection();

                console.log("RabbitMQ reconnected successfully");
                this.isReconnecting = false;
                return;
            } catch (err: any) {
                console.error(
                    `Reconnect attempt ${attempt} failed:`,
                    err?.message
                );

                if (attempt < this.maxReconnectTimes) {
                    await sleep(this.reconnectDelay);
                }
            }
        }
    }

    private async cleanup(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close().catch(() => { });
                this.channel = undefined;
            }

            if (this.connection) {
                await this.connection.close().catch(() => { });
                this.connection = undefined;
            }
        } catch {

        }
    }


}