// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // 1. URL của trang web (Ví dụ: https://username.github.io)
  site: 'https://phothesense.com/', 
  
  // 2. Tên repository (Ví dụ: /ten-repo). Bắt buộc nếu không phải repo chính.
  base: '/phothesense_website', 
});