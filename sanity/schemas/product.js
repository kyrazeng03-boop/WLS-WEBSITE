import {ProductImportInput} from '../components/ProductImportInput.jsx';
import {CATEGORY_OPTIONS} from '../lib/categoryOptions';

export default {
  name: 'product',
  title: 'Product 产品',
  type: 'document',
  // 配合 deskStructure.js：从"按分类浏览"里某个二级/三级分类下点"+"新建产品时，
  // 会自动带上这里的一级/二级/三级分类，不用再手动选一遍
  initialValue: (params) => ({
    category: params?.category,
    subCategory: params?.subCategory ? {_type: 'reference', _ref: params.subCategory} : undefined,
    subSubCategory: params?.subSubCategory ? {_type: 'reference', _ref: params.subSubCategory} : undefined,
  }),
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
      options: { list: CATEGORY_OPTIONS },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'subCategory',
      title: '二级分类（可选，比如 Outdoor Lighting 下面的 Flood Light / Street Light / Garden Light）',
      type: 'reference',
      to: [{ type: 'subCategory' }],
      description: '先选好上面的"一级分类"，这里的下拉列表只会显示对应一级分类下已经建好的二级分类。如果列表里没有你要的选项，去 Studio 左侧"分类管理"（或对应一级分类下面的"新建/管理二级分类"）里先建一个，再回来选。',
      options: {
        filter: ({ document }) => {
          if (!document?.category) return { filter: 'false' };
          return { filter: 'category == $cat', params: { cat: document.category } };
        },
      },
    },
    {
      name: 'subSubCategory',
      title: '三级分类（可选，比如 Flood Light 下面更细的 Linear Flood Light / Round Flood Light）',
      type: 'reference',
      to: [{ type: 'subSubCategory' }],
      description: '先选好上面的"二级分类"，这里的下拉列表只会显示对应二级分类下已经建好的三级分类。同样，没有的话先去"分类管理"里建一个。',
      options: {
        filter: ({ document }) => {
          const scRef = document?.subCategory?._ref;
          if (!scRef) return { filter: 'false' };
          return { filter: 'subCategory._ref == $sc', params: { sc: scRef } };
        },
      },
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
      description: '每个产品记录在这套分类体系里都是真实的最细一级（比如"High P"），不管有没有填二级/三级分类，都应该有自己真实的规格参数，所以这里必填至少一条。',
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
      validation: (Rule) => Rule.min(1).error('请至少填写一条规格参数'),
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
