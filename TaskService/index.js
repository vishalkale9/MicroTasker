import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Task from './models/Task.js';
import amqp from 'amqplib';

dotenv.config();

const app = express();
app.use(express.json());

// --- 1. CONNECT TO DATABASE ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to Task MongoDB!'))
    .catch((err) => console.log('❌ Task DB connection error:', err));

// --- 2. CREATE A TASK ---
// --- 2. CREATE A TASK ---
app.post('/tasks', async (req, res) => {
    try {
        const { title, description, assignedTo } = req.body;
        const newTask = new Task({ title, description, assignedTo });
        await newTask.save();

        // --- NEW: SEND MESSAGE TO RABBITMQ ---
        try {
            const connection = await amqp.connect('amqp://rabbitmq');
            const channel = await connection.createChannel();
            const queue = 'task_notifications';

            await channel.assertQueue(queue, { durable: true });

            const message = JSON.stringify({
                title: newTask.title,
                assignedTo: newTask.assignedTo
            });

            channel.sendToQueue(queue, Buffer.from(message));
            console.log("📨 Message sent to RabbitMQ!");

            setTimeout(() => {
                connection.close();
            }, 500);
        } catch (err) {
            console.log("❌ RabbitMQ Sending Error:", err);
        }
        // -------------------------------------

        res.status(201).json({ message: "Task created successfully", task: newTask });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- 3. GET ALL TASKS ---
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 4. START SERVER ---
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`🚀Task Service running on port ${PORT}`);
});
