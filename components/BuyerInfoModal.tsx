'use client';

import { X } from 'lucide-react';
import { BuyerInfo } from '@/types';

interface BuyerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyerInfo: BuyerInfo | null;
}

export default function BuyerInfoModal({ isOpen, onClose, buyerInfo }: BuyerInfoModalProps) {
  if (!isOpen || !buyerInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4">Thông tin người mua</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-gray-600">Tên:</label>
            <p className="text-gray-900 mt-1">{buyerInfo.name}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Số điện thoại:</label>
            <p className="text-gray-900 mt-1">{buyerInfo.phone || 'Chưa có'}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Địa chỉ:</label>
            <p className="text-gray-900 mt-1">{buyerInfo.address || 'Chưa có'}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

