import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";

let io: SocketServer;

export const initSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    // Module 5: khách join phòng theo orderId
    socket.on("join_order_room", ({ orderId }: { orderId: string }) => {
      socket.join(`order_${orderId}`);
    });
  });

  return io;
};

// Dùng ở các service cần emit event
export const getIO = (): SocketServer => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};