/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { tablesService } from '@/services/tables.service';
import { Table } from '@/types';
import TableCard from '@/components/shared/tables/table-card';
import TableForm from '@/components/shared/tables/table-form';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTable, setEditTable] = useState<Table | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const data = await tablesService.list({
          search: search || undefined,
          status: (statusFilter as any) || undefined,
          limit: 100,
        });
        if (!cancelled) setTables(data.tables);
      } catch {
        if (!cancelled) toast.error('Không thể tải danh sách bàn');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [search, statusFilter]);

  const handleEdit = (table: Table) => {
    setEditTable(table);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditTable(null);
  };

  const refetch = () => setSearch((s) => s);

  const available = tables.filter((t) => t.status === 'available').length;
  const occupied = tables.filter((t) => t.status === 'occupied').length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tổng bàn', value: tables.length, color: 'text-white' },
          { label: 'Đang trống', value: available, color: 'text-emerald-400' },
          { label: 'Đang dùng', value: occupied, color: 'text-orange-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm số bàn..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50"
        >
          <option value="" className="bg-[#1a1a1a]">Tất cả</option>
          <option value="available" className="bg-[#1a1a1a]">Trống</option>
          <option value="occupied" className="bg-[#1a1a1a]">Đang dùng</option>
        </select>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Thêm bàn
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 aspect-square animate-pulse" />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 text-sm">Chưa có bàn nào</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map((table) => (
            <TableCard key={table.id} table={table} onEdit={handleEdit} onDeleted={refetch} />
          ))}
        </div>
      )}

      <TableForm open={showForm} onClose={handleCloseForm} onSuccess={refetch} table={editTable} />
    </div>
  );
}