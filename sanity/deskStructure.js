// 自定义侧边栏结构："先建分类，再传产品"：
//
//   Product 产品（按分类浏览）
//     -> 一级分类（固定 5 个，来自 lib/categoryOptions.js）
//        -> ➕ 新建/管理二级分类   （二级分类是独立文档，可以在没有产品之前先建好）
//        -> 二级分类 A
//             -> ➕ 新建/管理三级分类（三级分类同样是独立文档，可以先建好）
//             -> 三级分类 a -> 这个三级分类下的产品列表（"+"新建产品会自动带上一/二/三级分类）
//             -> （直属二级分类 A，未选三级分类）-> 产品列表
//        -> 二级分类 B ...
//        -> （未选二级分类）-> 产品列表
//     -> All Products 全部产品（搜索/浏览全部，不分组）
//
//   分类管理 Manage Categories （不分一级分类，看全部二级/三级分类，方便统一检查/清理）
//
// 二级分类（subCategory）、三级分类（subSubCategory）现在都是独立的文档类型
// （见 schemas/subCategory.js / subSubCategory.js），产品里的"二级/三级分类"字段
// 是引用（下拉选择），不再是手打文字——所以可以先在管理页面里把分类建好，
// 之后传产品的时候直接选，不用每次都手打、也不会因为打字不一致被拆成两条。

import { CATEGORY_OPTIONS } from './lib/categoryOptions';

const NO_SUBCATEGORY_TITLE = '（未选二级分类 No Subcategory）';
const UNTITLED = '（未命名 Untitled — 请去补填 Title）';

// 分类文档如果是刚新建、还没填 Title 就被列进来了（比如草稿状态），
// sub.title 会是 undefined——Sanity 要求侧边栏每个 list item 必须有 title，
// 不然整个结构树会直接报错崩掉。这里统一兜底成一个能看懂的占位文字，
// 而不是让整个"按分类浏览"打不开。
function titleOf(doc) {
  return (doc && doc.title) || UNTITLED;
}

function productListNode(S, { id, title, filter, params, initTemplateParams }) {
  return S.documentList()
    .id(id)
    .title(title)
    .schemaType('product')
    .filter(filter)
    .params(params)
    .defaultOrdering([{ field: 'order', direction: 'asc' }])
    .initialValueTemplates([S.initialValueTemplateItem('product', initTemplateParams)]);
}

function subSubCategoryChild(S, client, cat, sub) {
  return async () => {
    const subsubs = await client.fetch(
      `*[_type == "subSubCategory" && subCategory._ref == $scId] | order(order asc, title asc){_id, title}`,
      { scId: sub._id }
    );

    const items = [
      S.listItem()
        .id(`sc-${sub._id}__manage`)
        .title('➕ 新建/管理三级分类 Manage Sub-subcategories')
        .child(
          S.documentList()
            .id(`sc-${sub._id}__manage__list`)
            .title(`${titleOf(sub)} — 三级分类管理`)
            .schemaType('subSubCategory')
            .filter('_type == "subSubCategory" && subCategory._ref == $scId')
            .params({ scId: sub._id })
            .initialValueTemplates([S.initialValueTemplateItem('subSubCategory', { subCategory: sub._id })])
        ),
      S.divider(),
      ...subsubs.map((ssc) =>
        S.listItem()
          .id(`ssc-${ssc._id}`)
          .title(titleOf(ssc))
          .child(
            productListNode(S, {
              id: `ssc-${ssc._id}__list`,
              title: titleOf(ssc),
              filter: '_type == "product" && subSubCategory._ref == $id',
              params: { id: ssc._id },
              initTemplateParams: { category: cat.value, subCategory: sub._id, subSubCategory: ssc._id },
            })
          )
      ),
    ];

    items.push(S.divider());
    items.push(
      S.listItem()
        .id(`sc-${sub._id}__direct`)
        .title(`（直属"${titleOf(sub)}"，未选三级分类）`)
        .child(
          productListNode(S, {
            id: `sc-${sub._id}__direct__list`,
            title: titleOf(sub),
            filter: '_type == "product" && subCategory._ref == $id && !defined(subSubCategory)',
            params: { id: sub._id },
            initTemplateParams: { category: cat.value, subCategory: sub._id },
          })
        )
    );

    return S.list().id(`sc-${sub._id}__wrap`).title(titleOf(sub)).items(items);
  };
}

