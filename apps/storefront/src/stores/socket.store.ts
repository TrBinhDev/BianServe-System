import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
  joinOrderRoom: (orderId: string) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,

  connect: () => {
    if (get().socket?.connected) return;
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });
    set({ socket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null });
  },

  joinOrderRoom: (orderId) => {
    get().socket?.emit('join_order_room', { orderId });
  },
}));