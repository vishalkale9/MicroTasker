import express from 'express';
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from './models/User.js';


dotenv.config()

const app = express();

app.use(express.json());


//db connect

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("✅db connected")
}).catch((err) => {
    console.log(err, "❌ db connection error")
})

//routes

app.post("/users", async (req, res) => {
    try {
        const { name, email, role } = req.body;

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" })
        }
        const user = new User({ name, email, role })
        await user.save();
        res.status(201).json({ message: "User created successfully", user })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})



app.get('/users', async (req, res) => {
    try {
        const users = await User.find(); // Fetches everyone from the DB
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- 4. START THE SERVER ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 User Service running on port ${PORT}`);
});
