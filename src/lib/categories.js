// 产品分类的统一定义：value 是Sanity后台存的值，label 是页面展示的友好名称
// 三处引用这份数据：产品卡片、产品列表页筛选按钮、产品详情页分类标签
// 以后要加/改分类，只需要改这一个文件，不用三处分别改

export const productCategories = [
  { value: 'outdoor', label: 'Outdoor Lighting' },
  { value: 'commercial', label: 'Commercial Lighting' },
  { value: 'smart', label: 'Smart Lighting' },
  { value: 'furniture', label: 'Furniture Lighting' },
  { value: 'dob-driver', label: 'DOB Driver' },
];

export const productCategoryLabels = Object.fromEntries(
  productCategories.map((c) => [c.value, c.label])
);
