export default {
  name: 'news',
  title: 'News 新闻',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title 标题',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category 分类',
      type: 'string',
      options: {
        list: [
          { title: 'Company News 公司动态', value: 'company' },
          { title: 'Industry Insights 行业知识', value: 'industry' },
          { title: 'Case Study 应用案例', value: 'case-study' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'coverImage',
      title: 'Cover Image 封面图（建议 1200×800px，横版3:2，将用于列表卡片和文章顶部大图）',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'publishedAt',
      title: 'Published Date 发布日期',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'summary',
      title: 'Summary 摘要 (用于列表页展示)',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(200),
    },
    {
      name: 'body',
      title: 'Body 正文',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
    },
  ],
  orderings: [
    {
      title: 'Publish Date, New to Old',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title', media: 'coverImage', subtitle: 'category' },
  },
};
