// src/content.config.ts
// Astro 5 ưu tiên file này hơn src/content/config.ts (file cũ sẽ bị bỏ qua),
// nên ta import lại collection 'blog' từ file cũ để blog vẫn hoạt động như trước.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { collections as legacyCollections } from './content/config';

const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url));
const REVIEWS_DIR = fileURLToPath(new URL('./data/reviews/', import.meta.url));

// Chuỗi rỗng ("") được coi như không điền.
const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

// --- Tầng 1: bắt buộc. Thiếu hoặc để trống thì build dừng. ---
const requiredText = z.string().trim().min(1, 'Bắt buộc, không được để trống');

// --- Tầng 2: được để trống. Nếu đã điền thì phải đúng. ---
const optionalText = z.preprocess(emptyToUndefined, z.string().optional());

const metaItem = z.object({
  icon: z.string(),
  text: z.string(),
});

const highlightItem = z.object({
  title: z.string(),
  icon: z.string(),
  desc: z.string(),
});

const itineraryItem = z.object({
  title: z.string(),
  desc: z.string(),
});

// Điền sai (trỏ tới file không tồn tại) thì báo lỗi.
const galleryJsonPath = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .refine((p) => existsSync(PUBLIC_DIR + p.replace(/^\/+/, '')), {
      message: 'File gallery không tồn tại trong thư mục public/',
    })
    .optional(),
);

const reviewId = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .refine((id) => existsSync(`${REVIEWS_DIR}${id}.json`), {
      message: 'Không tìm thấy file src/data/reviews/<reviewId>.json',
    })
    .optional(),
);

// Các field tầng 2: thiếu thì in cảnh báo khi build (trang vẫn build bình thường).
const TIER_2_FIELDS = [
  'productSubtitle',
  'galleryJsonPath',
  'meta_list',
  'highlights',
  'itinerary',
  'reviewId',
  'badge',
  'ctaButtonText',
] as const;

const tourSchema = z
  .object({
    // Tầng 1
    title: requiredText,
    productTitle: requiredText,
    price: requiredText, // Giữ dạng chữ, ví dụ "₫585,000"
    calLink: requiredText,
    calNamespace: requiredText,

    // Tầng 2
    productSubtitle: optionalText,
    galleryJsonPath,
    meta_list: z.array(metaItem).optional(),
    highlights: z.array(highlightItem).optional(),
    itinerary: z.array(itineraryItem).optional(),
    reviewId,
    badge: optionalText,
    ctaButtonText: optionalText,

    // Field đang có trong file .md, dùng ở trang danh sách tour (không cảnh báo khi thiếu)
    thumbnail: optionalText,
    location: optionalText,
    type: optionalText,
  })
  .transform((data) => {
    const missing = TIER_2_FIELDS.filter((key) => {
      const value = data[key];
      return value === undefined || (Array.isArray(value) && value.length === 0);
    });
    if (missing.length > 0) {
      console.warn(`[tours] "${data.title}" đang để trống: ${missing.join(', ')}`);
    }
    return data;
  });

const tours = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/data/tours' }),
  schema: tourSchema,
});

export const collections = {
  ...legacyCollections,
  tours,
};
