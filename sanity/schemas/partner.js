export default {
  name: 'partner',
  title: 'Partner 合作伙伴',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Partner Name 名称',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'logo',
      title: 'Logo（建议透明底PNG，横版）',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Sort Order 排序权重（数字越小越靠前）',
      type: 'number',
      initialValue: 100,
    },
  ],
  orderings: [
    { title: 'Sort Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', media: 'logo' },
  },
};
