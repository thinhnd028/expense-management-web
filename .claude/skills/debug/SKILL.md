# Skill: debug

Quy trình debug có hệ thống cho project này.

## Instructions

When this skill is invoked:

### 1. Xác định loại lỗi

**Runtime error / UI không hiển thị đúng**
- Đọc full error message và stack trace
- Xác định lỗi xảy ra ở Server Component hay Client Component
- Nếu lỗi Supabase: kiểm tra RLS policy — user có quyền đọc/ghi row đó không?
- Nếu lỗi hydration: tìm sự khác biệt giữa server render và client render (thường do date formatting, `window` access, hay random values)

**Type error**
- Chạy `npx tsc --noEmit` để xem full list
- Đối chiếu với types trong `src/types/database.ts`
- Kiểm tra Supabase query có `.single()` không (trả về object thay vì array)

**Data không load / fetch sai**
- Kiểm tra đang dùng đúng Supabase client chưa: server client cho Server Components, browser client cho hooks/client components
- Kiểm tra RLS: `supabase.auth.getUser()` trả về user hợp lệ không?
- Log kết quả query: destructure `{ data, error }` và kiểm tra `error`
- Kiểm tra filter điều kiện (`.eq()`, `.gte()`) có đúng field name không

**UI / style lỗi**
- Kiểm tra `cn()` được dùng đúng chưa khi merge classes có điều kiện
- Kiểm tra Tailwind class có bị purge không (dynamic class names phải được viết đầy đủ)
- Kiểm tra shadcn component có đang nhận đúng variant/prop không

### 2. Đọc code trước khi sửa
- Đọc toàn bộ file liên quan trước khi chỉnh sửa bất kỳ dòng nào
- Trace data flow từ Supabase query → hook → component → render

### 3. Sửa
- Chỉ sửa đúng nguyên nhân gốc, không refactor code xung quanh
- Nếu lỗi Supabase RLS, fix ở `supabase/schema.sql` và tạo migration mới

### 4. Verify
```bash
npx tsc --noEmit
npm run build
```
