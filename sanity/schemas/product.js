import {ProductImportInput} from '../components/ProductImportInput.jsx';

export default {
  name: 'product',
  title: 'Product 产品',
  type: 'document',
  fields: [
    {
      name: 'importHelper',
      title: '批量导入助手',
      type: 'string',
      components: {input: ProductImportInput},
      description: '可选：从整理好的 Word/txt 文件自动填好下面的标题、描述、规格表字段，省得一个个手动打字。',
    },
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
          { title: 'DOB Driver Series 驱动系列', value: 'dob-driver' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'coverImage',
      title: 'Cover Image 封面图（不限固定比例，方图/4:3/宣传长图都可以，详情页主图会自动按这张图的原始比例显示，不会裁切变形）',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'gallery',
      title: 'Gallery 产品图集（多角度图/应用场景图/宣传图，比例不限，会按每张图原始比例完整显示）',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    {
      name: 'documents',
      title: 'Documents 产品资料（规格书/说明书/认证等PDF文件，可上传多个）',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'documentItem',
          title: 'Document 文件',
          fields: [
            {
              name: 'title',
              title: 'Title 文件名称（如 Datasheet / Spec Sheet / Certificate）',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'file',
              title: 'File 文件（PDF）',
              type: 'file',
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: { title: 'title', subtitle: 'file.asset.originalFilename' },
          },
        },
      ],
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
