# CLAUDE.md — PhotheSense Website

Website bán workshop trải nghiệm ở Hà Nội (làm dao ở làng rèn Đa Sỹ, cà phê Việt Nam).
Stack: Astro 5, Bootstrap 5, astro-icon, MDX. Domain: https://phothesense.com
Chủ dự án làm việc chủ yếu trên tablet và duyệt mọi thay đổi qua Pull Request.

---

## 1. Quy tắc làm việc (BẮT BUỘC)

1. **Không tự ý thay đổi.** Mọi thay đổi phải được chủ dự án đồng ý trước.
2. **Kế hoạch trước, code sau.** Với việc mới: trình bày kế hoạch chia nhỏ từng bước → chờ "OK" → mới làm.
3. **Mỗi bước = 1 nhánh + 1 PR nhỏ.** Tên nhánh: `feature/...`, `fix/...`, `docs/...`.
   Không bao giờ commit thẳng vào `main`.
4. **Làm xong 1 bước thì DỪNG.** Không tự làm bước tiếp theo khi chưa được đồng ý.
5. **Chạy `npm run build` trước khi mở PR.** Build lỗi thì sửa hoặc báo lại, không mở PR.
6. **Không đổi tên field, không di chuyển file, không thêm thư viện** nếu kế hoạch chưa ghi rõ.
7. **Không sửa lỗi ngoài phạm vi.** Thấy lỗi khác → ghi vào mô tả PR để đưa vào ROADMAP, không tự sửa.
8. **Cập nhật `ROADMAP.md`** trong cùng PR: đánh dấu ✅ bước vừa làm.
9. Mô tả PR viết tiếng Việt, đơn giản: làm gì, file nào đổi, cách kiểm tra.

## 2. Chống bịa thông tin

- **Đọc file trước khi trả lời.** Nói rõ thông tin lấy từ file nào.
- **Không chắc thì hỏi lại**, không đoán.
- Thông tin về Astro, thư viện, hosting: kiểm tra tài liệu chính thức, không dựa vào trí nhớ.
- Không bao giờ nói "build thành công" nếu chưa thực sự chạy build.

---

## 3. Cấu trúc dự án

```
src/data/tours/<slug>.md            → dữ liệu mỗi sản phẩm (frontmatter + mô tả)
src/pages/experience/[slug].astro   → tạo trang /experience/<slug> từ file tour
src/layouts/ProductDetailLayout.astro → giao diện chung trang sản phẩm (dùng slot)
src/data/reviews/<reviewId>.json    → review của sản phẩm (mảng)
public/picture/<folder>/gallery.json → danh sách ảnh gallery (tải phía trình duyệt)
src/styles/product-detail.css       → CSS trang sản phẩm
```

- Slug = tên file tour (ví dụ `knife-workshop.md` → `/experience/knife-workshop`).
- Đặt chỗ qua Cal.com: thuộc tính `data-cal-link`, `data-cal-namespace`.
- Slot của layout: `about-list`, `description`, `highlights`, `reviews`, `itinerary`.

### Field của tour (frontmatter)

| Field | Ví dụ |
|---|---|
| title, productTitle, productSubtitle | text |
| price | `₫1,100,000` (text, chưa đổi sang số) |
| thumbnail | `/picture/knife_workshop/xxx.jpg` |
| location, type, badge | `hanoi`, `workshop`, `Best Seller` |
| galleryJsonPath | `/picture/knife_workshop/gallery.json` |
| calLink, calNamespace | `phothesense/knife-making-workshop`, `knife-making-workshop` |
| ctaButtonText | `Forge Your Own Knife` |
| reviewId | `knife-reviews` (tên file JSON, không có `.json`) |
| meta_list | danh sách `{ icon, text }` |
| highlights | danh sách `{ title, icon, desc }` |
| itinerary | danh sách `{ title, desc }` |

### Field của review

`id`, `author`, `origin`, `date`, `rating` (1–5), `content`, `tripadvisor_link` (có thể rỗng),
`images.main`, `images.gallery` (mảng).

## 4. Safety net — 2 tầng

- **Tầng 1 — Bắt buộc (thiếu → build dừng):** `title`, `productTitle`, `price`, `calLink`, `calNamespace`.
- **Tầng 2 — Được để trống (thiếu → trang vẫn hiện, section tự ẩn, build in cảnh báo):**
  `productSubtitle`, gallery, `meta_list`, `highlights`, `itinerary`, `reviewId`, `badge`, `ctaButtonText`.
- **Để trống = OK. Điền sai = lỗi.** Ví dụ `reviewId` hoặc `galleryJsonPath` trỏ tới file không tồn tại → báo lỗi.
- Mục tiêu: dữ liệu còn thiếu KHÔNG được làm trang biến mất.

---

## 5. Code guideline

- **Dữ liệu tách khỏi giao diện.** Nội dung sản phẩm nằm trong file data, không viết cứng trong `.astro`.
- **Theo pattern có sẵn** trước khi tạo pattern mới. Tái dùng `ProductDetailLayout` và slot.
- **Icon:** dùng `<Icon name="bộ:tên" />` của astro-icon. Bộ được dùng: `fa6-solid`, `fa6-brands`, `mdi`.
  Không dùng class Font Awesome kiểu `<i class="fa-...">`.
- **CSS:** Bootstrap class trước; CSS riêng đặt trong `src/styles/`.
- **TypeScript trong `<script>`:** kiểm tra null trước khi dùng phần tử DOM.
- **Tên field mới:** camelCase. Field cũ dạng snake_case (`meta_list`, `tripadvisor_link`) giữ nguyên.
- **Ảnh:** luôn có `alt`; ảnh không nằm ở đầu trang dùng `loading="lazy"`.
- **Link ngoài:** `target="_blank"` phải kèm `rel="noopener"`.
- Comment trong code có thể viết tiếng Việt.

## 6. Lỗi đã biết (CHƯA sửa — chỉ sửa khi có trong ROADMAP)

- Số sao review luôn hiện 5, bỏ qua `rating`.
- Icon dấu "+" ở timeline dùng `<i class="fa6-solid fa-plus">`, có thể không hiển thị.
- `script.js` và header/footer placeholder dùng đường dẫn tương đối `../`.
- Gallery tải bằng `fetch` phía trình duyệt: ảnh không có trong HTML, sai đường dẫn thì im lặng.
- Review có `tripadvisor_link` → `stretched-link` xung đột với lightbox ảnh.
- Thiếu `highlights`/`itinerary`/`meta_list` hiện làm build lỗi (sẽ sửa trong Tour Schema).
