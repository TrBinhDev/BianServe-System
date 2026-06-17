/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import { menuService } from '@/services/menu.service';
import { orderService } from '@/services/order.service';
import { useCartStore } from '@/stores/cart.store';
import { useSocketStore } from '@/stores/socket.store';
import { getOrdersByTable, clearExpiredOrders } from '@/lib/storage';
import { Category, Order, StoredOrder } from '@/types';
import MenuCategory from '@/components/menu/menu-category';
import CartDrawer from '@/components/cart/cart-drawer';
import OrderStatus from '@/components/order/order-status';
import Splash from '@/components/splash';
import { ShoppingBag, ClipboardList, UtensilsCrossed, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Tab = 'menu' | 'orders';

export default function OrderPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const { setTableId, totalItems } = useCartStore();
  const { connect, disconnect, socket, joinOrderRoom } = useSocketStore();

  const [showSplash, setShowSplash] = useState(true);
  const [tab, setTab] = useState<Tab>('menu');
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [storedOrders, setStoredOrders] = useState<StoredOrder[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');

  // Init
  useEffect(() => {
    setTableId(tableId);
    clearExpiredOrders();
    connect();

    const stored = getOrdersByTable(tableId);
    if (stored.length) {
      setTimeout(() => setStoredOrders(stored), 0);
    }

    return () => disconnect();
  }, [tableId]);

  // Load menu — validate bàn qua menu
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await menuService.getMenu();
        if (!cancelled) {
          // Nếu menu load được nhưng tableId không phải UUID → notFound
          if (!tableId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            notFound();
            return;
          }
          setCategories(data);
          if (data.length) setActiveCategory(data[0].id);
        }
      } catch {
        if (!cancelled) {
          notFound();
        }
      } finally {
        if (!cancelled) setMenuLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [tableId]);

  // Load orders
  const loadOrders = useCallback(async () => {
    const stored = getOrdersByTable(tableId);
    setStoredOrders(stored);
    if (!stored.length) return;

    setOrdersLoading(true);
    try {
      const results = await Promise.all(stored.map((s) => orderService.getOrder(s.orderId)));
      setOrders(results);
      results.forEach((o) => joinOrderRoom(o.id));
    } catch {
      toast.error('Không thể tải đơn hàng');
    } finally {
      setOrdersLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    if (!storedOrders.length) return;
    setTimeout(() => loadOrders(), 0);
  }, [storedOrders.length]);

  // Socket realtime
  useEffect(() => {
    if (!socket) return;

    const handleStatusChanged = ({ orderId, status }: { orderId: string; status: string }) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: status as any } : o))
      );
      if (status === 'confirmed') toast.success('Đơn hàng đã được xác nhận!');
      if (status === 'completed') toast.success('Đơn hàng đã hoàn thành. Cảm ơn bạn!');
    };

    const handleCancelled = ({ orderId, reason }: { orderId: string; reason: string }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: 'cancelled', cancelReason: reason } : o
        )
      );
      toast.error(`Đơn hàng đã bị hủy: ${reason}`);
    };

    socket.on('order_status_changed', handleStatusChanged);
    socket.on('order_cancelled', handleCancelled);

    return () => {
      socket.off('order_status_changed', handleStatusChanged);
      socket.off('order_cancelled', handleCancelled);
    };
  }, [socket]);

  const handleOrderPlaced = (orderId: string) => {
    const stored = getOrdersByTable(tableId);
    setStoredOrders(stored);
    setTab('orders');
    joinOrderRoom(orderId);
    loadOrders();
  };

  const cartCount = totalItems();

  return (
    <>
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}

      <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0F0F0F]/90 backdrop-blur-sm border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-white">BianServe</h1>
              <p className="text-xs text-zinc-500">Đặt món tại bàn</p>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2"
            >
              <ShoppingBag className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3 bg-white/[0.04] rounded-xl p-1">
            <button
              onClick={() => setTab('menu')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all',
                tab === 'menu' ? 'bg-white/[0.08] text-white' : 'text-zinc-500'
              )}
            >
              <UtensilsCrossed className="w-4 h-4" /> Menu
            </button>
            <button
              onClick={() => setTab('orders')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all',
                tab === 'orders' ? 'bg-white/[0.08] text-white' : 'text-zinc-500'
              )}
            >
              <ClipboardList className="w-4 h-4" /> Đơn hàng
              {orders.filter((o) => o.status === 'pending').length > 0 && (
                <span className="w-4 h-4 bg-yellow-500/20 text-yellow-400 rounded-full text-[10px] font-bold flex items-center justify-center">
                  {orders.filter((o) => o.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'menu' && (
            <div className="p-4 lg:p-6">
              {categories.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        document
                          .getElementById(`cat-${cat.id}`)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={cn(
                        'shrink-0 px-4 py-2 rounded-xl text-xs font-medium border transition-all',
                        activeCategory === cat.id
                          ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                          : 'bg-white/[0.03] text-zinc-500 border-white/[0.06] hover:text-white'
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}

              {menuLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-5">
                  {categories
                    .filter((cat) => cat.id === activeCategory)
                    .map((cat) => (
                      <MenuCategory key={cat.id} category={cat} />
                    ))}
                </div>
              )}
            </div>
          )}

          {tab === 'orders' && (
            <div className="p-4 space-y-3">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20">
                  <ClipboardList className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">Chưa có đơn hàng nào</p>
                  <button
                    onClick={() => setTab('menu')}
                    className="mt-3 text-orange-400 text-sm font-medium"
                  >
                    Xem menu →
                  </button>
                </div>
              ) : (
                orders.map((order) => <OrderStatus key={order.id} order={order} />)
              )}
            </div>
          )}
        </div>

        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onOrderPlaced={handleOrderPlaced}
        />
      </div>
    </>
  );
}
