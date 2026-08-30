// 批量导入产品「文字 + 规格参数」脚本
//
// 图片（封面图、图集）继续在 Sanity Studio 后台手动上传，跟这个脚本无关。
// 这个脚本只负责把 Excel 表格里的简短描述、规格参数等文字内容，批量写进
// 已经在 Sanity 里创建好的产品文档里——按「产品名称」做匹配。
//
// 使用方法：
//   1. 先在 Sanity Studio 里为每个产品建好条目（名称、分类、封面图），Publish 发布
//   2. 复制 import-data/products-template.xlsx，改名为 import-data/products.xlsx，
//      按照模板里「说明」sheet 的格式填好 Products 和 Specs 两个表格
//      （产品名称必须跟 Sanity 里的完全一致）
//   3. 在项目根目录运行：npm run import:products
//
// 可以分批次运行——每次的表格只需要包含这一批要更新的产品，没写到的产品和字段
// 都不会被改动。也可以对同一个产品反复运行，只会覆盖这次表格里实际填了内容的字段。
//
// 前提：.env 文件里配置好 SANITY_API_TOKEN（必须是 Editor 权限）和
// PUBLIC_SANITY_PROJECT_ID / PUBLIC_SANITY_DATASET（跟 npm run seed 用的是同一套配置）。

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const EXCEL_PATH = process.argv[2] || path.join(ROOT, 'import-data', 'products.xlsx');

// 目前网站前台（导航筛选、分类标签、中英文切换）只接好了这五个分类
// Sanity 后台其实还有 emergency / light-guide-panel 两个选项，但前台还没配置，先不允许用
const VALID_CATEGORIES = ['outdoor', 'commercial', 'smart', 'furniture', 'dob-driver'];

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error('❌ 缺少 .env 里的 PUBLIC_SANITY_PROJECT_ID 或 SANITY_API_TOKEN，请检查 .env 文件（可参考 .env.example，跟 npm run seed 用的是同一套配置）。');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

function norm(str) {
  return String(str || '').trim().toLowerCase();
}

function toBool(val) {
  const s = String(val).trim();
  return s === '是' || s.toLowerCase() === 'true' || s === '1' || s.toLowerCase() === 'yes';
}

async function main() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`❌ 找不到表格文件：${EXCEL_PATH}`);
    console.error('   请先复制 import-data/products-template.xlsx，改名为 import-data/products.xlsx 再填写。');
    process.exit(1);
  }

  const workbook = xlsx.readFile(EXCEL_PATH);
  const productsSheet = workbook.Sheets['Products'];
  const specsSheet = workbook.Sheets['Specs'];

  if (!productsSheet) {
    console.error('❌ 表格里没有找到名为 "Products" 的工作表(sheet)，请检查是否用了模板、sheet名字有没有被改动。');
    process.exit(1);
  }

  const productRows = xlsx.utils.sheet_to_json(productsSheet, { defval: '' });
  const specRows = specsSheet ? xlsx.utils.sheet_to_json(specsSheet, { defval: '' }) : [];

  // 按"产品名称"（归一化：去空格+小写）把 Specs 表分组，一个产品可以有多条参数
  const specsByName = {};
  for (const row of specRows) {
    const key = norm(row['产品名称']);
    if (!key) continue;
    const label = String(row['标签'] || '').trim();
    const value = String(row['数值'] || '').trim();
    if (!label && !value) continue;
    if (!specsByName[key]) specsByName[key] = [];
    specsByName[key].push({ _key: Math.random().toString(36).slice(2, 10), label, value });
  }

  console.log(`使用 Sanity 项目: ${projectId} / 数据集: ${dataset}`);
  console.log('正在从 Sanity 读取已有产品列表以做名称匹配...\n');

  const existingProducts = await client.fetch(`*[_type == "product"]{ _id, name }`);
  const byName = {};
  const duplicateNames = new Set();
  for (const p of existingProducts) {
    const key = norm(p.name);
    if (byName[key]) duplicateNames.add(key);
    else byName[key] = p._id;
  }

  console.log(`读取到 ${productRows.length} 行待更新数据\n`);

  const errors = [];
  const validRows = [];
  const seenNames = new Set();

  productRows.forEach((row, idx) => {
    const rowNum = idx + 2; // Excel行号（含表头）
    const name = String(row['产品名称'] || '').trim();
    const key = norm(name);

    if (!name) {
      errors.push(`第${rowNum}行：缺少"产品名称"，已跳过`);
      return;
    }
    if (seenNames.has(key)) {
      errors.push(`第${rowNum}行：产品名称"${name}"和前面某一行重复，已跳过`);
      return;
    }
    if (duplicateNames.has(key)) {
      errors.push(`第${rowNum}行（${name}）：Sanity 里有多个产品用了这个名字，无法确定改哪一个，已跳过——建议先去 Sanity 把重复的产品名称改清楚`);
      return;
    }
    const docId = byName[key];
    if (!docId) {
      errors.push(`第${rowNum}行（${name}）：在 Sanity 里找不到匹配的产品，请先在 Sanity Studio 创建好这个产品（名称要完全一致）再重新导入`);
      return;
    }

    const category = String(row['分类'] || '').trim();
    if (category && !VALID_CATEGORIES.includes(category)) {
      errors.push(`第${rowNum}行（${name}）：分类"${category}"不是有效值，只能填 ${VALID_CATEGORIES.join(' / ')} 之一，已跳过`);
      return;
    }

    seenNames.add(key);
    validRows.push({
      rowNum,
      name,
      docId,
      category: category || null,
      shortDescription: String(row['简短描述'] || '').trim(),
      customizableRaw: String(row['支持定制'] || '').trim(),
      featuredRaw: String(row['首页展示'] || '').trim(),
      orderRaw: String(row['排序权重'] || '').trim(),
      specs: specsByName[key] || null,
    });
  });

  if (errors.length > 0) {
    console.log('⚠️  以下行存在问题，将会跳过，请检查后重新运行：\n');
    errors.forEach((e) => console.log('  - ' + e));
    console.log('');
  }

  if (validRows.length === 0) {
    console.log('没有可以更新的产品，请检查表格内容。');
    return;
  }

  console.log(`✅ ${validRows.length} 行数据校验通过，开始更新...\n`);

  for (const row of validRows) {
    process.stdout.write(`  → ${row.name} ... `);
    try {
      // 只把这次表格里实际填了内容的字段放进 patch，没填的字段保持 Sanity 里原样不变
      const fields = {};
      if (row.category) fields.category = row.category;
      if (row.shortDescription) fields.shortDescription = row.shortDescription;
      if (row.customizableRaw) fields.customizable = toBool(row.customizableRaw);
      if (row.featuredRaw) fields.featured = toBool(row.featuredRaw);
      if (row.orderRaw && !Number.isNaN(Number(row.orderRaw))) fields.order = Number(row.orderRaw);
      if (row.specs) fields.specs = row.specs;

      if (Object.keys(fields).length === 0) {
        console.log('（这一行没有任何要更新的内容，跳过）');
        continue;
      }

      await client.patch(row.docId).set(fields).commit();
      console.log('✓');
    } catch (err) {
      console.log('✗');
      console.error(`    错误详情: ${err.message}`);
    }
  }

  console.log('\n✅ 更新完成！可以去 Sanity Studio 或 npm run dev 看一下效果。');
  console.log('   正式网站会通过 Sanity → Vercel 的自动构建钩子重新生成，稍等一两分钟刷新即可看到。');
}

main().catch((err) => {
  console.error('\n❌ 导入过程出现错误：', err);
  process.exit(1);
});
