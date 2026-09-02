// 全系列产品详情页统一展示的"公司优势"要点
// 参考竞品页面结构，文案按WLS实际情况调整
export const companyAdvantages = [
  'Customizable — Size, thickness, CCT, voltage',
  'SKD/CKD Available',
  '100% inspection on every production batch',
];

// 产品详情页FAQ区块。
// 2026-09-02 按用户提供的文案重新编辑——保留了已在网站其它地方确认过的真实信息
// （2年质保、两个工厂/Zhongshan+Egypt、OEM/ODM定制能力、单个产品规格里出现过的
// 100+lm/W、PF>0.9等真实数值），但把几个项目里还没确认过的具体数字/认证说法
// 改成了不写死数字的说法，避免日后被客户拿实际情况来对不上：
// - 产能：已确认真实数据——SMT贴片日产能16KK（1600万贴片点/天），用这个具体数字
// - "LM-80/LM-79测试认证" → 改成"可应要求提供测试报告/证书"（跟下面证书问题的处理方式一致）
// - "724小时客服 + 现场技术支持" → 改成"技术支持/安装指导"，不承诺现场到场和724小时
// 后两项等公司确认了是否有正式LM-79/LM-80认证、是否真的有724小时和现场支持团队之后，
// 可以再替换成更具体的说法。
export const productFAQs = [
  {
    q: 'What warranty and technical support does WLS provide?',
    a: "WLS backs its lighting products with a 2-year warranty and a straightforward replacement process for verified quality issues. Our team is also on hand to provide installation guidance and technical support whenever our partners need it.",
  },
  {
    q: 'Can WLS handle large-volume orders?',
    a: 'Yes. Our SMT lines run at up to 16 million placements per day, backed by full production lines at our Zhongshan, China headquarters and our Egypt facility — giving WLS the scale to support large commercial and distributor orders, with competitive volume pricing, flexible logistics, and a dedicated point of contact for your account.',
  },
  {
    q: 'Does WLS offer OEM, ODM, and private-label services?',
    a: "Yes. WLS provides flexible OEM/ODM and private-label solutions, including customized color temperatures (2700K–6500K), beam angles, optics, product design, packaging, and branding to match your market's requirements.",
  },
  {
    q: 'What performance standards do WLS products meet?',
    a: "WLS products are built with quality LED components and go through quality inspection on every production batch before shipment. Many of our lighting products deliver over 100 lm/W efficacy and a power factor above 0.9 — check the spec sheet on each product page for exact figures, and we're happy to share the relevant test reports and certificates on request.",
  },
  {
    q: 'What payment terms are available?',
    a: "WLS offers flexible payment terms for bulk orders and commercial projects. Contact us with your order details and we'll work out an arrangement that fits your business.",
  },
  {
    q: 'How can I become a WLS distributor or commercial partner?',
    a: 'Submit an inquiry through our Contact or Cooperation page. A member of our team will follow up with partnership details, tailored quotations, and customized lighting solutions for your market.',
  },
];
