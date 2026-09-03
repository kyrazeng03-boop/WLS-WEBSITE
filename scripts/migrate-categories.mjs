// 一次性迁移脚本：把已有产品里"手打文字"的二级分类(subCategory)/三级分类
// (subSubCategory)，改造成指向独立分类文档的"引用"字段。
//
// 背景：以前 subCategory/subSubCategory 是产品文档里的自由文本字段，现在
// 改成了独立的文档类型（sanity/schemas/subCategory.js、subSubCategory.js），
// 产品那边改成下拉引用——这样才能做到"先建好分类，再传产品"，而且不会再
// 因为打字不一致（大小写、多余空格）把同一个分类拆成两条。
//
// 使用方法（项目根目录，PowerShell）：
//   node scripts/migrate-categories.mjs             先跑一遍，只打印会做什么，不会真的改数据
//   node scripts/migrate-categories.mjs --apply      确认打印出来的分类列表没问题后，加 --apply 正式执行
//
// 这个脚本可以放心重复运行：已经是"引用"格式的产品会被跳过；同名分类不会
// 被重复创建（用同一个分类文字的产品，会复用已经建好的那一条分类文档）。
//
// 建议：正式执行前，先在 Sanity 后台把"全部产品"里每个产品的二级/三级分类
// 文字过一遍眼，把明显打错的（比如不小心填成了产品名称）改成正确的分类名，
// 这样迁移出来的分类列表才是干净的。

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error('缺少 PUBLIC_SANITY_PROJECT_ID 或 SANITY_API_TOKEN，请检查项目根目录的 .env 文件。');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const APPLY = process.argv.includes('--apply');

function slugify(str) {
  return (str || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function run() {
  const products = await client.fetch(
    `*[_type == "product"]{_id, name, category, subCategory, subSubCategory}`
  );

  // 只处理 subCategory/subSubCategory 还是"字符串"的产品——已经是引用对象
  // ({_type: 'reference', _ref: ...}) 的，说明之前已经迁移过了，跳过。
  const pending = products.filter(
    (p) => typeof p.subCategory === 'string' || typeof p.subSubCategory === 'string'
  );

  console.log(`共 ${products.length} 个产品，其中 ${pending.length} 个还是旧的文字格式，需要迁移。`);
  if (pending.length === 0) {
    console.log('没有需要迁移的产品，结束。');
    return;
  }

  // 第一步：收集所有 (一级分类, 二级分类文字) 组合，对应要创建/复用的 subCategory 文档
  // 用 category+文字 生成固定的 _id，这样脚本重复运行不会重复建
  const subCatMap = new Map();
  for (const p of pending) {
    const cat = p.category;
    const subText = typeof p.subCategory === 'string' ? p.subCategory.trim() : '';
    if (!cat || !subText) continue;
    const key = `${cat}__${slugify(subText)}`;
    if (!subCatMap.has(key)) {
      subCatMap.set(key, {
        _id: `subCategory.${slugify(cat)}.${slugify(subText)}`,
        title: subText,
        category: cat,
      });
    }
  }

  console.log(`\n需要创建/复用 ${subCatMap.size} 个二级分类：`);
  for (const sc of subCatMap.values()) console.log(`  - [${sc.category}] ${sc.title}`);

  // 第二步：收集所有 (对应二级分类文档, 三级分类文字) 组合
  const subSubCatMap = new Map();
  for (const p of pending) {
    const cat = p.category;
    const subText = typeof p.subCategory === 'string' ? p.subCategory.trim() : '';
    const subSubText = typeof p.subSubCategory === 'string' ? p.subSubCategory.trim() : '';
    if (!cat || !subText || !subSubText) continue;
    const sc = subCatMap.get(`${cat}__${slugify(subText)}`);
    if (!sc) continue;
    const key = `${sc._id}__${slugify(subSubText)}`;
    if (!subSubCatMap.has(key)) {
      subSubCatMap.set(key, {
        _id: `subSubCategory.${slugify(cat)}.${slugify(subText)}.${slugify(subSubText)}`,
        title: subSubText,
        subCategoryId: sc._id,
      });
    }
  }

  console.log(`\n需要创建/复用 ${subSubCatMap.size} 个三级分类：`);
  for (const ssc of subSubCatMap.values()) console.log(`  - ${ssc.title}`);

  if (!APPLY) {
    console.log(
      '\n【预览模式】以上是这次迁移会创建/复用的分类列表，没有对数据库做任何改动。\n' +
        '确认没问题后，重新运行一次并加上 --apply 参数，正式执行迁移：\n' +
        '  node scripts/migrate-categories.mjs --apply'
    );
    return;
  }

  console.log('\n开始正式写入...');

  // 创建/复用二级分类文档
  let tx = client.transaction();
  for (const sc of subCatMap.values()) {
    tx = tx.createIfNotExists({
      _id: sc._id,
      _type: 'subCategory',
      title: sc.title,
      slug: { _type: 'slug', current: slugify(sc.title) || sc._id },
      category: sc.category,
    });
  }
  await tx.commit();
  console.log(`二级分类文档创建/确认完成（${subCatMap.size} 个）。`);

  // 创建/复用三级分类文档
  tx = client.transaction();
  for (const ssc of subSubCatMap.values()) {
    tx = tx.createIfNotExists({
      _id: ssc._id,
      _type: 'subSubCategory',
      title: ssc.title,
      slug: { _type: 'slug', current: slugify(ssc.title) || ssc._id },
      subCategory: { _type: 'reference', _ref: ssc.subCategoryId },
    });
  }
  await tx.commit();
  console.log(`三级分类文档创建/确认完成（${subSubCatMap.size} 个）。`);

  // 第三步：把每个产品的 subCategory/subSubCategory 文字字段替换成引用
  let patched = 0;
  for (const p of pending) {
    const cat = p.category;
    const subText = typeof p.subCategory === 'string' ? p.subCategory.trim() : '';
    const subSubText = typeof p.subSubCategory === 'string' ? p.subSubCategory.trim() : '';

    const patch = client.patch(p._id);
    let willCommit = false;

    if (subText) {
      const sc = subCatMap.get(`${cat}__${slugify(subText)}`);
      if (sc) {
        patch.set({ subCategory: { _type: 'reference', _ref: sc._id } });
        willCommit = true;

        if (subSubText) {
          const ssc = subSubCatMap.get(`${sc._id}__${slugify(subSubText)}`);
          if (ssc) {
            patch.set({ subSubCategory: { _type: 'reference', _ref: ssc._id } });
          } else {
            patch.unset(['subSubCategory']);
          }
        } else {
          patch.unset(['subSubCategory']);
        }
      } else {
        console.warn(`  ! 产品「${p.name}」的分类信息异常（一级分类缺失？），跳过。`);
      }
    } else {
      // 没填二级分类的产品：把两个字段都清空（万一之前是空字符串之类的脏数据）
      patch.unset(['subCategory', 'subSubCategory']);
      willCommit = true;
    }

    if (willCommit) {
      await patch.commit();
      patched++;
    }
  }

  console.log(`\n已更新 ${patched} 个产品文档。迁移完成！`);
  console.log('去 Sanity Studio 里随便打开几个产品核对一下"二级分类""三级分类"字段，应该已经变成下拉选择、并且选中了正确的值。');
}

run().catch((err) => {
  console.error('\n迁移失败：', err);
  process.exit(1);
});
