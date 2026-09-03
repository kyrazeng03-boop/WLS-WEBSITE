// 三级分类——同样是独立文档类型，挂在某个二级分类下面。
// 产品那边的"三级分类"字段改成从这里选（下拉引用，先选二级分类，
// 才会出现对应的三级分类选项），不再手打文字。
export default {
  name: 'subSubCategory',
  title: 'Sub-subcategory 三级分类',
  type: 'document',
  // 配合 deskStructure.js：从某个二级分类下面的"新建/管理三级分类"里新建时，
  // 会自动带上对应的二级分类
  initialValue: (params) => ({
    subCategory: params?.subCategory ? { _type: 'reference', _ref: params.subCategory } : undefined,
  }),
  fields: [
    {
      name: 'title',
      title: 'Title 名称（如 Linear Flood Light / Round Flood Light）',
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
      name: 'subCategory',
      title: '所属二级分类 Parent Subcategory',
      type: 'reference',
      to: [{ type: 'subCategory' }],
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
    select: { title: 'title', subtitle: 'subCategory.title' },
  },
};
