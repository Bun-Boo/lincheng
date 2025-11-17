# Hướng dẫn setup Supabase cho LinCheng Store

Theo hướng dẫn chính thức của Supabase: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

## Bước 1: Tạo Supabase Project

1. Truy cập https://database.new hoặc https://supabase.com
2. Click "New Project"
3. Điền thông tin:
   - Project name
   - Database password (lưu lại password này!)
   - Region (chọn gần nhất với bạn)
4. Click "Create new project"
5. Đợi project được tạo (2-3 phút)

## Bước 2: Lấy Connection Information

1. Vào Supabase Dashboard > Project của bạn
2. Vào **Project Settings** (biểu tượng ⚙️)
3. Tab **API** - bạn sẽ thấy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Bước 3: Tạo Database Tables

1. Vào Supabase Dashboard > **SQL Editor**
2. Click **New query**
3. Copy toàn bộ nội dung từ file `supabase-schema.sql` trong project
4. Paste vào SQL Editor
5. Click **Run** (hoặc Ctrl+Enter)
6. Kiểm tra xem tables đã được tạo chưa: Vào **Table Editor**

## Bước 4: Cấu hình Environment Variables

Tạo file `.env.local` trong root của project (cùng cấp với `package.json`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Lưu ý:**
- Thay `[YOUR-PROJECT-REF]` bằng Project Reference của bạn
- Thay `your-anon-key-here` bằng anon key từ Supabase Dashboard
- Đây là 2 biến duy nhất cần thiết theo [guide chính thức của Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## Bước 5: Cài đặt Dependencies

```bash
npm install
```

## Bước 6: Chạy Development Server

```bash
npm run dev
```

Truy cập http://localhost:3000 và kiểm tra xem app có hoạt động không.

## Troubleshooting

### Lỗi: "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Kiểm tra file `.env.local` đã được tạo chưa
- Kiểm tra `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` đã được set đúng chưa
- Restart development server sau khi thay đổi `.env.local`

### Lỗi: "Connection refused" hoặc "Failed to fetch"
- Kiểm tra Supabase project có đang **active** không (không bị pause)
- Nếu project bị pause, vào Dashboard và click "Restore"
- Kiểm tra URL và key trong `.env.local` có đúng không

### Lỗi: "relation does not exist"
- Chạy SQL script trong `supabase-schema.sql` trong Supabase SQL Editor
- Kiểm tra tables đã được tạo trong Table Editor

### Lỗi: "permission denied"
- Kiểm tra RLS (Row Level Security) policies trong Supabase
- Vào **Authentication** > **Policies** để xem policies
- Có thể cần tạo policies để cho phép read/write

## Cấu trúc Files

- `utils/supabase/server.ts` - Supabase server client (theo guide chính thức) - **Được dùng trong tất cả API routes**
- `utils/supabase/client.ts` - Supabase browser client (cho client-side nếu cần)
- `supabase-schema.sql` - SQL schema để tạo tables
- `lib/supabase.ts` - Supabase client config (legacy, có thể xóa nếu không dùng)

**✅ App đã được refactor để dùng Supabase client theo guide chính thức!**
- Không cần `DATABASE_URL` nữa
- Chỉ cần `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Tất cả API routes đã được refactor để dùng Supabase client (`utils/supabase/server.ts`)

## Tham khảo

- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Documentation](https://supabase.com/docs)

