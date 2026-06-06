import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Task from './models/Task.js';

dotenv.config();

const app = express();
app.use(express.json());

// --- 1. CONNECT TO DATABASE ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to Task MongoDB!'))
    .catch((err) => console.log('❌ Task DB connection error:', err));

// --- 2. CREATE A TASK ---
app.post('/tasks', async (req, res) => {
    try {
        const { title, description, assignedTo } = req.body;

        // In the future, we could check if assignedTo is a valid User ID here

        const newTask = new Task({ title, description, assignedTo });
        await newTask.save();

        // (LATER: Here is where we will send the RabbitMQ message!)

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
