# Skill: new-feature

Quy trình phát triển tính năng mới đúng chuẩn project.

## Instructions

When this skill is invoked, follow these steps in order:

### 1. Clarify scope
If the request is vague, ask:
- Tính năng này ở route nào? (dashboard hay public?)
- Có cần thêm bảng/cột database không?
- Hiển thị dạng list/table hay form/card?

### 2. Database (nếu cần thêm schema)
- Thêm migration mới vào `supabase/migrations/`
- Cập nhật `supabase/schema.sql`
- Cập nhật types trong `src/types/database.ts` để khớp với schema mới
- Nhớ thêm RLS policy cho bảng mới (users chỉ thấy row của mình)
- Nếu cần atomic operation, tạo PostgreSQL function thay vì nhiều câu query rời

### 3. Data layer
- Tạo hook mới trong `src/hooks/use<Feature>.ts` cho client-side data fetching
- Hook dùng browser Supabase client từ `src/lib/supabase/client.ts`
- Server Component dùng server client từ `src/lib/supabase/server.ts`
- Dùng types từ `src/types/database.ts`, không định nghĩa inline type

### 4. UI
- Tạo route dưới `src/app/(dashboard)/` nếu cần trang mới
- Server Component (`page.tsx`) fetch data → pass xuống Client Components
- Nếu là list view: tạo `columns.tsx` + `data-table.tsx` theo pattern của `wallets/`, `transactions/`
- Thêm shadcn component nếu cần: `npx shadcn@latest add <component>`
- Dùng `cn()` từ `src/lib/utils.ts` cho class composition
- Form dùng controlled components + React state, không cần form library

### 5. Navigation (nếu có trang mới)
- Thêm link vào `src/components/layout/Sidebar.tsx` (desktop)
- Thêm vào `src/components/layout/BottomNav.tsx` (mobile, chỉ nếu quan trọng)

### 6. Verify
```bash
npx tsc --noEmit   # Kiểm tra type errors
npm run build      # Đảm bảo build không lỗi
```
