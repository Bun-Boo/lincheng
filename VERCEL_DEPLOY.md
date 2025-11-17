# Hướng dẫn Deploy lên Vercel

## Bước 1: Chuẩn bị Code

1. **Kiểm tra `.gitignore`:**
   - Đảm bảo `.env*.local` đã được ignore (không commit environment variables)

2. **Commit code lên Git:**
   ```bash
   git add .
   git commit -m "Refactor to use Supabase client"
   git push origin main
   ```

3. **Đảm bảo code đã sẵn sàng:**
   - ✅ Tất cả API routes đã dùng Supabase client
   - ✅ Không còn dependencies với `pg` hoặc `better-sqlite3`
   - ✅ File `.env.local` đã được tạo (nhưng KHÔNG commit file này!)
   - ✅ Supabase tables đã được tạo (chạy `supabase-schema.sql`)

## Bước 2: Tạo Vercel Project

### Cách 1: Deploy qua Vercel Dashboard (Khuyến nghị)

1. Truy cập https://vercel.com
2. Đăng nhập hoặc tạo tài khoản
3. Click **"Add New..."** > **"Project"**
4. Import Git repository của bạn (GitHub, GitLab, hoặc Bitbucket)
5. Vercel sẽ tự động detect Next.js project

### Cách 2: Deploy qua Vercel CLI

1. Cài đặt Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

## Bước 3: Cấu hình Environment Variables trên Vercel

**QUAN TRỌNG:** Sau khi tạo project trên Vercel, bạn CẦN set environment variables:

1. Vào Vercel Dashboard > Project của bạn
2. Vào **Settings** > **Environment Variables**
3. Thêm các biến sau:

   ```
   NEXT_PUBLIC_SUPABASE_URL = https://[YOUR-PROJECT-REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
   ```

4. Chọn môi trường:
   - ✅ **Production**
   - ✅ **Preview** (cho pull requests)
   - ✅ **Development** (nếu cần)

5. Click **"Save"**

**Lưu ý:**
- Thay `[YOUR-PROJECT-REF]` bằng Project Reference của bạn
- Thay `your-anon-key-here` bằng anon key từ Supabase Dashboard
- **KHÔNG** cần `DATABASE_URL` (app đã dùng Supabase client)

## Bước 4: Cấu hình Supabase cho Production

### 4.1. Kiểm tra Supabase Project

1. Vào Supabase Dashboard
2. Đảm bảo project đang **active** (không bị pause)
3. Kiểm tra tables đã được tạo chưa (chạy SQL script nếu chưa)

### 4.2. Cấu hình RLS (Row Level Security) Policies

**Cách 1: Disable RLS (cho development/testing - KHÔNG an toàn nhưng đơn giản):**
1. Vào Supabase Dashboard > **Table Editor**
2. Chọn từng table (`orders_tab1`, `orders_tab2`, `customers`, `users`)
3. Click **Settings** (icon bánh răng)
4. Tắt **Enable Row Level Security**

**Cách 2: Tạo Policies (khuyến nghị):**

Vào Supabase Dashboard > **SQL Editor** và chạy script sau:

```sql
-- Cho table orders_tab1
CREATE POLICY "Allow all operations on orders_tab1"
ON orders_tab1
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Cho table orders_tab2
CREATE POLICY "Allow all operations on orders_tab2"
ON orders_tab2
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Cho table customers
CREATE POLICY "Allow all operations on customers"
ON customers
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Cho table users
CREATE POLICY "Allow all operations on users"
ON users
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
```

**Lưu ý:** 
- Policies trên cho phép public access (anon role) - phù hợp cho development
- Cho production, nên tạo policies nghiêm ngặt hơn hoặc dùng Supabase Auth

## Bước 5: Deploy

### Nếu dùng Vercel Dashboard:
1. Sau khi set environment variables, Vercel sẽ tự động deploy
2. Hoặc vào **Deployments** tab và click **"Redeploy"**

### Nếu dùng Vercel CLI:
```bash
vercel --prod
```

## Bước 6: Kiểm tra sau khi Deploy

1. Vào Vercel Dashboard > **Deployments**
2. Click vào deployment mới nhất
3. Mở URL của app (ví dụ: `https://your-app.vercel.app`)
4. Kiểm tra:
   - App có load được không?
   - API routes có hoạt động không?
   - Database connection có OK không?

## Bước 7: Troubleshooting

### Lỗi: "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Kiểm tra environment variables đã được set trên Vercel chưa
- Đảm bảo đã chọn đúng môi trường (Production, Preview, Development)
- Redeploy sau khi thêm environment variables

### Lỗi: "Failed to fetch" hoặc "Connection refused"
- Kiểm tra Supabase project có đang **active** không
- Kiểm tra RLS policies đã được tạo chưa
- Kiểm tra `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` có đúng không

### Lỗi: "relation does not exist"
- Chạy SQL script trong `supabase-schema.sql` trong Supabase SQL Editor
- Kiểm tra tables đã được tạo trong Table Editor

### Lỗi: "permission denied"
- Kiểm tra RLS policies trong Supabase Dashboard
- Đảm bảo policies cho phép `anon` role read/write

## Bước 8: Custom Domain (Tùy chọn)

1. Vào Vercel Dashboard > Project > **Settings** > **Domains**
2. Thêm domain của bạn
3. Follow hướng dẫn để cấu hình DNS

## Lưu ý quan trọng

- ✅ **KHÔNG** commit file `.env.local` vào Git
- ✅ Environment variables phải được set trên Vercel Dashboard
- ✅ Supabase project phải ở trạng thái **active**
- ✅ RLS policies phải được cấu hình đúng
- ✅ Tables phải được tạo trước khi deploy

## Checklist trước khi Deploy

- [ ] Code đã được commit và push lên Git
- [ ] Supabase project đã active
- [ ] Tables đã được tạo (chạy `supabase-schema.sql`)
- [ ] RLS policies đã được cấu hình
- [ ] Environment variables đã được set trên Vercel
- [ ] Đã test app ở local với Supabase

## Tham khảo

- [Vercel Deployment Guide](https://vercel.com/docs/deployments/overview)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Next.js on Vercel](https://nextjs.org/docs/deployment)

