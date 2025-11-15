'use client';

import React from 'react';
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { OrderTab1, OrderTab2, OrderStatus, Priority } from '@/types';
import BuyerInfoModal from './BuyerInfoModal';

interface OrderTableProps {
  orders: (OrderTab1 | OrderTab2)[];
  type: 'tab1' | 'tab2';
  onEdit: (order: OrderTab1 | OrderTab2) => void;
  onDelete: (id: number) => void;
  onBuyerClick: (buyer: { name: string; phone?: string; address?: string }) => void;
  visibleColumns: { [key: string]: boolean };
}

export default function OrderTable({
  orders,
  type,
  onEdit,
  onDelete,
  onBuyerClick,
  visibleColumns,
}: OrderTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: { [key in OrderStatus]: string } = {
      'đã lên đơn': 'bg-pink-100 text-pink-800',
      'chưa lên đơn': 'bg-pink-50 text-pink-700',
      'nhập kho Trung': 'bg-rose-100 text-rose-800',
      'Shop nhận hàng': 'bg-pink-200 text-pink-900',
      'Giao khách': 'bg-pink-300 text-pink-900',
      'Huỷ đơn': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-pink-50 text-pink-700';
  };

  const getColumnClass = (key: string) => {
    return visibleColumns[key] !== false ? '' : 'hidden';
  };

  if (type === 'tab1') {
    const tab1Orders = orders as OrderTab1[];
    return (
      <div className="table-container">
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
          <thead className="bg-pink-100">
            <tr>
              {visibleColumns.stt !== false && (
                <th className="border p-2 text-left text-xs font-semibold">STT</th>
              )}
              {visibleColumns.product_image !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Ảnh</th>
              )}
              {visibleColumns.buyer_name !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Người mua</th>
              )}
              {visibleColumns.order_code !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Mã vận đơn</th>
              )}
              {visibleColumns.quantity !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Số lượng</th>
              )}
              {visibleColumns.reported_amount !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Tiền báo khách</th>
              )}
              {visibleColumns.deposit_amount !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Tiền cọc</th>
              )}
              {visibleColumns.shipping_fee !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Tiền Ship (NĐ)</th>
              )}
              {visibleColumns.remaining_amount !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Tiền còn lại</th>
              )}
              {visibleColumns.status !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Trạng thái</th>
              )}
              {visibleColumns.priority !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Ưu tiên</th>
              )}
              {visibleColumns.created_at !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Ngày tạo</th>
              )}
              <th className="border p-2 text-left text-xs font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {tab1Orders.map((order) => (
              <tr key={order.id} className="hover:bg-pink-50">
                {visibleColumns.stt !== false && (
                  <td className="border p-2 text-sm">{order.stt}</td>
                )}
                {visibleColumns.product_image !== false && (
                  <td className="border p-2">
                    {order.product_image ? (
                      <img
                        src={order.product_image}
                        alt="Product"
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-pink-200 rounded flex items-center justify-center">
                        <ImageIcon size={20} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                )}
                {visibleColumns.buyer_name !== false && (
                  <td className="border p-2">
                    <button
                      onClick={() =>
                        onBuyerClick({
                          name: order.buyer_name,
                          phone: order.buyer_phone,
                          address: order.buyer_address,
                        })
                      }
                      className="text-pink-600 hover:underline text-sm"
                    >
                      {order.buyer_name}
                    </button>
                  </td>
                )}
                {visibleColumns.order_code !== false && (
                  <td className="border p-2 text-sm">{order.order_code}</td>
                )}
                {visibleColumns.quantity !== false && (
                  <td className="border p-2 text-sm">{order.quantity}</td>
                )}
                {visibleColumns.reported_amount !== false && (
                  <td className="border p-2 text-sm">{formatCurrency(order.reported_amount)}</td>
                )}
                {visibleColumns.deposit_amount !== false && (
                  <td className="border p-2 text-sm">{formatCurrency(order.deposit_amount)}</td>
                )}
                {visibleColumns.shipping_fee !== false && (
                  <td className="border p-2 text-sm">{formatCurrency((order as OrderTab1).shipping_fee || 0)}</td>
                )}
                {visibleColumns.remaining_amount !== false && (
                  <td className="border p-2 text-sm">
                    <span className={`font-semibold ${
                      order.remaining_amount > 0 
                        ? 'text-pink-600 bg-pink-50 px-2 py-1 rounded' 
                        : 'text-gray-600'
                    }`}>
                      {formatCurrency(order.remaining_amount)}
                    </span>
                  </td>
                )}
                {visibleColumns.status !== false && (
                  <td className="border p-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                )}
                {visibleColumns.priority !== false && (
                  <td className="border p-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        order.priority === 'Gấp'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-pink-50 text-pink-700'
                      }`}
                    >
                      {order.priority}
                    </span>
                  </td>
                )}
                {visibleColumns.created_at !== false && (
                  <td className="border p-2 text-sm">{formatDate(order.created_at)}</td>
                )}
                <td className="border p-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEdit(order)}
                      className="text-pink-600 hover:text-pink-800 p-1"
                      title="Sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => order.id && onDelete(order.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tab1Orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
        )}
      </div>
    );
  } else {
    const tab2Orders = orders as OrderTab2[];
    return (
      <div className="table-container">
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
          <thead className="bg-pink-100">
            <tr>
              {visibleColumns.stt !== false && (
                <th className="border p-2 text-left text-xs font-semibold">STT</th>
              )}
              {visibleColumns.product_image !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Ảnh</th>
              )}
              {visibleColumns.buyer_name !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Người mua</th>
              )}
              {visibleColumns.order_code !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Mã vận đơn</th>
              )}
              {visibleColumns.reported_amount !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Tiền báo khách</th>
              )}
              {visibleColumns.capital !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Vốn</th>
              )}
              {visibleColumns.profit !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Lãi</th>
              )}
              {visibleColumns.shipping_fee !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Tiền Ship (NĐ)</th>
              )}
              {visibleColumns.status !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Trạng thái</th>
              )}
              {visibleColumns.priority !== false && (
                <th className="border p-2 text-left text-xs font-semibold">Ưu tiên</th>
              )}
              <th className="border p-2 text-left text-xs font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {tab2Orders.map((order) => (
              <tr key={order.id} className="hover:bg-pink-50">
                {visibleColumns.stt !== false && (
                  <td className="border p-2 text-sm">{order.stt}</td>
                )}
                {visibleColumns.product_image !== false && (
                  <td className="border p-2">
                    {order.product_image ? (
                      <img
                        src={order.product_image}
                        alt="Product"
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-pink-200 rounded flex items-center justify-center">
                        <ImageIcon size={20} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                )}
                {visibleColumns.buyer_name !== false && (
                  <td className="border p-2">
                    <button
                      onClick={() =>
                        onBuyerClick({
                          name: order.buyer_name,
                          phone: order.buyer_phone,
                          address: order.buyer_address,
                        })
                      }
                      className="text-pink-600 hover:underline text-sm"
                    >
                      {order.buyer_name}
                    </button>
                  </td>
                )}
                {visibleColumns.order_code !== false && (
                  <td className="border p-2 text-sm">{order.order_code}</td>
                )}
                {visibleColumns.reported_amount !== false && (
                  <td className="border p-2 text-sm">{formatCurrency(order.reported_amount)}</td>
                )}
                {visibleColumns.capital !== false && (
                  <td className="border p-2 text-sm">{formatCurrency(order.capital)}</td>
                )}
                {visibleColumns.profit !== false && (
                  <td className="border p-2 text-sm">
                    <span
                      className={`font-semibold px-2 py-1 rounded ${
                        order.profit >= 0 
                          ? 'text-green-700 bg-green-50' 
                          : 'text-red-700 bg-red-50'
                      }`}
                    >
                      {formatCurrency(order.profit)}
                    </span>
                  </td>
                )}
                {visibleColumns.shipping_fee !== false && (
                  <td className="border p-2 text-sm">{formatCurrency((order as OrderTab2).shipping_fee || 0)}</td>
                )}
                {visibleColumns.status !== false && (
                  <td className="border p-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                )}
                {visibleColumns.priority !== false && (
                  <td className="border p-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        order.priority === 'Gấp'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-pink-50 text-pink-700'
                      }`}
                    >
                      {order.priority}
                    </span>
                  </td>
                )}
                <td className="border p-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEdit(order)}
                      className="text-pink-600 hover:text-pink-800 p-1"
                      title="Sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => order.id && onDelete(order.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tab2Orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
        )}
      </div>
    );
  }
}

