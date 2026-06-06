import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        required: true,
        default: 'pending'
    },
    assignedTo: { type: String, required: true }
})

export default mongoose.model('Task', taskSchema);