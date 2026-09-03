import { CATEGORY_OPTIONS } from '../lib/categoryOptions';

// 二级分类——独立的文档类型，可以提前建好（不用先有产品才能建）。
// 产品那边的"二级分类"字段改成从这里选（下拉引用），不再手打文字，
// 这样就不会再出现同一个分类因为打字不统一（大小写/多空格）被拆成两条的问题。
export default {
  name: 'subCategory',
  title: 'Subcategory 二级分类',
  type: 'document',
  // 配合 deskStructure.js：从某个一级分类下面的"新建/管理二级分类"里新建时，
  // 会自动带上对应的一级分类
  initialValue: (params) => ({
    category: params?.category,
  }),
  fields: [
    {
      name: 'title',
      title: 'Title 名称（如 Flood Light / Street Light / Garden Light）',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug (自动生成链接)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'category',
      title: '所属一级分类 Parent Category',
      type: 'string',
      options: { list: CATEGORY_OPTIONS },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Sort Order 排序权重 (数字越小越靠前)',
      type: 'number',
      initialValue: 100,
    },
  ],
  orderings: [
    {
      title: 'Order 排序',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'category' },
  },
};
