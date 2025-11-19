'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, BarChart3, Upload } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import OrderTable from '@/components/OrderTable';
import OrderModal from '@/components/OrderModal';
import BuyerInfoModal from '@/components/BuyerInfoModal';
import ColumnToggle from '@/components/ColumnToggle';
import LoginModal from '@/components/LoginModal';
import { OrderTab1, OrderTab2, BuyerInfo } from '@/types';

type TabType = 'tab1' | 'tab2' | 'tab3' | 'tab4';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('tab1');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [ordersTab1, setOrdersTab1] = useState<OrderTab1[]>([]);
  const [ordersTab2, setOrdersTab2] = useState<OrderTab2[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [datePeriod, setDatePeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const isSavingRef = useRef(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Check authentication on mount - không lưu vào localStorage để mỗi lần vào phải đăng nhập lại
  useEffect(() => {
    // Không load từ localStorage, luôn yêu cầu đăng nhập
    setIsAuthenticated(false);
  }, []);

  // Load logo from localStorage on mount
  useEffect(() => {
    const savedLogo = localStorage.getItem('linChengLogo');
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
  }, []);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        // Try to parse error message
        let errorMessage = 'Đăng nhập thất bại';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error(data.error || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleRegister = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        // Try to parse error message
        let errorMessage = 'Đăng ký thất bại';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success) {
        // After successful registration, automatically login
        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error(data.error || 'Đăng ký thất bại');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Set default to current month (from day 1)
  useEffect(() => {
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
    
    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(lastDay));
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderTab1 | OrderTab2 | null>(null);
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo | null>(null);
  const [visibleColumnsTab1, setVisibleColumnsTab1] = useState<{ [key: string]: boolean }>({
    stt: true,
    product_image: true,
    buyer_name: true,
    order_code: true,
    quantity: true,
    reported_amount: true,
    deposit_amount: true,
    shipping_fee: true,
    domestic_shipping_fee: true,
    remaining_amount: true,
    status: true,
    priority: true,
    created_at: true,
  });
  const [visibleColumnsTab2, setVisibleColumnsTab2] = useState<{ [key: string]: boolean }>({
    stt: true,
    product_image: true,
    buyer_name: true,
    order_code: true,
    reported_amount: true,
    capital: true,
    profit: true,
    shipping_fee: true,
    domestic_shipping_fee: true,
    status: true,
    priority: true,
  });

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      
      // Add date filter - always use custom with startDate and endDate for month
      if (datePeriod === 'month' || datePeriod === 'custom') {
        if (startDate && endDate) {
          params.append('period', 'custom');
          params.append('startDate', startDate);
          params.append('endDate', endDate);
        }
      } else if (datePeriod === 'day' || datePeriod === 'week') {
        params.append('period', datePeriod);
      }

      const [res1, res2] = await Promise.all([
        fetch(`/api/orders/tab1?${params.toString()}`),
        fetch(`/api/orders/tab2?${params.toString()}`),
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();

      setOrdersTab1(data1);
      setOrdersTab2(data2);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchOrders();
      setCurrentPage(1); // Reset to first page when filters change
    }
  }, [search, statusFilter, priorityFilter, datePeriod, startDate, endDate]);

  // Calculate paginated orders
  const getPaginatedOrders = () => {
    const orders = activeTab === 'tab1' ? ordersTab1 : ordersTab2;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return orders.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(
    ((activeTab === 'tab1' ? ordersTab1 : ordersTab2).length || 0) / pageSize
  );

  const totalOrders = activeTab === 'tab1' ? ordersTab1.length : ordersTab2.length;

  const handleAdd = () => {
    setSelectedOrder(null);
    setIsModalOpen(true);
  };

  const handleEdit = (order: OrderTab1 | OrderTab2) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này? Đơn hàng sẽ bị xóa ở cả 2 tab.')) return;

    try {
      // Get order_code from current state
      const currentOrders = activeTab === 'tab1' ? ordersTab1 : ordersTab2;
      const orderToDelete = currentOrders.find((o) => o.id === id);
      
      if (!orderToDelete) {
        alert('Không tìm thấy đơn hàng');
        return;
      }

      const orderCode = orderToDelete.order_code;

      // Delete from current tab
      const currentEndpoint = activeTab === 'tab1' ? '/api/orders/tab1' : '/api/orders/tab2';
      const deletePromises = [
        fetch(`${currentEndpoint}?id=${id}`, { method: 'DELETE' })
      ];

      // Find and delete from other tab
      const otherTabEndpoint = activeTab === 'tab1' ? '/api/orders/tab2' : '/api/orders/tab1';
      const otherOrders = activeTab === 'tab1' ? ordersTab2 : ordersTab1;
      const otherTabOrder = otherOrders.find((o) => o.order_code === orderCode);

      if (otherTabOrder?.id) {
        deletePromises.push(
          fetch(`${otherTabEndpoint}?id=${otherTabOrder.id}`, { method: 'DELETE' })
        );
      }

      await Promise.all(deletePromises);
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Có lỗi xảy ra khi xóa đơn hàng');
    }
  };

  const handleSave = async (data: any) => {
    // Prevent duplicate submission
    if (isSavingRef.current) {
      console.log('Save already in progress, ignoring duplicate call');
      return;
    }
    
    isSavingRef.current = true;
    
    try {
      // Save/update customer information first (for both create and edit)
      if (data.buyer_name && data.buyer_name.trim()) {
        try {
          // Get all customers to check for exact match
          const allCustomersRes = await fetch('/api/customers');
          const allCustomers = await allCustomersRes.json();
          
          // Check if customer exists by exact phone match first, then by exact name match
          let existingCustomer = null;
          if (data.buyer_phone && data.buyer_phone.trim()) {
            existingCustomer = allCustomers.find((c: any) => 
              c.phone && c.phone.trim() === data.buyer_phone.trim()
            );
          }
          
          // If not found by phone, try to find by exact name
          if (!existingCustomer) {
            existingCustomer = allCustomers.find((c: any) => 
              c.name && c.name.trim() === data.buyer_name.trim()
            );
          }

          // If customer doesn't exist, create new customer
          if (!existingCustomer) {
            await fetch('/api/customers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: data.buyer_name.trim(),
                phone: (data.buyer_phone || '').trim(),
                address: (data.buyer_address || '').trim(),
              }),
            });
          } else {
            // Update existing customer if any information is different
            const needsUpdate = 
              existingCustomer.name !== data.buyer_name.trim() ||
              (data.buyer_phone && existingCustomer.phone !== data.buyer_phone.trim()) ||
              (data.buyer_address && existingCustomer.address !== data.buyer_address.trim());
            
            if (needsUpdate) {
              await fetch('/api/customers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: existingCustomer.id,
                  name: data.buyer_name.trim(),
                  phone: (data.buyer_phone || existingCustomer.phone || '').trim(),
                  address: (data.buyer_address || existingCustomer.address || '').trim(),
                }),
              });
            }
          }
        } catch (error) {
          console.error('Error saving customer:', error);
          // Don't throw error, just log it - order creation should continue
        }
      }

      // Validate order_code is provided
      if (!data.order_code || !data.order_code.trim()) {
        alert('Vui lòng nhập mã vận đơn');
        return;
      }

      // Common fields that should be synced between tabs
      const commonFields = {
        product_image: data.product_image,
        buyer_name: data.buyer_name,
        buyer_phone: data.buyer_phone,
        buyer_address: data.buyer_address,
        order_code: data.order_code,
        reported_amount: data.reported_amount,
        shipping_fee: data.shipping_fee,
        domestic_shipping_fee: data.domestic_shipping_fee,
        status: data.status,
        priority: data.priority,
      };

      // If editing, find and update both tabs
      if (data.id) {
        // Get current order to get sync_id
        const currentOrders = activeTab === 'tab1' ? ordersTab1 : ordersTab2;
        const currentOrder = currentOrders.find((o: any) => o.id === data.id);
        const syncId = currentOrder?.sync_id || data.sync_id;

        // Find corresponding order in the other tab
        const otherTabEndpoint = activeTab === 'tab1' ? '/api/orders/tab2' : '/api/orders/tab1';
        const otherTabOrders = activeTab === 'tab1' ? ordersTab2 : ordersTab1;
        
        // Try to find by sync_id first (preferred method)
        let otherTabOrder = syncId ? otherTabOrders.find((o: any) => o.sync_id === syncId) : null;
        
        // Fallback: If not found by sync_id and order_code exists, try to find by order_code
        // This handles existing data that might not have been linked yet
        if (!otherTabOrder && data.order_code) {
          const matchingByCode = otherTabOrders.find(
            (o: any) => o.order_code && o.order_code.trim() === data.order_code.trim()
          );
          if (matchingByCode) {
            otherTabOrder = matchingByCode;
            // If found by order_code but sync_id is different, update sync_id to match
            // This will link them for future syncs
            if (syncId && matchingByCode.sync_id !== syncId) {
              // We'll update the other tab's sync_id when we sync the data
            }
          }
        }

        // Update both tabs
        const updatePromises = [];
        
        // Update current tab with full data (include sync_id to maintain sync)
        const currentEndpoint = activeTab === 'tab1' ? '/api/orders/tab1' : '/api/orders/tab2';
        const currentTabData = { ...data };
        // Use sync_id from current order, or from other tab if found, or create new one
        const finalSyncId = syncId || (otherTabOrder?.sync_id) || crypto.randomUUID();
        currentTabData.sync_id = finalSyncId;
        const currentTabUpdate = fetch(currentEndpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentTabData),
        }).then(async (res) => {
          if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Lỗi không xác định' }));
            throw new Error(error.error || `Lỗi khi cập nhật đơn hàng ở tab ${activeTab === 'tab1' ? 'Khách Hàng' : 'Shop'}`);
          }
          return res;
        });
        updatePromises.push(currentTabUpdate);

        // Update other tab if order exists - sync all common fields
        if (otherTabOrder?.id) {
          // Prepare sync data - sync all common fields, keep tab-specific fields from existing order
          // Use sync_id from current order to link them (or create new one if neither has it)
          const finalSyncId = syncId || otherTabOrder.sync_id || crypto.randomUUID();
          
          const syncData: any = {
            id: otherTabOrder.id,
            ...commonFields,
            sync_id: finalSyncId, // Link them with same sync_id
          };

          // Keep tab-specific fields from existing order
          if (activeTab === 'tab1') {
            // Updating tab1, so keep tab2's capital and profit
            syncData.capital = (otherTabOrder as any).capital || 0;
            syncData.profit = (otherTabOrder as any).profit || 0;
          } else {
            // Updating tab2, so keep tab1's quantity, deposit_amount, remaining_amount
            syncData.quantity = (otherTabOrder as any).quantity || 0;
            syncData.deposit_amount = (otherTabOrder as any).deposit_amount || 0;
            syncData.remaining_amount = (otherTabOrder as any).remaining_amount || 0;
          }

          const otherTabUpdate = fetch(otherTabEndpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(syncData),
          }).then(async (res) => {
            if (!res.ok) {
              const error = await res.json().catch(() => ({ error: 'Lỗi không xác định' }));
              throw new Error(error.error || `Lỗi khi cập nhật đơn hàng ở tab ${activeTab === 'tab1' ? 'Shop' : 'Khách Hàng'}`);
            }
            return res;
          });
          updatePromises.push(otherTabUpdate);
        } else {
          // If order doesn't exist in other tab, create it with synced common fields
          const createData: any = {
            ...commonFields,
            sync_id: syncId || crypto.randomUUID(), // Use existing sync_id or create new one
          };
          
          // Set default values for tab-specific fields
          if (activeTab === 'tab1') {
            // Creating in tab2, set default capital and profit
            createData.capital = data.capital || 0;
            createData.profit = data.profit || 0;
          } else {
            // Creating in tab1, set default quantity, deposit_amount, remaining_amount
            createData.quantity = data.quantity || 0;
            createData.deposit_amount = data.deposit_amount || 0;
            createData.remaining_amount = data.remaining_amount || 0;
          }

          updatePromises.push(
            fetch(otherTabEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(createData),
            })
          );
        }

        await Promise.all(updatePromises);
      } else {
        // If creating new, create orders in both tabs with synced common fields
        // Generate a shared sync_id for both tabs
        const sharedSyncId = crypto.randomUUID();

        // Prepare data for tab1
        const tab1Data: any = {
          ...commonFields,
          quantity: data.quantity || 0,
          deposit_amount: data.deposit_amount || 0,
          remaining_amount: data.remaining_amount || 0,
          sync_id: sharedSyncId, // Use same sync_id for both tabs
        };

        // Prepare data for tab2
        const tab2Data: any = {
          ...commonFields,
          capital: data.capital || 0,
          profit: data.profit || 0,
          sync_id: sharedSyncId, // Use same sync_id for both tabs
        };

        const [res1, res2] = await Promise.all([
          fetch('/api/orders/tab1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tab1Data),
          }),
          fetch('/api/orders/tab2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tab2Data),
          }),
        ]);

        if (!res1.ok) {
          const error1 = await res1.json().catch(() => ({ error: 'Lỗi không xác định khi tạo đơn hàng ở tab Khách Hàng' }));
          throw new Error(error1.error || 'Lỗi khi tạo đơn hàng ở tab Khách Hàng');
        }

        if (!res2.ok) {
          const error2 = await res2.json().catch(() => ({ error: 'Lỗi không xác định khi tạo đơn hàng ở tab Shop' }));
          throw new Error(error2.error || 'Lỗi khi tạo đơn hàng ở tab Shop');
        }
      }

      setIsModalOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Có lỗi xảy ra khi lưu đơn hàng');
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleBuyerClick = (buyer: { name: string; phone?: string; address?: string }) => {
    setBuyerInfo({
      name: buyer.name,
      phone: buyer.phone || '',
      address: buyer.address || '',
    });
    setIsBuyerModalOpen(true);
  };

  const toggleColumn = (key: string) => {
    if (activeTab === 'tab1') {
      setVisibleColumnsTab1((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    } else {
      setVisibleColumnsTab2((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }
  };

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image file
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const newLogoUrl = data.url;
      
      setLogoUrl(newLogoUrl);
      localStorage.setItem('linChengLogo', newLogoUrl);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Lỗi khi upload ảnh logo');
    } finally {
      setIsUploadingLogo(false);
      // Reset input
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  const getColumnConfig = () => {
    if (activeTab === 'tab1') {
      return [
        { key: 'stt', label: 'STT' },
        { key: 'product_image', label: 'Ảnh sản phẩm' },
        { key: 'buyer_name', label: 'Tên người mua' },
        { key: 'order_code', label: 'Mã vận đơn' },
        { key: 'quantity', label: 'Số lượng' },
        { key: 'reported_amount', label: 'Tiền báo khách' },
        { key: 'deposit_amount', label: 'Tiền khách cọc' },
        { key: 'shipping_fee', label: 'Ship VN' },
        { key: 'domestic_shipping_fee', label: 'Ship NĐ' },
        { key: 'remaining_amount', label: 'Tiền còn lại' },
        { key: 'status', label: 'Trạng thái đơn' },
        { key: 'priority', label: 'Độ ưu tiên' },
        { key: 'created_at', label: 'Ngày tạo đơn' },
      ].map((col) => ({
        ...col,
        visible: visibleColumnsTab1[col.key] !== false,
      }));
    } else {
      return [
        { key: 'stt', label: 'STT' },
        { key: 'product_image', label: 'Ảnh' },
        { key: 'buyer_name', label: 'Tên người mua' },
        { key: 'order_code', label: 'Mã vận đơn' },
        { key: 'reported_amount', label: 'Tiền báo khách' },
        { key: 'capital', label: 'Vốn' },
        { key: 'profit', label: 'Lãi' },
        { key: 'shipping_fee', label: 'Ship VN' },
        { key: 'domestic_shipping_fee', label: 'Ship NĐ' },
        { key: 'status', label: 'Trạng thái đơn' },
        { key: 'priority', label: 'Độ ưu tiên' },
      ].map((col) => ({
        ...col,
        visible: visibleColumnsTab2[col.key] !== false,
      }));
    }
  };

  // Show login modal if not authenticated
  if (!isAuthenticated) {
    return <LoginModal isOpen={true} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <div
              onClick={handleLogoClick}
              className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-lg cursor-pointer transition-opacity hover:opacity-80 overflow-hidden ${
                !logoUrl && 'bg-gradient-to-br from-pink-500 to-rose-500'
              }`}
              title="Click để đổi logo"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback nếu ảnh không load được
                    (e.target as HTMLImageElement).style.display = 'none';
                    setLogoUrl('');
                    localStorage.removeItem('linChengLogo');
                  }}
                />
              ) : (
                <>
                  {isUploadingLogo ? (
                    <Upload size={20} className="animate-pulse text-white" />
                  ) : (
                    <span className="text-white font-bold text-xl">LC</span>
                  )}
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">LinCheng Store</h1>
          </div>
          <div className="flex flex-wrap gap-2 border-b">
            <button
              onClick={() => setActiveTab('tab1')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'tab1'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Khách Hàng
            </button>
            <button
              onClick={() => setActiveTab('tab2')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'tab2'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Shop
            </button>
            <button
              onClick={() => setActiveTab('tab3')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'tab3'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              <BarChart3 className="inline mr-1" size={18} />
              Thống kê
            </button>
            <button
              onClick={() => setActiveTab('tab4')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'tab4'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Phóng sinh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'tab3' ? (
          <StatisticsTab />
        ) : activeTab === 'tab4' ? (
          <PhongSinhTab />
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-4 items-center justify-between">
              <button
                onClick={handleAdd}
                className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition flex items-center gap-2"
              >
                <Plus size={20} />
                Thêm đơn hàng
              </button>
              <ColumnToggle
                columns={getColumnConfig()}
                onToggle={toggleColumn}
              />
            </div>

            <FilterBar
              search={search}
              onSearchChange={setSearch}
              status={statusFilter}
              onStatusChange={setStatusFilter}
              priority={priorityFilter}
              onPriorityChange={setPriorityFilter}
              datePeriod={datePeriod}
              onDatePeriodChange={setDatePeriod}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
              onReset={() => {
                setSearch('');
                setStatusFilter('');
                setPriorityFilter('');
                setDatePeriod('month');
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
                
                setStartDate(formatDate(firstDay));
                setEndDate(formatDate(lastDay));
              }}
            />

            <OrderTable
              orders={getPaginatedOrders()}
              type={activeTab}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onBuyerClick={handleBuyerClick}
              visibleColumns={activeTab === 'tab1' ? visibleColumnsTab1 : visibleColumnsTab2}
              pageSize={pageSize}
            />

            {/* Pagination Controls */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Hiển thị:</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded-lg px-3 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                </select>
                <span className="text-sm text-gray-600">
                  / {totalOrders} bản ghi
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50"
                >
                  Đầu
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50"
                >
                  Trước
                </button>
                <span className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50"
                >
                  Sau
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50"
                >
                  Cuối
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        onSave={handleSave}
        order={selectedOrder}
        type={activeTab === 'tab3' || activeTab === 'tab4' ? 'tab1' : activeTab}
      />

      <BuyerInfoModal
        isOpen={isBuyerModalOpen}
        onClose={() => setIsBuyerModalOpen(false)}
        buyerInfo={buyerInfo}
      />
    </div>
  );
}

function StatisticsTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchStats = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('period', period);
    if (period === 'custom' && startDate && endDate) {
      params.append('startDate', startDate);
      params.append('endDate', endDate);
    }

    fetch(`/api/statistics?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching statistics:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, [period, startDate, endDate]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-500">Không thể tải dữ liệu thống kê</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Thống kê tổng hợp</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              if (e.target.value !== 'custom') {
                setStartDate('');
                setEndDate('');
              }
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="day">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="custom">Tùy chọn</option>
          </select>
          {period === 'custom' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-gray-600">đến</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Tổng quan</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-pink-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Tổng số khách hàng (theo SĐT)</div>
            <div className="text-2xl font-bold text-pink-600">
              {stats?.uniqueCustomers || 0}
            </div>
          </div>
          <div className="bg-rose-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Tổng vốn</div>
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(stats?.tab2?.total?.total_capital || 0)}
            </div>
          </div>
          <div className="bg-pink-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Tổng lãi</div>
            <div className="text-2xl font-bold text-pink-700">
              {formatCurrency(stats?.tab2?.total?.total_profit || 0)}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function PhongSinhTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Set default to current month (from day 1)
  useEffect(() => {
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
    
    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(lastDay));
  }, []);

  const fetchStats = () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    const params = new URLSearchParams();
    if (period === 'custom' || period === 'month') {
      params.append('period', 'custom');
      params.append('startDate', startDate);
      params.append('endDate', endDate);
    } else {
      params.append('period', period);
    }

    fetch(`/api/phongsinh?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching phong sinh statistics:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchStats();
    }
  }, [period, startDate, endDate]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-500">Không thể tải dữ liệu</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Phóng sinh</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={period}
            onChange={(e) => {
              const newPeriod = e.target.value;
              setPeriod(newPeriod);
              if (newPeriod === 'day') {
                const today = new Date().toISOString().split('T')[0];
                setStartDate(today);
                setEndDate(today);
              } else if (newPeriod === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                setStartDate(weekAgo.toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);
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
                
                setStartDate(formatDate(firstDay));
                setEndDate(formatDate(lastDay));
              }
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="day">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">Tháng hiện tại</option>
            <option value="custom">Tùy chọn</option>
          </select>
          {(period === 'custom' || period === 'month') && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-gray-600">đến</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-pink-50 p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">Tổng số đơn ở trạng thái "Giao khách"</div>
          <div className="text-3xl font-bold text-pink-600">
            {stats?.totalDeliveredOrders || 0}
          </div>
        </div>
        <div className="bg-rose-50 p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">Tổng tiền lãi</div>
          <div className="text-3xl font-bold text-rose-600">
            {formatCurrency(stats?.totalProfit || 0)}
          </div>
        </div>
        <div className="bg-pink-100 p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">Tiền phóng sinh (10%)</div>
          <div className="text-3xl font-bold text-pink-700">
            {formatCurrency(stats?.phongSinh || 0)}
          </div>
        </div>
      </div>
    </div>
  );
}

