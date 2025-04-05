import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";

import path from "path";

dotenv.config();

const _dirname = path.resolve();

// Middleware setup (should come before routes)
app.use(express.json()); // Fixed: added parentheses
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.get("/hello", (req, res) => {
  res.send("hellooo");
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 5000; // Added fallback port

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(_dirname, "../frontend/dist"))); 

  app.get("*",(req,res)=>{
    res.sendFile(path.join(_dirname,"../frontend","dist","index.html"));
  })
}

server.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
  connectDB();
});
