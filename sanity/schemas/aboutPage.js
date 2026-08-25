export default {
  name: 'aboutPage',
  title: 'About Page Images 关于我们页图片',
  type: 'document',
  // 这是"单例"文档：整个网站只需要建一条记录
  fields: [
    {
      name: 'factoryImage',
      title: 'Factory / Production Line Photo 产线图（建议 1200×900px）',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'certificatesImage',
      title: 'Certificates Photo 认证证书图（建议 1200×900px）',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'workshopPhotos',
      title: 'Workshop Photos 车间照片墙（建议6张）',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    {
      name: 'equipmentPhotos',
      title: 'R&D / Testing Equipment Photos 研发测试设备照片（建议4张，各配一句说明）',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'equipmentPhoto',
          title: 'Photo',
          fields: [
            { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
            { name: 'caption', title: 'Caption 说明文字（如 R&D lab / Testing equipment）', type: 'string' },
          ],
          preview: {
            select: { title: 'caption', media: 'image' },
          },
        },
      ],
    },
  ],
};
