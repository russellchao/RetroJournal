import mongoose from "mongoose";

const weeklyRecapSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    recap: { type: String, default: "No recap for this week available yet!" },
    todaysDate: { type: Date, default: Date.now }
});

export default mongoose.model("WeeklyRecap", weeklyRecapSchema);