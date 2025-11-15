import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true 
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    enum: ["positive", "neutral", "negative"],
    default: "neutral"
  },
  sentimentScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Entry", entrySchema);
