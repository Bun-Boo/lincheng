'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Users } from 'lucide-react';
import { OrderTab1, OrderTab2, OrderStatus, Priority } from '@/types';
import CustomerSelectModal from './CustomerSelectModal';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void | Promise<void>;
  order?: OrderTab1 | OrderTab2 | null;
  type: 'tab1' | 'tab2';
}

interface Customer {
  id: number;
  name: string;
  phone?: string;
  address?: string;
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

export default function OrderModal({ isOpen, onClose, onSave, order, type }: OrderModalProps) {
  const [imageUrl, setImageUrl] = useState<string>(order?.product_image || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format currency for display
  const formatCurrencyInput = (value: number, showZero: boolean = false): string => {
    if (!value && value !== 0) return '';
    if (value === 0 && !showZero) return '';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Format number for display (for quantity)
  const formatNumberInput = (value: number, showZero: boolean = false): string => {
    if (!value && value !== 0) return '';
    if (value === 0 && !showZero) return '';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Parse currency from formatted string
  const parseCurrencyInput = (value: string): number => {
    // Remove all non-digit characters
    const cleaned = value.replace(/[^\d]/g, '');
    if (!cleaned) return 0;
    // Remove leading zeros
    const numStr = cleaned.replace(/^0+/, '') || '0';
    return parseFloat(numStr);
  };

  // Parse number from formatted string (for quantity)
  const parseNumberInput = (value: string): number => {
    // Remove all non-digit characters
    const cleaned = value.replace(/[^\d]/g, '');
    if (!cleaned) return 0;
    // Remove leading zeros
    const numStr = cleaned.replace(/^0+/, '') || '0';
    return parseInt(numStr, 10);
  };

  // Form state
  const [formData, setFormData] = useState({
    buyer_name: order?.buyer_name || '',
    buyer_phone: order?.buyer_phone || '',
    buyer_address: order?.buyer_address || '',
    order_code: order?.order_code || '',
    status: order?.status || 'chưa lên đơn',
    priority: order?.priority || 'Bình thường',
    quantity: (order as OrderTab1)?.quantity || 0,
    reported_amount: order?.reported_amount || 0,
    deposit_amount: (order as OrderTab1)?.deposit_amount || 0,
    shipping_fee: (order as OrderTab1)?.shipping_fee || (order as OrderTab2)?.shipping_fee || 0,
    remaining_amount: (order as OrderTab1)?.remaining_amount || 0,
    capital: (order as OrderTab2)?.capital || 0,
    profit: (order as OrderTab2)?.profit || 0,
  });

  useEffect(() => {
    if (order && isOpen) {
      // When editing, fetch full data from both tabs if order_code exists
      const fetchFullOrderData = async () => {
        if (order.order_code) {
          try {
            const [res1, res2] = await Promise.all([
              fetch(`/api/orders/tab1?search=${encodeURIComponent(order.order_code)}`),
              fetch(`/api/orders/tab2?search=${encodeURIComponent(order.order_code)}`),
            ]);
            const tab1Orders = await res1.json();
            const tab2Orders = await res2.json();
            
            const tab1Order = tab1Orders.find((o: any) => o.order_code === order.order_code);
            const tab2Order = tab2Orders.find((o: any) => o.order_code === order.order_code);
            
            setFormData({
              buyer_name: order.buyer_name || tab1Order?.buyer_name || tab2Order?.buyer_name || '',
              buyer_phone: order.buyer_phone || tab1Order?.buyer_phone || tab2Order?.buyer_phone || '',
              buyer_address: order.buyer_address || tab1Order?.buyer_address || tab2Order?.buyer_address || '',
              order_code: order.order_code || '',
              status: order.status || tab1Order?.status || tab2Order?.status || 'chưa lên đơn',
              priority: order.priority || tab1Order?.priority || tab2Order?.priority || 'Bình thường',
              quantity: (order as OrderTab1)?.quantity || tab1Order?.quantity || 0,
              reported_amount: order.reported_amount || tab1Order?.reported_amount || tab2Order?.reported_amount || 0,
              deposit_amount: (order as OrderTab1)?.deposit_amount || tab1Order?.deposit_amount || 0,
              shipping_fee: (order as OrderTab1)?.shipping_fee || (order as OrderTab2)?.shipping_fee || tab1Order?.shipping_fee || tab2Order?.shipping_fee || 0,
              remaining_amount: (order as OrderTab1)?.remaining_amount || tab1Order?.remaining_amount || 0,
              capital: (order as OrderTab2)?.capital || tab2Order?.capital || 0,
              profit: (order as OrderTab2)?.profit || tab2Order?.profit || 0,
            });
            setImageUrl(order.product_image || tab1Order?.product_image || tab2Order?.product_image || '');
          } catch (error) {
            console.error('Error fetching full order data:', error);
            // Fallback to current order data
            setFormData({
              buyer_name: order.buyer_name || '',
              buyer_phone: order.buyer_phone || '',
              buyer_address: order.buyer_address || '',
              order_code: order.order_code || '',
              status: order.status || 'chưa lên đơn',
              priority: order.priority || 'Bình thường',
              quantity: (order as OrderTab1)?.quantity || 0,
              reported_amount: order.reported_amount || 0,
              deposit_amount: (order as OrderTab1)?.deposit_amount || 0,
              shipping_fee: (order as OrderTab1)?.shipping_fee || (order as OrderTab2)?.shipping_fee || 0,
              remaining_amount: (order as OrderTab1)?.remaining_amount || 0,
              capital: (order as OrderTab2)?.capital || 0,
              profit: (order as OrderTab2)?.profit || 0,
            });
            setImageUrl(order.product_image || '');
          }
        } else {
          // No order_code, use current order data
          setFormData({
            buyer_name: order.buyer_name || '',
            buyer_phone: order.buyer_phone || '',
            buyer_address: order.buyer_address || '',
            order_code: order.order_code || '',
            status: order.status || 'chưa lên đơn',
            priority: order.priority || 'Bình thường',
            quantity: (order as OrderTab1)?.quantity || 0,
            reported_amount: order.reported_amount || 0,
            deposit_amount: (order as OrderTab1)?.deposit_amount || 0,
            shipping_fee: (order as OrderTab1)?.shipping_fee || (order as OrderTab2)?.shipping_fee || 0,
            remaining_amount: (order as OrderTab1)?.remaining_amount || 0,
            capital: (order as OrderTab2)?.capital || 0,
            profit: (order as OrderTab2)?.profit || 0,
          });
          setImageUrl(order.product_image || '');
        }
      };
      
      fetchFullOrderData();
    } else if (!order && isOpen) {
      setFormData({
        buyer_name: '',
        buyer_phone: '',
        buyer_address: '',
        order_code: '',
        status: 'chưa lên đơn',
        priority: 'Bình thường',
        quantity: 0,
        reported_amount: 0,
        deposit_amount: 0,
        shipping_fee: 0,
        remaining_amount: 0,
        capital: 0,
        profit: 0,
      });
      setImageUrl('');
    }
  }, [order, isOpen]);

  // Auto calculate remaining_amount for tab1
  useEffect(() => {
    const remaining = formData.reported_amount - formData.deposit_amount + formData.shipping_fee;
    setFormData(prev => ({ ...prev, remaining_amount: Math.max(0, remaining) }));
  }, [formData.reported_amount, formData.deposit_amount, formData.shipping_fee]);

  // Auto calculate profit - nếu trạng thái là "Huỷ đơn" thì lãi = 0
  useEffect(() => {
    const profit = formData.status === 'Huỷ đơn' ? 0 : formData.reported_amount - formData.capital;
    setFormData(prev => ({ ...prev, profit }));
  }, [formData.reported_amount, formData.capital, formData.status]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.url) {
        setImageUrl(data.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Có lỗi xảy ra khi upload ảnh');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      buyer_name: customer.name,
      buyer_phone: customer.phone || '',
      buyer_address: customer.address || '',
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (field: string, value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/[^\d]/g, '');
    
    // Remove leading zeros
    const numStr = cleaned.replace(/^0+/, '') || '0';
    const numValue = parseFloat(numStr);
    
    handleInputChange(field, numValue);
  };

  const handleNumberChange = (field: string, value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/[^\d]/g, '');
    
    // Remove leading zeros
    const numStr = cleaned.replace(/^0+/, '') || '0';
    const numValue = parseInt(numStr, 10);
    
    handleInputChange(field, numValue);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) {
      return;
    }
    
    // Validate required fields
    if (!formData.buyer_name.trim()) {
      alert('Vui lòng nhập tên người mua');
      return;
    }
    if (!formData.order_code.trim()) {
      alert('Vui lòng nhập mã vận đơn');
      return;
    }
    if (formData.quantity < 0) {
      alert('Số lượng phải lớn hơn hoặc bằng 0');
      return;
    }
    if (formData.reported_amount <= 0) {
      alert('Tiền báo khách phải lớn hơn 0');
      return;
    }
    if (formData.deposit_amount < 0) {
      alert('Tiền khách cọc phải lớn hơn hoặc bằng 0');
      return;
    }
    if (formData.shipping_fee < 0) {
      alert('Tiền Ship phải lớn hơn hoặc bằng 0');
      return;
    }
    if (formData.capital < 0) {
      alert('Vốn phải lớn hơn hoặc bằng 0');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const data: any = {};

      if (order?.id) {
        data.id = order.id;
      }

      data.product_image = imageUrl;
      data.buyer_name = formData.buyer_name;
      data.buyer_phone = formData.buyer_phone;
      data.buyer_address = formData.buyer_address;
      data.order_code = formData.order_code;
      data.status = formData.status;
      data.priority = formData.priority;

      // Tab 1 fields
      data.quantity = formData.quantity;
      data.reported_amount = formData.reported_amount;
      data.deposit_amount = formData.deposit_amount;
      data.shipping_fee = formData.shipping_fee;
      data.remaining_amount = formData.remaining_amount;

      // Tab 2 fields
      data.capital = formData.capital;
      data.profit = formData.profit;
      data.shipping_fee = formData.shipping_fee;

      await onSave(data);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4">
          {order ? 'Sửa đơn hàng' : 'Thêm đơn hàng mới'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Ảnh sản phẩm</label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 border rounded-lg hover:bg-pink-50 flex items-center gap-2 disabled:opacity-50"
              >
                <Upload size={18} />
                {isUploading ? 'Đang upload...' : 'Chọn ảnh'}
              </button>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded border"
                />
              )}
            </div>
          </div>

          {/* Buyer Info Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Thông tin người mua *</label>
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="text-pink-600 hover:text-pink-800 text-sm flex items-center gap-1"
              >
                <Users size={16} />
                Chọn từ danh sách
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên người mua *</label>
                <input
                  type="text"
                  value={formData.buyer_name}
                  onChange={(e) => handleInputChange('buyer_name', e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.buyer_phone}
                  onChange={(e) => handleInputChange('buyer_phone', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.buyer_address}
                  onChange={(e) => handleInputChange('buyer_address', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mã vận đơn *</label>
              <input
                type="text"
                value={formData.order_code}
                onChange={(e) => handleInputChange('order_code', e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Độ ưu tiên</label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tab 1 Fields */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Khách hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Số lượng *</label>
                <input
                  type="text"
                  value={formatNumberInput(formData.quantity)}
                  onChange={(e) => handleNumberChange('quantity', e.target.value)}
                  placeholder="0"
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tiền báo khách *</label>
                <input
                  type="text"
                  value={formatCurrencyInput(formData.reported_amount)}
                  onChange={(e) => handleCurrencyChange('reported_amount', e.target.value)}
                  placeholder="0"
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tiền khách cọc</label>
                <input
                  type="text"
                  value={formatCurrencyInput(formData.deposit_amount, true)}
                  onChange={(e) => handleCurrencyChange('deposit_amount', e.target.value)}
                  placeholder="0"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tiền Ship (NĐ)</label>
                <input
                  type="text"
                  value={formatCurrencyInput(formData.shipping_fee, true)}
                  onChange={(e) => handleCurrencyChange('shipping_fee', e.target.value)}
                  placeholder="0"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tiền còn lại</label>
                <input
                  type="text"
                  value={formatCurrencyInput(formData.remaining_amount)}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 bg-pink-50"
                />
              </div>
            </div>
          </div>

          {/* Tab 2 Fields */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Shop</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tiền báo khách *</label>
                <input
                  type="text"
                  value={formatCurrencyInput(formData.reported_amount)}
                  onChange={(e) => handleCurrencyChange('reported_amount', e.target.value)}
                  placeholder="0"
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vốn *</label>
                <input
                  type="text"
                  value={formatCurrencyInput(formData.capital)}
                  onChange={(e) => handleCurrencyChange('capital', e.target.value)}
                  placeholder="0"
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lãi</label>
                <input
                  type="text"
                  value={formatCurrencyInput(formData.profit)}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 bg-pink-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tiền Ship (NĐ)</label>
                <input
                  type="text"
                  value={formatCurrencyInput(formData.shipping_fee, true)}
                  onChange={(e) => handleCurrencyChange('shipping_fee', e.target.value)}
                  placeholder="0"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-pink-100 text-pink-800 py-2 rounded-lg hover:bg-pink-200 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>

        <CustomerSelectModal
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          onSelect={handleSelectCustomer}
        />
      </div>
    </div>
  );
}
