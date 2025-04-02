import { createServer } from "http";
import app from "./app.js";
import { config } from "dotenv";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

config();
const port = process.env.PORT;
const server = createServer(app);
server.listen(port);

const SECRET_KEY = "your_secret_key"; // Use environment variable in production

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware for Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth?.token; // Get token from client
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
    socket.user = decoded; // Store user data in socket object
    next();
  });
});

const connectedUsers = {};

io.on("connection", (socket) => {
  const username = socket.user.username;
  console.log(
    `✅ User Connected: ${socket.user?.username} (Socket ID: ${socket.id})`
  );

  // Store user socket ID
  connectedUsers[username] = socket.id;

  // Handle Sending Messages
  socket.on("send-message", ({ recipient, message }) => {
    const recipientSocketId = connectedUsers[recipient];

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receive-message", {
        sendBy: username,
        recBy: recipient,
        message: message,
        createdAt: new Date(),
      });
      console.log(`📩 Message from ${username} to ${recipient}: ${message}`);
    } else {
      console.log(`⚠️ User ${recipient} is not online`);
    }
  });

  // Handle User Disconnect
  socket.on("disconnect", () => {
    console.log(`❌ User Disconnected: ${username}`);
    delete connectedUsers[username]; // Remove user from list
  });
});
