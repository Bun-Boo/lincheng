'use client';

import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  phone?: string;
  address?: string;
}

interface CustomerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

export default function CustomerSelectModal({ isOpen, onClose, onSelect }: CustomerSelectModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  const fetchCustomers = async (searchTerm: string = '') => {
    setLoading(true);
    try {
      const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const response = await fetch(`/api/customers${params}`);
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchCustomers(value);
  };

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    onClose();
    setSearch('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative max-h-[80vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4">Chọn khách hàng</h2>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, SĐT, địa chỉ..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border rounded-lg pl-10 pr-3 py-2"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Không tìm thấy khách hàng</div>
          ) : (
            <div className="space-y-2">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleSelect(customer)}
                  className="w-full text-left p-4 border rounded-lg hover:bg-pink-50 hover:border-pink-300 transition"
                >
                  <div className="font-semibold text-gray-900">{customer.name}</div>
                  {customer.phone && (
                    <div className="text-sm text-gray-600 mt-1">📞 {customer.phone}</div>
                  )}
                  {customer.address && (
                    <div className="text-sm text-gray-600 mt-1">📍 {customer.address}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

