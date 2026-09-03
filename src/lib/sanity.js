import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'f7nom1u6',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: true, // 生产环境用CDN读取，速度更快（对南亚/中东/非洲用户更友好）
});

const builder = imageUrlBuilder(client);
export function urlFor(source) {
  return builder.image(source);
}

// ---- 查询函数 ----

// 2026-09-03：subCategory / subSubCategory 从产品里手打的文字，改成了指向
// 独立分类文档的"引用"字段（见 sanity/schemas/subCategory.js、subSubCategory.js）。
// 这里用 -> 把引用解引用出来，只取页面用得到的 title/slug，这样前台代码拿到的
// p.subCategory 还是 "{title, slug}" 这种能直接当文字/链接用的东西，
// productTree.js 和各页面不用因为这次改动再大改一遍。
const SUB_CATEGORY_PROJECTION = `subCategory->{title, "slug": slug.current}`;
const SUB_SUB_CATEGORY_PROJECTION = `subSubCategory->{title, "slug": slug.current}`;

export async function getAllProducts() {
  return client.fetch(
    `*[_type == "product"] | order(order asc) {
      _id, name, slug, category, ${SUB_CATEGORY_PROJECTION}, ${SUB_SUB_CATEGORY_PROJECTION}, coverImage, shortDescription, customizable, specs, featured
    }`
  );
}

export async function getFeaturedProducts() {
  return client.fetch(
    `*[_type == "product" && featured == true] | order(order asc) [0...6] {
      _id, name, slug, category, ${SUB_CATEGORY_PROJECTION}, ${SUB_SUB_CATEGORY_PROJECTION}, coverImage, shortDescription, specs, customizable
    }`
  );
}

export async function getProductBySlug(slug) {
  return client.fetch(
    `*[_type == "product" && slug.current == $slug][0]{
      _id, name, category, ${SUB_CATEGORY_PROJECTION}, ${SUB_SUB_CATEGORY_PROJECTION}, coverImage, gallery, shortDescription, specs, customizable,
      documents[]{
        title,
        "fileUrl": file.asset->url,
        "fileName": file.asset->originalFilename
      }
    }`,
    { slug }
  );
}

export async function getAllNews(limit = 100) {
  return client.fetch(
    `*[_type == "news"] | order(publishedAt desc) [0...$limit] {
      _id, title, slug, category, coverImage, publishedAt, summary
    }`,
    { limit }
  );
}

export async function getLatestNews(count = 3) {
  return client.fetch(
    `*[_type == "news"] | order(publishedAt desc) [0...$count] {
      _id, title, slug, category, coverImage, publishedAt, summary
    }`,
    { count }
  );
}

export async function getNewsBySlug(slug) {
  return client.fetch(
    `*[_type == "news" && slug.current == $slug][0]{
      _id, title, category, coverImage, publishedAt, summary,
      "body": body[]{
        ...,
        _type == "image" => { "asset": { "url": asset->url } }
      }
    }`,
    { slug }
  );
}

export async function getSiteSettings() {
  return client.fetch(`*[_type == "siteSettings"][0]`);
}

export async function getHomepage() {
  return client.fetch(`*[_type == "homepage"][0]{
    heroSlides[]{ image, eyebrow, heading, description },
    founderPhoto,
    founderQuote,
    founderName,
    testimonials[]{ quote, author }
  }`);
}

export async function getAboutPage() {
  return client.fetch(`*[_type == "aboutPage"][0]{
    factoryImage,
    certificatesImage,
    workshopPhotos,
    equipmentPhotos[]{ image, caption }
  }`);
}

export async function getPartners() {
  return client.fetch(`*[_type == "partner"] | order(order asc) { _id, name, logo }`);
}
