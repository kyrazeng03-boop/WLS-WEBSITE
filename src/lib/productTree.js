// @ts-nocheck
// （这个文件是纯JS、没写类型标注，下面用到的 Object.entries/Object.values 在严格类型检查下
// 会被 TypeScript 判断成 unknown，报一堆"属性不存在"的假警告——不影响实际运行，这里关掉类型检查，
// 跟项目里其它 .js 文件保持一致的宽松风格）
import { getAllProducts } from './sanity';

// URL里用的短横线格式（比如把 "Constant Current LED Flood Light DOB" 变成
// "constant-current-led-flood-light-dob"），二级分类/三级分类是自由文本，
// 不像 slug 字段那样自带链接用的短横线格式，所以这里自己转一下。
export function slugify(str) {
  return (str || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 2026-09-02 新增：把所有产品按 category -> 二级分类(subCategory) -> 三级分类(subSubCategory)
// 分组，供"分类页 -> 系列页 -> 型号页"这三层浏览页面使用。
//
// 没填二级分类的产品，直接放在这个大类底下展示（不用再点一层）；
// 填了二级分类但没填三级分类的产品，放在这个系列底下展示；
// 三个都填了的产品，才会需要点两次才能看到（大类 -> 系列 -> 型号）。
//
// 返回结构：
// {
//   [categoryValue]: {
//     products: [没有二级分类的产品...],
//     series: {
//       [seriesSlug]: {
//         label: '二级分类原文',
//         products: [填了二级分类、没填三级分类的产品...],
//         variants: {
//           [variantSlug]: { label: '三级分类原文', products: [...] }
//         }
//       }
//     }
//   }
// }
export async function buildProductTree() {
  const products = await getAllProducts();
  const tree = {};

  for (const p of products) {
    const cat = p.category;
    if (!cat) continue;
    if (!tree[cat]) tree[cat] = { products: [], series: {} };

    const subCategory = p.subCategory && p.subCategory.trim();
    if (!subCategory) {
      tree[cat].products.push(p);
      continue;
    }

    const seriesSlug = slugify(subCategory);
    if (!tree[cat].series[seriesSlug]) {
      tree[cat].series[seriesSlug] = { label: subCategory, products: [], variants: {} };
    }
    const seriesNode = tree[cat].series[seriesSlug];

    const subSubCategory = p.subSubCategory && p.subSubCategory.trim();
    if (!subSubCategory) {
      seriesNode.products.push(p);
      continue;
    }

    const variantSlug = slugify(subSubCategory);
    if (!seriesNode.variants[variantSlug]) {
      seriesNode.variants[variantSlug] = { label: subSubCategory, products: [] };
    }
    seriesNode.variants[variantSlug].products.push(p);
  }

  return tree;
}

// 统计一个系列节点（series）底下一共有多少个真实产品（包括它自己直属的 + 所有型号下面的）
export function countSeriesProducts(seriesNode) {
  const variantCount = Object.values(seriesNode.variants || {}).reduce(
    (sum, v) => sum + v.products.length,
    0
  );
  return (seriesNode.products?.length || 0) + variantCount;
}

// 统计一个大类节点（category）底下一共有多少个真实产品
export function countCategoryProducts(categoryNode) {
  const seriesCount = Object.values(categoryNode.series || {}).reduce(
    (sum, s) => sum + countSeriesProducts(s),
    0
  );
  return (categoryNode.products?.length || 0) + seriesCount;
}

// 2026-09-02 新增：如果一个系列（series）节点底下总共只有1个真实产品
// ——不管这个产品是直接挂在系列下面，还是挂在某个型号(variant)下面——
// 就没必要再多点一层"分组页"了：分组页点进去也只会看到1张卡片，
// 还要再点一次才能看到参数。这种情况下直接返回这个产品，让分组卡片
// 直接链接到产品详情页（参数页），点一次就到。
// 如果系列下有多个产品（不管是平铺的还是分了多个型号），返回 null，
// 保留原来"先进分组页、再选产品"的两步浏览方式。
export function getSingleProduct(seriesNode) {
  if (countSeriesProducts(seriesNode) !== 1) return null;
  if (seriesNode.products?.length === 1) return seriesNode.products[0];
  for (const variant of Object.values(seriesNode.variants || {})) {
    if (variant.products.length === 1) return variant.products[0];
  }
  return null;
}
