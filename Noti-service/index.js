import express from 'express';
import amqp from 'amqplib';

const app = express();

// A function to connect to RabbitMQ and listen for messages
async function connectRabbitMQ() {
    try {
        // 1. Connect to the RabbitMQ server
        // (Docker will resolve 'rabbitmq' to the container we just made)
        const connection = await amqp.connect('amqp://rabbitmq');
        const channel = await connection.createChannel();

        // 2. Make sure our mailbox (queue) exists
        const queue = 'task_notifications';
        await channel.assertQueue(queue, { durable: true });

        console.log("✅ Waiting for messages in RabbitMQ...");

        // 3. Listen for new mail!
        channel.consume(queue, (message) => {
            if (message !== null) {
                // We got a message! Convert it from computer language back to text
                const taskData = JSON.parse(message.content.toString());

                console.log(`\n🎉 NEW MESSAGE RECEIVED!`);
                console.log(`Task: ${taskData.title}`);
                console.log(`Assigned To ID: ${taskData.assignedTo}`);
                console.log(`(Pretend we just sent an email here!)\n`);

                // Tell RabbitMQ we successfully processed the message
                channel.ack(message);
            }
        });

    } catch (error) {
        console.log("❌ RabbitMQ Connection Error:", error);
        setTimeout(connectRabbitMQ, 5000);
    }

}

// Start listening!
connectRabbitMQ();

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`🚀 Notification Service running on port ${PORT}`);
});
