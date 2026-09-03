// 一级分类的统一定义：product.js（产品的一级分类下拉）、subCategory.js
// （二级分类归属的一级分类下拉）、deskStructure.js（侧边栏分类浏览树）
// 三处都用这份数据，以后要加/改一级分类，只需要改这一个文件。
export const CATEGORY_OPTIONS = [
  { title: 'Outdoor Lighting Series 户外照明', value: 'outdoor' },
  { title: 'Commercial Lighting Series 商业照明', value: 'commercial' },
  { title: 'Smart Lighting Series 智能照明', value: 'smart' },
  { title: 'Furniture Lighting Series 家具照明', value: 'furniture' },
  { title: 'DOB Driver Series 驱动系列', value: 'dob-driver' },
];
