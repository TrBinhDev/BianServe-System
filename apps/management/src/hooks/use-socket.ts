import { useEffect } from "react";
import { useSocketStore } from "@/stores/socket.store";
import { useAuthStore } from "@/stores/auth.store";

export const useSocket = () => {
  const { socket, isConnected, connect, disconnect } = useSocketStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated]);

  return { socket, isConnected };
};