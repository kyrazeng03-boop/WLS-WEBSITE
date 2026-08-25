export default {
  name: 'siteSettings',
  title: 'Site Settings 全局设置',
  type: 'document',
  fields: [
    {
      name: 'companyName',
      title: 'Company Name',
      type: 'string',
      initialValue: 'WLS Lighting',
    },
    {
      name: 'tagline',
      title: 'Tagline 一句话定位语',
      type: 'string',
    },
    {
      name: 'phone',
      title: 'Phone 电话',
      type: 'string',
    },
    {
      name: 'whatsapp',
      title: 'WhatsApp Number (含国家码，如 8615807600815)',
      type: 'string',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
    },
    {
      name: 'address',
      title: 'Address 地址',
      type: 'text',
      rows: 2,
    },
    {
      name: 'workingHours',
      title: 'Working Hours 工作时间',
      type: 'string',
    },
    {
      name: 'facebookUrl',
      title: 'Facebook URL',
      type: 'string',
    },
    {
      name: 'exportCountries',
      title: 'Export Countries Count 出口国家数量',
      type: 'number',
    },
    {
      name: 'foundedYear',
      title: 'Founded Year 成立年份',
      type: 'number',
    },
  ],
};
