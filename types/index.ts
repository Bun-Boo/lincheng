export type OrderStatus = 
  | 'đã lên đơn' 
  | 'chưa lên đơn' 
  | 'nhập kho Trung' 
  | 'Shop nhận hàng' 
  | 'Giao khách' 
  | 'Huỷ đơn';

export type Priority = 'Gấp' | 'Bình thường';

export interface OrderTab1 {
  id?: number;
  stt: number;
  product_image?: string;
  buyer_name: string;
  buyer_phone?: string;
  buyer_address?: string;
  order_code: string;
  quantity: number;
  reported_amount: number;
  deposit_amount: number;
  shipping_fee: number;
  domestic_shipping_fee: number;
  remaining_amount: number;
  status: OrderStatus;
  priority: Priority;
  sync_id?: string;
  created_at: string;
}

export interface OrderTab2 {
  id?: number;
  stt: number;
  product_image?: string;
  buyer_name: string;
  buyer_phone?: string;
  buyer_address?: string;
  order_code: string;
  reported_amount: number;
  capital: number;
  profit: number;
  shipping_fee: number;
  domestic_shipping_fee: number;
  status: OrderStatus;
  priority: Priority;
  sync_id?: string;
  created_at: string;
}

export interface InventoryItem {
  id?: number;
  stt: number;
  product_image?: string;
  order_code: string;
  quantity: number;
  capital: number;
  reported_amount: number;
  profit: number;
  shipping_fee: number;
  domestic_shipping_fee: number;
  status: string;
  priority: Priority;
  note?: string;
  sync_id?: string;
  created_at: string;
}

export interface BuyerInfo {
  name: string;
  phone: string;
  address: string;
}

