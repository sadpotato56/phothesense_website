# ROADMAP — PhotheSense Website

Cách dùng: mỗi ô `[ ]` = 1 PR nhỏ. Làm từ trên xuống.
Nói với Claude Code: **"Làm việc tiếp theo trong ROADMAP."**
Xong và đã merge → `[x]`.

---

## Giai đoạn 0 — Thiết lập
- [ ] Thêm `CLAUDE.md` và `ROADMAP.md` vào repo

## Giai đoạn 1 — Tour Schema (safety net 2 tầng)
- [x] Bước 0: Đọc các trang dùng dữ liệu tour, báo field nào dùng ở đâu (không sửa gì)
- [x] Bước 1: Thêm `src/content.config.ts` (chưa trang nào dùng)
- [x] Bước 2: Chạy build, liệt kê cảnh báo / dữ liệu cần sửa
- [ ] Bước 3: `[slug].astro` đọc dữ liệu từ collection (giao diện giữ nguyên)
- [ ] Bước 4a: Ẩn section Highlights khi trống
- [ ] Bước 4b: Ẩn section Itinerary khi trống
- [ ] Bước 4c: Ẩn section Reviews khi trống
- [ ] Bước 4d: Ẩn gallery khi trống
- [x] Bước 5: Báo lỗi khi `reviewId` / `galleryJsonPath` điền sai (đã có trong schema ở Bước 1)
- [ ] Bước 6: Xoá code tải dữ liệu cũ không còn dùng

### Dữ liệu cần chuẩn hoá (chủ dự án tự làm, tìm thấy ở Bước 2)
- [ ] `banhmi-reviews.json`, review "James H": 4 ảnh `/picture/review_pic/banhmi_rv2*.jpg` chưa có trong `public/` (một ảnh bị lặp)
- [ ] `coffee-reviews.json`: cả 2 review để `date` trống
- [ ] `sapa-easy-walking-for-kids-seniors.md`: `price` đang ghi "Giá giả định", cần giá thật
- [ ] `coffee-workshop.md`: chú thích cũ ở `itinerary` ghi "lịch trình mẫu của Knife Workshop" (nội dung thật đã đúng)
- [ ] `coffee-workshop.md`: dòng `meta_list` có icon địa điểm không có chữ "Location:", nên thẻ ở trang danh sách không hiện địa danh cụ thể
- [ ] Trang danh sách có nút lọc "Ninh Binh" nhưng chưa có tour nào ở Ninh Bình

## Giai đoạn 2 — Tự động hoá nội dung
- [ ] File mẫu cho sản phẩm mới (template tour `.md`)
- [ ] Hướng dẫn "tạo sản phẩm mới" để dán vào Claude Code
- [ ] Hướng dẫn "thêm review" từ TripAdvisor / Viator / Airbnb
- [ ] Gallery tự động: đọc ảnh trong thư mục lúc build, bỏ `gallery.json` thủ công

## Giai đoạn 3 — Sửa lỗi đã biết
- [ ] Hiện số sao theo `rating`
- [ ] Sửa icon "+" ở timeline (dùng `<Icon>`)
- [ ] Sửa đường dẫn tương đối `../` (script.js, header/footer)
- [ ] Sửa xung đột TripAdvisor link với lightbox ảnh review
- [ ] Thêm `alt` và `loading="lazy"` cho ảnh

## Giai đoạn 4 — Hosting & kiểm tra
- [ ] Xác định web đang host ở đâu
- [ ] Bật preview link cho mỗi PR
- [ ] GitHub Action: tự chạy build cho mỗi PR

## Giai đoạn 5 — SEO
- [ ] Đổi `price` sang dạng số, định dạng ở layout
- [ ] Thông tin cho Google (giá, rating, số review)
- [ ] Ảnh và mô tả khi chia sẻ link (Open Graph)

## Giai đoạn 6 — Giao diện (bàn sau)
- [ ] Brainstorm thay đổi giao diện

---

## Quyết định đã chốt
- Safety net 2 tầng: chỉ thiếu thông tin cốt lõi mới dừng build (xem `CLAUDE.md` mục 4).
- Giá giữ dạng chữ đến Giai đoạn 5.
- Không đổi tên field cũ; field mới dùng camelCase.
- Làm việc qua PR, merge sau khi xem kỹ.
