export default {
  name: 'product',
  title: 'Product 产品',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Product Name 产品名称',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug (自动生成链接)',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category 分类',
      type: 'string',
      options: {
        list: [
          { title: 'Outdoor Lighting Series 户外照明', value: 'outdoor' },
          { title: 'Commercial Lighting Series 商业照明', value: 'commercial' },
          { title: 'Smart Lighting Series 智能照明', value: 'smart' },
          { title: 'Furniture Lighting Series 家具照明', value: 'furniture' },
          { title: 'Emergency Lighting 应急照明', value: 'emergency' },
          { title: 'DOB Driver Series 驱动系列', value: 'dob-driver' },
          { title: 'Light Guide Panel 光源板', value: 'light-guide-panel' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'coverImage',
      title: 'Cover Image 封面图（建议 1200×900px，横版4:3，将用于列表卡片和详情页主图）',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'gallery',
      title: 'Gallery 产品图集（建议每张 1000×1000px，正方形1:1，多角度图/应用场景图）',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    {
      name: 'shortDescription',
      title: 'Short Description 简短描述',
      type: 'text',
      rows: 3,
    },
    {
      name: 'specs',
      title: 'Specifications 参数表',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'specItem',
          fields: [
            { name: 'label', title: 'Label (如 Size / Thickness / Lumens)', type: 'string' },
            { name: 'value', title: 'Value', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'customizable',
      title: 'Customizable 支持定制',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'featured',
      title: 'Featured on Homepage 首页展示',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'order',
      title: 'Sort Order 排序权重 (数字越小越靠前)',
      type: 'number',
      initialValue: 100,
    },
  ],
  preview: {
    select: { title: 'name', media: 'coverImage', subtitle: 'category' },
  },
};
