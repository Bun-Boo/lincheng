# Dashboard Quản Lý Đơn Hàng

Ứng dụng web mobile-first để quản lý đơn hàng được xây dựng với Next.js 14, TypeScript, và Supabase (PostgreSQL).

## Tính năng

### Tab 1 - Quản lý đơn hàng chi tiết
- STT tự động tăng
- Ảnh sản phẩm
- Tên người mua (click để xem thông tin: tên, SĐT, địa chỉ)
- Mã vận đơn
- Số lượng
- Tiền báo khách
- Tiền khách cọc
- Tiền còn lại
- Trạng thái đơn (dropdown)
- Độ ưu tiên (dropdown)
- Ngày tạo đơn

### Tab 2 - Quản lý đơn hàng với vốn/lãi
- STT tự động tăng
- Ảnh sản phẩm
- Tên người mua (click để xem thông tin)
- Mã vận đơn
- Tiền báo khách
- Vốn
- Lãi
- Trạng thái đơn
- Độ ưu tiên

### Tab 3 - Thống kê
- Tổng hợp dữ liệu từ Tab 1 và Tab 2
- Thống kê theo trạng thái
- Thống kê theo độ ưu tiên
- Các chỉ số tổng quan

### Chức năng chung
- ✅ Tìm kiếm theo mọi trường thông tin
- ✅ Lọc theo trạng thái và độ ưu tiên
- ✅ Thêm, sửa, xóa đơn hàng
- ✅ Ẩn/hiện cột tùy ý
- ✅ Responsive mobile-first design
- ✅ Supabase (PostgreSQL) database

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Cấu hình Supabase:
   - Tạo file `.env.local` với các biến môi trường (theo [guide chính thức](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)):
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```
   - Lấy các giá trị từ Supabase Dashboard > Project Settings > API
   - Chạy SQL script trong `supabase-schema.sql` trong Supabase SQL Editor

3. Chạy development server:
```bash
npm run dev
```

4. Mở trình duyệt tại [http://localhost:3000](http://localhost:3000)

## Cấu trúc dự án

```
trang/
├── app/
│   ├── api/
│   │   ├── orders/
│   │   │   ├── tab1/route.ts    # API cho Tab 1
│   │   │   └── tab2/route.ts     # API cho Tab 2
│   │   └── statistics/route.ts   # API thống kê
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Trang chính
├── components/
│   ├── BuyerInfoModal.tsx        # Modal thông tin người mua
│   ├── ColumnToggle.tsx          # Component ẩn/hiện cột
│   ├── FilterBar.tsx             # Thanh lọc và tìm kiếm
│   ├── OrderModal.tsx            # Modal thêm/sửa đơn hàng
│   └── OrderTable.tsx            # Bảng hiển thị đơn hàng
├── lib/
│   └── supabase.ts               # Supabase client config (legacy)
├── utils/
│   └── supabase/
│       ├── server.ts             # Supabase server client (theo guide chính thức)
│       └── client.ts             # Supabase browser client
├── types/
│   └── index.ts                  # TypeScript types
└── .env.local                    # Environment variables (tạo file này)
```

## Database

Ứng dụng sử dụng Supabase (PostgreSQL) để lưu trữ dữ liệu. Tables sẽ được tự động tạo khi chạy SQL script.

### Tables

**orders_tab1:**
- id, stt, product_image, buyer_name, buyer_phone, buyer_address
- order_code, quantity, reported_amount, deposit_amount, remaining_amount
- status, priority, created_at

**orders_tab2:**
- id, stt, product_image, buyer_name, buyer_phone, buyer_address
- order_code, reported_amount, capital, profit
- status, priority, created_at

**customers:**
- id, name, phone, address, created_at

**users:**
- id, username, password_hash, created_at

## Công nghệ sử dụng

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase (PostgreSQL)** - Database
- **Lucide React** - Icons

## Lưu ý

- Cần cấu hình Supabase (xem [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- Set các biến môi trường trong `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (theo [guide chính thức](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs))
- Chạy SQL script trong `supabase-schema.sql` trong Supabase SQL Editor để tạo tables
- STT tự động tăng dựa trên số lượng bản ghi hiện có
- Tất cả các cột có thể ẩn/hiện thông qua nút "Hiển thị cột"
- Ứng dụng được thiết kế mobile-first, responsive trên mọi thiết bị
- Tất cả database operations chạy qua Supabase client (theo [guide chính thức](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs))

