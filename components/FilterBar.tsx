'use client';

import { Search, Filter, X } from 'lucide-react';
import { OrderStatus, Priority } from '@/types';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  datePeriod: string;
  onDatePeriodChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  onReset: () => void;
}

const statusOptions: OrderStatus[] = [
  'đã lên đơn',
  'chưa lên đơn',
  'nhập kho Trung',
  'Shop nhận hàng',
  'Giao khách',
  'Huỷ đơn',
];

const priorityOptions: Priority[] = ['Gấp', 'Bình thường'];

export default function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  datePeriod,
  onDatePeriodChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onReset,
}: FilterBarProps) {
  const hasFilters = search || status || priority || datePeriod !== 'month';

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4 space-y-3">
      <div className="flex items-center gap-2">
        <Search className="text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, mã vận đơn, SĐT, địa chỉ..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        {hasFilters && (
          <button
            onClick={onReset}
            className="bg-pink-100 text-pink-700 px-3 py-2 rounded-lg hover:bg-pink-200 transition text-sm flex items-center gap-1"
          >
            <X size={16} />
            Reset
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-sm"
          >
            <option value="">Tất cả</option>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Độ ưu tiên</label>
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-sm"
          >
            <option value="">Tất cả</option>
            {priorityOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Thời gian</label>
          <select
            value={datePeriod}
            onChange={(e) => {
              const newPeriod = e.target.value;
              onDatePeriodChange(newPeriod);
              if (newPeriod === 'day') {
                const today = new Date().toISOString().split('T')[0];
                onStartDateChange(today);
                onEndDateChange(today);
              } else if (newPeriod === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                onStartDateChange(weekAgo.toISOString().split('T')[0]);
                onEndDateChange(new Date().toISOString().split('T')[0]);
              } else if (newPeriod === 'month') {
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                
                // Format date as YYYY-MM-DD in local timezone
                const formatDate = (date: Date) => {
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, '0');
                  const d = String(date.getDate()).padStart(2, '0');
                  return `${y}-${m}-${d}`;
                };
                
                onStartDateChange(formatDate(firstDay));
                onEndDateChange(formatDate(lastDay));
              }
            }}
            className="w-full border rounded-lg px-2 py-1.5 text-sm"
          >
            <option value="day">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">Tháng hiện tại</option>
            <option value="custom">Tùy chọn</option>
          </select>
        </div>
        {(datePeriod === 'custom' || datePeriod === 'month') && (
          <div className="grid grid-cols-2 gap-1">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full border rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full border rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

