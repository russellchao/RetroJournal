import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import entriesRoutes from "./routes/entries.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Clerk middleware (must come before routes)
app.use(clerkMiddleware());

// Routes
app.use("/api/entries", entriesRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5005, () => {
      console.log("Server running on port", process.env.PORT || 5005);
    });
  })
  .catch((err) => console.error(err));