function subCategoryChild(S, client, cat) {
  return async () => {
    const subs = await client.fetch(
      `*[_type == "subCategory" && category == $cat] | order(order asc, title asc){_id, title}`,
      { cat: cat.value }
    );

    const items = [
      S.listItem()
        .id(`${cat.value}__manage`)
        .title('➕ 新建/管理二级分类 Manage Subcategories')
        .child(
          S.documentList()
            .id(`${cat.value}__manage__list`)
            .title(`${cat.title} — 二级分类管理`)
            .schemaType('subCategory')
            .filter('_type == "subCategory" && category == $cat')
            .params({ cat: cat.value })
            .initialValueTemplates([S.initialValueTemplateItem('subCategory', { category: cat.value })])
        ),
      S.divider(),
      ...subs.map((sub) =>
        S.listItem()
          .id(`sc-${sub._id}`)
          .title(titleOf(sub))
          .child(subSubCategoryChild(S, client, cat, sub))
      ),
    ];

    items.push(S.divider());
    items.push(
      S.listItem()
        .id(`${cat.value}__none`)
        .title(NO_SUBCATEGORY_TITLE)
        .child(
          productListNode(S, {
            id: `${cat.value}__none__list`,
            title: NO_SUBCATEGORY_TITLE,
            filter: '_type == "product" && category == $cat && !defined(subCategory)',
            params: { cat: cat.value },
            initTemplateParams: { category: cat.value },
          })
        )
    );

    return S.list().id(`${cat.value}__list`).title(cat.title).items(items);
  };
}

export const structure = (S, context) => {
  const client = context.getClient({ apiVersion: '2024-01-01' });

  return S.list()
    .id('root')
    .title('Content 内容管理')
    .items([
      S.listItem()
        .id('product-by-category')
        .title('Product 产品（按分类浏览）')
        .child(
          S.list()
            .id('product-by-category-list')
            .title('Product 产品')
            .items(
              CATEGORY_OPTIONS.map((cat) =>
                S.listItem()
                  .id(cat.value)
                  .title(cat.title)
                  .child(subCategoryChild(S, client, cat))
              )
            )
        ),
      S.listItem()
        .id('product-all')
        .title('All Products 全部产品（搜索用）')
        .child(S.documentTypeList('product').id('product-all-list').title('All Products 全部产品')),
      S.divider(),
      S.listItem()
        .id('manage-categories')
        .title('分类管理 Manage Categories（全部）')
        .child(
          S.list()
            .id('manage-categories-list')
            .title('分类管理')
            .items([
              S.listItem()
                .id('all-subcats')
                .title('二级分类 Subcategories')
                .child(S.documentTypeList('subCategory').id('all-subcats-list').title('二级分类 Subcategories')),
              S.listItem()
                .id('all-subsubcats')
                .title('三级分类 Sub-subcategories')
                .child(S.documentTypeList('subSubCategory').id('all-subsubcats-list').title('三级分类 Sub-subcategories')),
            ])
        ),
      S.divider(),
      S.listItem()
        .id('news')
        .title('News 新闻')
        .child(S.documentTypeList('news').id('news-list').title('News 新闻')),
      S.listItem()
        .id('partner')
        .title('Partner 合作伙伴')
        .child(S.documentTypeList('partner').id('partner-list').title('Partner 合作伙伴')),
      S.divider(),
      S.listItem()
        .id('siteSettings')
        .title('Site Settings 全局设置')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.listItem()
        .id('homepage')
        .title('Homepage Content 首页内容')
        .child(S.document().schemaType('homepage').documentId('homepage')),
      S.listItem()
        .id('aboutPage')
        .title('About Page Images 关于我们页图片')
        .child(S.document().schemaType('aboutPage').documentId('aboutPage')),
    ]);
};
