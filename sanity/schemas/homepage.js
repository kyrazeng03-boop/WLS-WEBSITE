export default {
  name: 'homepage',
  title: 'Homepage Content 首页内容',
  type: 'document',
  // 这是"单例"文档：整个网站只需要建一条记录，不需要多条
  fields: [
    {
      name: 'heroSlides',
      title: 'Hero Banner Slides 首页轮播图（建议4张，每张配一组文案）',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'heroSlide',
          title: 'Slide',
          fields: [
            {
              name: 'image',
              title: 'Image 图片（建议 2400×1600px，横版）',
              type: 'image',
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            },
            { name: 'eyebrow', title: 'Eyebrow 小标题（如 Manufacturing Excellence）', type: 'string' },
            { name: 'heading', title: 'Heading 主标题', type: 'string' },
            { name: 'description', title: 'Description 描述文字', type: 'text', rows: 3 },
          ],
          preview: {
            select: { title: 'heading', subtitle: 'eyebrow', media: 'image' },
          },
        },
      ],
    },
    {
      name: 'founderPhoto',
      title: 'Founder Photo 创始人照片 / 视频封面图（建议 800×800px，正方形）',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'founderQuote',
      title: 'Founder Quote 创始人引言',
      type: 'text',
      rows: 3,
    },
    {
      name: 'founderName',
      title: 'Founder Name 创始人署名（如 Founder, WLS Lighting）',
      type: 'string',
    },
    {
      name: 'testimonials',
      title: 'Testimonials 客户评价（建议6条）',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'testimonial',
          title: 'Review',
          fields: [
            { name: 'quote', title: 'Quote 评价内容', type: 'text', rows: 3 },
            { name: 'author', title: 'Author 署名（如 Distributor, India）', type: 'string' },
          ],
          preview: {
            select: { title: 'author', subtitle: 'quote' },
          },
        },
      ],
    },
  ],
};
