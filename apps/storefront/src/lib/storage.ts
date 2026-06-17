import { StoredOrder } from '@/types';

const STORAGE_KEY = 'bianserve_orders';
const TTL_MS = 6 * 60 * 60 * 1000; // 6 tiếng

export const getStoredOrders = (): StoredOrder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const orders: StoredOrder[] = JSON.parse(raw);
    const now = Date.now();
    // Lọc bỏ đơn hết TTL
    return orders.filter((o) => now - o.createdAt < TTL_MS);
  } catch {
    return [];
  }
};

export const saveOrder = (order: StoredOrder) => {
  try {
    const orders = getStoredOrders();
    const exists = orders.findIndex((o) => o.orderId === order.orderId);
    if (exists >= 0) {
      orders[exists] = order;
    } else {
      orders.push(order);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {}
};

export const getOrdersByTable = (tableId: string): StoredOrder[] => {
  return getStoredOrders().filter((o) => o.tableId === tableId);
};

export const clearExpiredOrders = () => {
  try {
    const valid = getStoredOrders();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
  } catch {}
};