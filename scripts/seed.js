// 一次性导入脚本：把 seed-data.js 里的真实产品/新闻数据（含图片）写入 Sanity
//
// 运行方法（在项目根目录下）：
//   npm run seed
//
// 前提：.env 文件里配置好 SANITY_API_TOKEN（必须是 Editor 权限），
// 且 PUBLIC_SANITY_PROJECT_ID / PUBLIC_SANITY_DATASET 也已填好。
//
// 这个脚本可以重复运行（用了固定的 _id，重复运行会更新已有内容而不是重复创建），
// 但每次运行都会重新上传一遍图片，正常使用一两次就够了，不需要频繁重跑。

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { products, news } from './seed-data.js';

dotenv.config();

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

// 打码显示读取到的内容，方便排查（不会暴露完整Token）
function mask(val, minExpectedLength = 20) {
  if (!val) return '(空 / 没读到)';
  if (val.length < minExpectedLength) return `"${val}" (长度${val.length})`;
  return `"${val.slice(0, 4)}...${val.slice(-4)}" (长度${val.length})`;
}

console.log('读取到的环境变量：');
console.log('  PUBLIC_SANITY_PROJECT_ID =', mask(projectId, 4));
console.log('  SANITY_API_TOKEN         =', mask(token, 40), token && token.length < 40 ? '⚠️ Token通常有100+字符，这个长度偏短，可能没复制完整' : '');
console.log('');

if (!projectId || !token) {
  console.error('❌ 缺少必要的环境变量。请确认：');
  console.error('   1. .env 文件和 scripts 文件夹在同一个项目根目录下');
  console.error('   2. .env 里每一行格式是 变量名=值，中间没有空格，值不需要加引号');
  console.error('   3. 保存 .env 时选择"纯文本"/UTF-8编码（记事本另存为时可以选）');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function uploadImageFromUrl(url, filename) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`下载图片失败 (${res.status}): ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const asset = await client.assets.upload('image', buffer, { filename });
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
}

function toPortableText(paragraphs) {
  return paragraphs.map((text) => ({
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'normal',
    children: [{ _type: 'span', _key: Math.random().toString(36).slice(2, 10), text }],
  }));
}

async function seedProducts() {
  console.log(`\n📦 开始导入 ${products.length} 个产品...`);
  for (const p of products) {
    const slug = slugify(p.name);
    process.stdout.write(`  → ${p.name} ... `);
    try {
      const coverImage = await uploadImageFromUrl(p.imageUrl, `${slug}.jpg`);
      await client.createOrReplace({
        _id: `product-${slug}`,
        _type: 'product',
        name: p.name,
        slug: { _type: 'slug', current: slug },
        category: p.category,
        coverImage,
        shortDescription: p.shortDescription,
        specs: [],
        customizable: p.customizable,
        featured: p.featured,
        order: p.order,
      });
      console.log('✓');
    } catch (err) {
      console.log('✗');
      console.error(`    错误详情: ${err.message}`);
    }
  }
}

async function seedNews() {
  console.log(`\n📰 开始导入 ${news.length} 篇新闻...`);
  for (const n of news) {
    const slug = slugify(n.title);
    process.stdout.write(`  → ${n.title} ... `);
    try {
      const coverImage = await uploadImageFromUrl(n.imageUrl, `${slug}.jpg`);
      await client.createOrReplace({
        _id: `news-${slug}`,
        _type: 'news',
        title: n.title,
        slug: { _type: 'slug', current: slug },
        category: n.category,
        coverImage,
        publishedAt: n.publishedAt,
        summary: n.summary,
        body: toPortableText(n.body),
      });
      console.log('✓');
    } catch (err) {
      console.log('✗');
      console.error(`    错误详情: ${err.message}`);
    }
  }
}

async function main() {
  console.log(`使用 Sanity 项目: ${projectId} / 数据集: ${dataset}`);
  await seedProducts();
  await seedNews();
  console.log('\n✅ 导入完成！去 npm run dev 刷新网站，或登录 Sanity Studio 查看内容。');
}

main().catch((err) => {
  console.error('\n❌ 导入过程出现错误：', err);
  process.exit(1);
});
