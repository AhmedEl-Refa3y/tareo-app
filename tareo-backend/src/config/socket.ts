import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
import Session from "../models/Session";
import Message from "../models/Message";
import User from "../models/User";

interface SocketUser {
  userId: string;
  socketId: string;
  sessionId?: string;
  role: string;
}

const connectedUsers: Map<string, SocketUser> = new Map();

export const setupSocket = (io: Server) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return next(new Error("User not found or inactive"));
      }
      socket.data.userId = decoded.id;
      socket.data.role = user.role;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    logger.info(`🔌 New client connected: ${socket.id}`);

    // Register user
    socket.on("register", (userId: string) => {
      connectedUsers.set(userId, {
        userId,
        socketId: socket.id,
        role: socket.data.role,
      });
      logger.info(
        `👤 User ${userId} (${socket.data.role}) registered with socket ${socket.id}`,
      );
    });

    // Join session room
    socket.on("join-session", async (sessionId: string) => {
      const session = await Session.findById(sessionId);
      if (!session) {
        socket.emit("error", { message: "Session not found" });
        return;
      }

      const userId = socket.data.userId;
      const isAuthorized =
        session.patientId.toString() === userId ||
        session.doctorId?.toString() === userId;

      if (!isAuthorized) {
        socket.emit("error", {
          message: "Not authorized to join this session",
        });
        return;
      }

      socket.join(`session_${sessionId}`);

      const user = connectedUsers.get(userId);
      if (user) {
        user.sessionId = sessionId;
        connectedUsers.set(userId, user);
      }

      logger.info(`📎 Socket ${socket.id} joined session ${sessionId}`);

      // Notify others in session
      socket.to(`session_${sessionId}`).emit("user-joined", {
        userId: userId,
        role: socket.data.role,
        timestamp: new Date(),
      });
    });

    // Leave session room
    socket.on("leave-session", (sessionId: string) => {
      socket.leave(`session_${sessionId}`);

      const user = connectedUsers.get(socket.data.userId);
      if (user) {
        user.sessionId = undefined;
        connectedUsers.set(socket.data.userId, user);
      }

      socket.to(`session_${sessionId}`).emit("user-left", {
        userId: socket.data.userId,
        role: socket.data.role,
        timestamp: new Date(),
      });

      logger.info(`🚪 Socket ${socket.id} left session ${sessionId}`);
    });

    // Send message
    socket.on("send-message", async (data) => {
      const { sessionId, messageId } = data;

      const message = await Message.findById(messageId).populate(
        "senderId",
        "firstName lastName role profileImage",
      );

      if (message) {
        io.to(`session_${sessionId}`).emit("new-message", {
          message,
          timestamp: new Date(),
        });
      }
    });

    // Typing indicator
    socket.on("typing", (data) => {
      const { sessionId, isTyping } = data;
      socket.to(`session_${sessionId}`).emit("user-typing", {
        userId: socket.data.userId,
        isTyping,
        userName: socket.data.role === "doctor" ? "Doctor" : "Patient",
        timestamp: new Date(),
      });
    });

    // WebRTC signaling for video calls
    socket.on("offer", (data) => {
      const { to, offer, sessionId } = data;
      const targetUser = connectedUsers.get(to);
      if (targetUser) {
        io.to(targetUser.socketId).emit("offer", {
          from: socket.data.userId,
          offer,
          sessionId,
        });
      }
    });

    socket.on("answer", (data) => {
      const { to, answer, sessionId } = data;
      const targetUser = connectedUsers.get(to);
      if (targetUser) {
        io.to(targetUser.socketId).emit("answer", {
          from: socket.data.userId,
          answer,
          sessionId,
        });
      }
    });

    socket.on("ice-candidate", (data) => {
      const { to, candidate, sessionId } = data;
      const targetUser = connectedUsers.get(to);
      if (targetUser) {
        io.to(targetUser.socketId).emit("ice-candidate", {
          from: socket.data.userId,
          candidate,
          sessionId,
        });
      }
    });

    // Video call controls
    socket.on("start-video-call", (data) => {
      const { to, sessionId } = data;
      const targetUser = connectedUsers.get(to);
      if (targetUser) {
        io.to(targetUser.socketId).emit("incoming-video-call", {
          from: socket.data.userId,
          sessionId,
          callerName: socket.data.role === "doctor" ? "Doctor" : "Patient",
        });
      }
    });

    socket.on("end-video-call", (data) => {
      const { to, sessionId } = data;
      const targetUser = connectedUsers.get(to);
      if (targetUser) {
        io.to(targetUser.socketId).emit("call-ended", {
          sessionId,
          timestamp: new Date(),
        });
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      logger.info(`🔌 Client disconnected: ${socket.id}`);

      for (const [userId, user] of connectedUsers.entries()) {
        if (user.socketId === socket.id) {
          connectedUsers.delete(userId);

          if (user.sessionId) {
            io.to(`session_${user.sessionId}`).emit("user-disconnected", {
              userId,
              role: user.role,
              timestamp: new Date(),
            });
          }
          logger.info(
            `👋 User ${userId} disconnected from session ${user.sessionId || "none"}`,
          );
          break;
        }
      }
    });
  });
};

export const getUserSocketId = (userId: string): string | undefined => {
  return connectedUsers.get(userId)?.socketId;
};

export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId);
};
