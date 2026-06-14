"use client";

import { Order } from "@/types";
import OrderStatusBadge from "./order-status-badge";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

interface Props {
  orders: Order[];
  loading: boolean;
  onRowClick: (order: Order) => void;
}

export default function OrderTable({ orders, loading, onRowClick }: Props) {
  const headers = ["Mã đơn", "Bàn", "Số món", "Tổng tiền", "Trạng thái", "Thời gian", ""];

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {headers.map((h) => (
              <th key={h} className="text-left text-xs font-medium text-zinc-500 px-5 py-3.5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-white/[0.04]">
                {[...Array(7)].map((_, j) => (
                  <td key={j} className="px-5 py-4">
                    <div className="h-4 bg-white/[0.04] rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center text-sm text-zinc-500 py-12">
                Không có đơn hàng nào
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors group"
              >
                <td className="px-5 py-4 text-sm font-mono text-zinc-300">{order.orderCode}</td>
                <td className="px-5 py-4 text-sm text-white">Bàn {order.table.tableNumber}</td>
                <td className="px-5 py-4 text-sm text-zinc-400">{order.items.length} món</td>
                <td className="px-5 py-4 text-sm text-orange-400 font-medium">
                  {Number(order.totalAmount).toLocaleString("vi-VN")}đ
                </td>
                <td className="px-5 py-4">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-5 py-4 text-sm text-zinc-500">
                  {dayjs(order.createdAt).format("HH:mm DD/MM")}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => onRowClick(order)}
                    className="text-xs text-zinc-500 hover:text-orange-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Chi tiết →
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}