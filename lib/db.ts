import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Use /tmp on Vercel (serverless), or data/ directory locally
const isVercel = process.env.VERCEL === '1';
const dbDir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'dashboard.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create db directory:', error);
  }
}

let db: Database.Database;
try {
  db = new Database(dbPath);
  console.log('Database initialized at:', dbPath);
} catch (error: any) {
  console.error('Failed to initialize database at', dbPath, ':', error);
  // Fallback: try in-memory database if file system fails
  try {
    db = new Database(':memory:');
    console.warn('Using in-memory database as fallback');
  } catch (fallbackError) {
    console.error('Failed to create in-memory database:', fallbackError);
    throw fallbackError;
  }
}

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS orders_tab1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stt INTEGER NOT NULL,
    product_image TEXT,
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT,
    buyer_address TEXT,
    order_code TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    reported_amount REAL NOT NULL DEFAULT 0,
    deposit_amount REAL NOT NULL DEFAULT 0,
    shipping_fee REAL NOT NULL DEFAULT 0,
    remaining_amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'chưa lên đơn',
    priority TEXT NOT NULL DEFAULT 'Bình thường',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders_tab2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stt INTEGER NOT NULL,
    product_image TEXT,
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT,
    buyer_address TEXT,
    order_code TEXT NOT NULL,
    reported_amount REAL NOT NULL DEFAULT 0,
    capital REAL NOT NULL DEFAULT 0,
    profit REAL NOT NULL DEFAULT 0,
    shipping_fee REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'chưa lên đơn',
    priority TEXT NOT NULL DEFAULT 'Bình thường',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_tab1_order_code ON orders_tab1(order_code);
  CREATE INDEX IF NOT EXISTS idx_tab1_buyer_name ON orders_tab1(buyer_name);
  CREATE INDEX IF NOT EXISTS idx_tab2_order_code ON orders_tab2(order_code);
  CREATE INDEX IF NOT EXISTS idx_tab2_buyer_name ON orders_tab2(buyer_name);
  CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
`);

// Initialize STT counters
const initSttCounters = () => {
  const maxStt1 = db.prepare('SELECT MAX(stt) as max FROM orders_tab1').get() as { max: number | null };
  const maxStt2 = db.prepare('SELECT MAX(stt) as max FROM orders_tab2').get() as { max: number | null };
  
  if (!maxStt1.max) {
    db.prepare('INSERT INTO orders_tab1 (stt, buyer_name, order_code, quantity) VALUES (1, ?, ?, 0)')
      .run('Sample Order', 'ORD-001');
    db.prepare('DELETE FROM orders_tab1 WHERE buyer_name = ?').run('Sample Order');
  }
  
  if (!maxStt2.max) {
    db.prepare('INSERT INTO orders_tab2 (stt, buyer_name, order_code) VALUES (1, ?, ?)')
      .run('Sample Order', 'ORD-001');
    db.prepare('DELETE FROM orders_tab2 WHERE buyer_name = ?').run('Sample Order');
  }
};

initSttCounters();

export default db;

