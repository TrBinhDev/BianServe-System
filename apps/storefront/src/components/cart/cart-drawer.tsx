/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/stores/cart.store';
import { orderService } from '@/services/order.service';
import { promotionService } from '@/services/promotion.service';
import { saveOrder } from '@/lib/storage';
import { Promotion } from '@/types';
import CartItem from './cart-item';
import { X, ShoppingBag, Tag, Loader2, ChevronRight, Gift, Check } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  onClose: () => void;
  onOrderPlaced: (orderId: string) => void;
}

const getSessionId = () => {
  let sid = localStorage.getItem('session_id');
  if (!sid) {
    sid = uuidv4();
    localStorage.setItem('session_id', sid);
  }
  return sid;
};

export default function CartDrawer({ open, onClose, onOrderPlaced }: Props) {
  const { items, tableId, totalAmount, totalItems, clearCart } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showPromos, setShowPromos] = useState(false);

  const finalAmount = Math.max(0, totalAmount() - discount);

  useEffect(() => {
    if (!open) return;
    promotionService
      .getActivePromotions()
      .then(setPromotions)
      .catch(() => {});
  }, [open]);

  const resetPromoState = () => {
    setPromoCode('');
    setDiscount(0);
    setPromoApplied('');
    setShowPromos(false);
  };

  const handleClose = () => {
    resetPromoState();
    onClose();
  };

  const handlePreviewPromo = async () => {
    if (!promoCode.trim() || promoLoading) return;
    setPromoLoading(true);
    try {
      const result = await promotionService.previewPromotion(
        promoCode,
        items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        getSessionId()
      );
      setDiscount(result.discountAmount);
      setPromoApplied(result.code);
      toast.success(
        `Giảm ${result.discountAmount.toLocaleString('vi-VN')}đ với mã ${result.code}!`
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Mã không hợp lệ');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setDiscount(0);
    setPromoApplied('');
  };

  const handlePlaceOrder = async () => {
    if (!tableId || !items.length) return;
    setOrderLoading(true);
    try {
      const order = await orderService.createOrder(tableId, items);

      saveOrder({
        orderId: order.id,
        tableId,
        orderCode: order.orderCode,
        createdAt: Date.now(),
      });

      // Mã đã được preview hợp lệ trước đó -> chốt usage thật, gắn vào order vừa tạo
      if (promoApplied) {
        try {
          await promotionService.applyPromotion(promoApplied, order.id, getSessionId());
        } catch (err: any) {
          toast.error(
            err?.response?.data?.message ||
              'Mã khuyến mãi không còn áp dụng được, đơn hàng vẫn được tạo'
          );
        }
      }

      clearCart();
      resetPromoState();
      toast.success('Đặt món thành công!');
      onOrderPlaced(order.id);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setOrderLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="absolute bottom-0 left-0 right-0 bg-[#141414] rounded-t-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-semibold text-white">Giỏ hàng</h2>
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
              {totalItems()} món
            </span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06]"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">Chưa có món nào</div>
          ) : (
            items.map((item) => <CartItem key={item.productId} item={item} />)
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-white/[0.06] space-y-3">
            {/* Danh sách mã KM */}
            {promotions.length > 0 && (
              <div>
                <button
                  onClick={() => setShowPromos(!showPromos)}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors w-full"
                >
                  <Gift className="w-4 h-4 text-orange-400" />
                  <span>{promotions.length} mã khuyến mãi đang có</span>
                  <ChevronRight
                    className={`w-4 h-4 ml-auto transition-transform duration-200 ${showPromos ? 'rotate-90' : ''}`}
                  />
                </button>

                {showPromos && (
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {promotions.map((promo) => (
                      <div
                        key={promo.id}
                        onClick={() => {
                          if (!promoApplied) {
                            setPromoCode(promo.code);
                            setShowPromos(false);
                          }
                        }}
                        className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                          promoApplied === promo.code
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : 'border-white/[0.06] bg-white/[0.03] hover:border-orange-500/30'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-orange-400">
                              {promo.code}
                            </span>
                            {promoApplied === promo.code && (
                              <Check className="w-3 h-3 text-emerald-400" />
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">{promo.name}</p>
                          <p className="text-xs text-zinc-600 mt-0.5">
                            HSD: {dayjs(promo.endDate).format('DD/MM/YYYY')}
                            {promo.minOrderValue
                              ? ` • Đơn tối thiểu ${Number(promo.minOrderValue).toLocaleString('vi-VN')}đ`
                              : ''}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-white shrink-0">
                          {promo.type === 'PERCENT'
                            ? `-${promo.value}%`
                            : `-${Number(promo.value).toLocaleString('vi-VN')}đ`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Promo input */}
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3">
                <Tag className="w-4 h-4 text-zinc-500 shrink-0" />
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã khuyến mãi"
                  disabled={!!promoApplied}
                  className="flex-1 bg-transparent py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
                />
                {promoApplied && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              </div>
              {!promoApplied && promoCode && (
                <button
                  onClick={handlePreviewPromo}
                  disabled={promoLoading}
                  className="px-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-sm text-orange-400 hover:bg-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center min-w-[64px]"
                >
                  {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Dùng'}
                </button>
              )}
              {promoApplied && (
                <button
                  onClick={handleRemovePromo}
                  className="px-4 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-zinc-400 hover:text-white transition-all"
                >
                  Hủy
                </button>
              )}
            </div>

            {/* Total */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Tạm tính</span>
                <span className="text-white">{totalAmount().toLocaleString('vi-VN')}đ</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400">Giảm giá ({promoApplied})</span>
                  <span className="text-emerald-400">-{discount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-1 border-t border-white/[0.06]">
                <span className="text-white">Tổng cộng</span>
                <span className="text-orange-400">{finalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {/* Order button */}
            <button
              onClick={handlePlaceOrder}
              disabled={orderLoading}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/30 text-white font-semibold rounded-2xl py-4 transition-all active:scale-[0.98]"
            >
              {orderLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Đặt món <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
