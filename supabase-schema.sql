-- LinCheng Store Database Schema for Supabase (PostgreSQL)
-- Run this script in Supabase SQL Editor to create all tables

-- Table: orders_tab1 (Khách Hàng)
CREATE TABLE IF NOT EXISTS orders_tab1 (
  id SERIAL PRIMARY KEY,
  stt INTEGER NOT NULL,
  product_image TEXT,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT,
  buyer_address TEXT,
  order_code TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  reported_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  deposit_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  shipping_fee DOUBLE PRECISION NOT NULL DEFAULT 0,
  remaining_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'chưa lên đơn',
  priority TEXT NOT NULL DEFAULT 'Bình thường',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table: orders_tab2 (Shop)
CREATE TABLE IF NOT EXISTS orders_tab2 (
  id SERIAL PRIMARY KEY,
  stt INTEGER NOT NULL,
  product_image TEXT,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT,
  buyer_address TEXT,
  order_code TEXT NOT NULL,
  reported_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  capital DOUBLE PRECISION NOT NULL DEFAULT 0,
  profit DOUBLE PRECISION NOT NULL DEFAULT 0,
  shipping_fee DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'chưa lên đơn',
  priority TEXT NOT NULL DEFAULT 'Bình thường',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table: customers
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table: users (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for orders_tab1
CREATE INDEX IF NOT EXISTS idx_tab1_order_code ON orders_tab1(order_code);
CREATE INDEX IF NOT EXISTS idx_tab1_buyer_name ON orders_tab1(buyer_name);
CREATE INDEX IF NOT EXISTS idx_tab1_created_at ON orders_tab1(created_at);
CREATE INDEX IF NOT EXISTS idx_tab1_status ON orders_tab1(status);

-- Indexes for orders_tab2
CREATE INDEX IF NOT EXISTS idx_tab2_order_code ON orders_tab2(order_code);
CREATE INDEX IF NOT EXISTS idx_tab2_buyer_name ON orders_tab2(buyer_name);
CREATE INDEX IF NOT EXISTS idx_tab2_created_at ON orders_tab2(created_at);
CREATE INDEX IF NOT EXISTS idx_tab2_status ON orders_tab2(status);

-- Indexes for customers
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Comments for documentation
COMMENT ON TABLE orders_tab1 IS 'Orders from Khách Hàng tab';
COMMENT ON TABLE orders_tab2 IS 'Orders from Shop tab';
COMMENT ON TABLE customers IS 'Customer information';
COMMENT ON TABLE users IS 'User authentication';

