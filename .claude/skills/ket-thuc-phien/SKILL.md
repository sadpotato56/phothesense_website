---
name: ket-thuc-phien
description: Quy trình kết thúc phiên làm việc của dự án PhotheSense. Dùng khi chủ dự án nói "kết thúc phiên", "kết thúc phiên làm việc", "end session", "tổng kết phiên" hoặc gọi /ket-thuc-phien. Tắt theo dõi tự động, thu thập trạng thái (GitHub, máy tính, ROADMAP), tóm tắt phiên bằng tiếng Việt và viết prompt cho phiên sau. Không sửa code, không mở PR, không merge.
---

# Kết thúc phiên làm việc

Làm đúng 4 bước dưới đây, theo thứ tự. **Không sửa code, không mở PR, không merge** trong quy trình này.

## Quy tắc gốc của chủ dự án (nguyên văn)

```
Kết thúc phiên làm việc. Làm lần lượt:

1. TẮT THEO DÕI TỰ ĐỘNG
   - Tắt mọi lịch tự kiểm tra / scheduled task / theo dõi PR mà phiên này đã tạo.
   - TUYỆT ĐỐI KHÔNG đóng, xoá hay merge PR nào. PR chưa merge phải giữ nguyên.
   - Nếu phiên này không có gì để tắt thì ghi "Không có gì cần tắt".

2. THU THẬP THÔNG TIN (dùng những công cụ bạn có; không có thì bỏ qua và ghi rõ)
   - Toàn bộ cuộc trò chuyện của phiên này: đã làm gì, đang dở gì, tôi đã quyết gì.
   - GitHub repo sadpotato56/phothesense_website: danh sách PR đang mở (số, tên nhánh,
     đã merge chưa, link xem trước Cloudflare nếu có), commit mới nhất của main.
   - Máy tính (nếu truy cập được D:\PhotheSense\Website\PTS_WEBSITE): nhánh hiện tại,
     commit chưa push, file chưa commit.
   - CLAUDE.md và ROADMAP.md: bước nào xong, bước nào tiếp theo.

3. TÓM TẮT PHIÊN (ngắn, tiếng Việt)
   - Đã xong
   - Đang dở / chưa push / PR chờ merge (kèm link)
   - Việc của tôi (ảnh, dữ liệu, kiểm tra nội dung…)
   - Còn chờ tôi quyết

4. PROMPT CHO PHIÊN SAU
   Viết một prompt hoàn chỉnh để tôi dán vào phiên mới (Claude Code hoặc Project),
   gồm: tình trạng dự án, cách làm việc (theo CLAUDE.md và quy tắc tôi đã đặt),
   việc đầu tiên cần làm, việc tiếp theo, việc chờ tôi quyết, và nhắc lại nguyên văn
   quy tắc "kết thúc phiên làm việc" này.

Không sửa code, không mở PR, không merge trong bước này.
```

## Cách làm từng bước (gợi ý công cụ)

### 1. Tắt theo dõi tự động
- Routine / lịch hẹn (phiên đám mây): liệt kê bằng `list_triggers`, chỉ xoá những cái **phiên này** tạo (`delete_trigger`).
- Theo dõi PR: `unsubscribe_pr_activity` cho từng PR phiên này đã đăng ký.
- Tác vụ định kỳ trong Claude Code (`/loop`, CronCreate): liệt kê rồi tắt.
- Server chạy nền (ví dụ `astro preview`, `astro dev`): tắt.
- Không có gì → ghi "Không có gì cần tắt".

### 2. Thu thập thông tin
- **GitHub:** liệt kê PR (state `all`, lấy vài PR gần nhất) → số, tên nhánh, open/merged.
  Link xem trước Cloudflare nằm trong comment của bot `cloudflare-workers-and-pages[bot]` trên mỗi PR
  (có "Commit Preview URL" và "Branch Preview URL").
- **Commit mới nhất của main:** `git fetch origin main && git log -1 --oneline origin/main`.
- **Máy tính:** chỉ khi đang chạy trên máy của chủ dự án:
  `git branch --show-current`, `git status --short`, `git log --oneline @{u}..HEAD`.
  Phiên đám mây không truy cập được ổ `D:\` → ghi rõ là không truy cập được.
- **ROADMAP.md / CLAUDE.md:** đọc bản trên `main`, liệt kê `[x]` đã xong và `[ ]` tiếp theo.
  Ghi chú nếu ROADMAP lệch với thực tế (ví dụ việc đã làm nhưng chưa đánh dấu).

### 3. Tóm tắt phiên
Ngắn gọn, tiếng Việt, đúng 4 mục: Đã xong / Đang dở – chưa push – PR chờ merge (kèm link) /
Việc của chủ dự án / Còn chờ chủ dự án quyết. Chỉ ghi điều đã kiểm tra được, không đoán.

### 4. Prompt cho phiên sau
Viết trong một khối code để dễ copy, gồm:
- Tình trạng dự án (commit main, PR đang mở, bước ROADMAP hiện tại).
- Cách làm việc: tóm tắt quy tắc trong `CLAUDE.md` + quy tắc chủ dự án đã đặt trong các phiên
  (ví dụ: tạo mẫu / ảnh xem trước cho chủ dự án check trước, "OK" mới commit + push;
  nội dung bài viết chép nguyên văn).
- Việc đầu tiên cần làm, việc tiếp theo, việc chờ chủ dự án quyết.
- Nhắc lại **nguyên văn** khối "Quy tắc gốc" ở trên.
