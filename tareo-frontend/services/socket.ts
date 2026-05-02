import io, { Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io(SOCKET_URL);
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinSession(sessionId: string) {
    this.socket?.emit("join-session", sessionId);
  }

  sendMessage(sessionId: string, message: any) {
    this.socket?.emit("send-message", { sessionId, messageId: message._id });
  }

  onNewMessage(callback: (data: any) => void) {
    this.socket?.on("new-message", callback);
  }

  onUserTyping(callback: (data: any) => void) {
    this.socket?.on("user-typing", callback);
  }

  emitTyping(sessionId: string, isTyping: boolean) {
    this.socket?.emit("typing", { sessionId, isTyping });
  }
}

export default new SocketService();
