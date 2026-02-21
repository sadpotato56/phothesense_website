// src/content/config.ts
import { z, defineCollection } from 'astro:content';

// 1. Định nghĩa bộ quy tắc (Schema) cho Blog
const blogCollection = defineCollection({
  type: 'content', // Báo cho Astro biết đây là thư mục chứa Markdown/MDX
  schema: z.object({
    title: z.string(),         // Tiêu đề bắt buộc là chuỗi (chữ)
    description: z.string(),   // Mô tả ngắn gọn chuẩn SEO
    thumbnail: z.string(),     // Đường dẫn ảnh bìa
    category: z.string(),      // Chuyên mục bài viết
    date: z.string(),          // Ngày đăng bài
  }),
});

// 2. Xuất (Export) collection để Astro sử dụng
export const collections = {
  'blog': blogCollection,
};