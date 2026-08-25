# WLS Lighting 官网

技术栈：Astro（静态站点生成）+ Sanity（内容管理后台）
Sanity Project ID：`f7nom1u6` / Dataset：`production`

---

## 一、⚠️ 安全提醒（请先看这个）

你之前在聊天里发过一次 API Token，那个 Token 有读写权限。**如果还没撤销，请立刻去做**：
Sanity 后台 → API → Tokens → 找到那个 Token → Delete，然后重新生成一个新的。

新 Token 拿到后：
1. 打开项目根目录的 `.env.example`，复制一份改名为 `.env`
2. 把新 Token 填进 `SANITY_API_TOKEN=` 后面
3. `.env` 文件已经在 `.gitignore` 里，不会被提交到代码仓库，也不会被别人看到

---

## 二、本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动网站开发服务器（预览网站效果）
npm run dev
# 访问 http://localhost:4321

# 3. 启动 Sanity Studio（内容管理后台，本地预览用）
npm run sanity:dev
# 访问 http://localhost:3333
```

## 三、部署 Sanity Studio（正式的内容管理后台）

Studio 部署后，你和同事就可以直接用一个网址登录后台管理内容，不需要在本地跑：

```bash
npm run sanity:deploy
```

部署时会让你起一个 studio 名字（如 `wls-lighting`），之后后台地址就是：
`https://wls-lighting.sanity.studio`

把这个网址收藏起来，以后加产品/发新闻都从这里登录操作。

---

## 四、导入真实产品/新闻数据（快速预览用）

为了方便你先看到真实内容的效果，`scripts/` 目录下准备了一份从你原官网（wlsdoblighting.com）整理出的真实数据——**7个产品**（覆盖户外/商业/智能/家具/应急/驱动共5个分类）+ **5篇新闻**（含完整正文），图片也是直接从原官网抓取的。

运行这一条命令，就会自动把这些数据连图片一起传到你的Sanity后台：

```bash
npm run seed
```

**运行前提**：`.env` 文件必须已经填好 `SANITY_API_TOKEN`（Editor权限）和 `PUBLIC_SANITY_PROJECT_ID`。

跑完之后：
- 去 `npm run dev` 刷新网站，首页/产品页/新闻页会直接显示这些真实内容
- 或者登录 Sanity Studio 后台，能看到这些产品和新闻已经建好了，可以直接在上面编辑、补充参数（原网站产品详情页大多还没填Specifications参数，这部分需要你后续在后台手动补充）

**这个脚本可以重复运行**（用固定ID识别，重跑会更新已有内容而不是重复创建），但每次都会重新上传一遍图片，正常跑一两次预览效果就够了，不需要频繁重跑。

> 这批数据只是覆盖了原官网7个产品做效果预览，原官网其实还有20多个产品分布在5个分类下。想要更多产品，可以照着 `scripts/seed-data.js` 里的格式往数组里加，或者更省事的方式——直接登录 Sanity Studio 后台手动逐个添加，两种方式都可以。

## 五、内容模型说明（后台字段对应关系）

### Product 产品
| 字段 | 说明 |
|---|---|
| Product Name | 产品名称 |
| Category | 下拉选择分类（对应产品页筛选按钮）|
| Cover Image | 列表页/详情页封面图 |
| Gallery | 详情页缩略图组，可传多张应用场景图 |
| Short Description | 卡片/详情页简介 |
| Specifications | 参数表，一行一个（如 Size / 800×600mm）|
| Customizable | 是否显示"支持定制"标签 |
| Featured on Homepage | 勾选后会出现在首页"Product Range"板块（建议精选6个以内）|
| Sort Order | 数字越小排越前面 |

### News 新闻
| 字段 | 说明 |
|---|---|
| Title / Category / Cover Image / Published Date | 基础信息 |
| Summary | 列表页摘要，建议控制在200字符以内 |
| Body | 正文，支持富文本+插图 |

### Site Settings 全局设置
公司电话、WhatsApp号码、邮箱、地址等，改这里全站（页脚、联系页、WhatsApp悬浮按钮）会自动同步更新，不需要改代码。
**注意**：这个是单例文档，只需要建一条记录。

---

## 六、图片清单（全站图片位盘点 + 尺寸标注）

全站所有需要放图片的位置已经梳理清楚，并按下表的尺寸生成了**带标注的模板占位图**，已经放进 `public/images/` 里——你现在跑 `npm run dev` 打开网站，会直接看到每个位置显示"这里应该放什么图、多大尺寸"的可视化提示，而不是空白或裂图标。

### A. 本地固定图片（在 `public/images/` 文件夹里，直接替换同名文件即可生效，无需改代码）

| 文件名 | 位置 | 尺寸 | 说明 |
|---|---|---|---|
| `hero-factory.jpg` | 首页首屏大图 | **2400 × 1600px** | 工厂实拍或产品阵列大图，横版，会铺满整个首屏 |
| `factory-1.jpg` | About页·工厂产线图 | **1200 × 900px** | 产线/设备实拍，横版4:3 |
| `certificates.jpg` | About页·认证证书图 | **1200 × 900px** | 证书拼版或实拍，横版4:3 |
| `placeholder-product.jpg` | 产品图兜底占位 | 1200 × 900px | 正常情况用不到——只有当Sanity后台某个产品忘记传图时才会显示这张，不用管它 |
| `placeholder-news.jpg` | 新闻图兜底占位 | 1200 × 800px | 同上，新闻文章忘记传封面时的保底显示 |

**替换方法**：把真实图片改成和上表完全一样的文件名（比如新的首屏图也叫 `hero-factory.jpg`），直接拖进 `public/images/` 文件夹覆盖旧文件，刷新网站就生效，不需要改任何代码。

**图片优化建议**（针对印度/中东/非洲网速）：替换前建议用 [Squoosh](https://squoosh.app) 转成 WebP 格式压缩，单张控制在 300KB 以内；如果就用 jpg 也可以，只是保持文件名一致即可（如果换成 `.webp` 后缀，需要同步把代码里对应的文件名也改一下，这种情况可以找我帮忙改）。

### B. Sanity后台上传的图片（产品、新闻，无需碰代码，登录后台直接传）

这些不是本地文件，是你们运营同事登录Sanity后台，在对应产品/新闻的表单里直接上传的。字段名旁边已经标好了建议尺寸，登录后台就能看到：

| 内容类型 | 字段 | 建议尺寸 | 说明 |
|---|---|---|---|
| 产品 Product | Cover Image 封面图 | **1200 × 900px**（横版4:3） | 会同时用在产品列表卡片和详情页主图上 |
| 产品 Product | Gallery 产品图集 | **1000 × 1000px**（正方形1:1） | 详情页缩略图组，多角度图/应用场景图，可传多张 |
| 新闻 News | Cover Image 封面图 | **1200 × 800px**（横版3:2） | 会同时用在新闻列表卡片和文章顶部大图上 |

---

## 七、联系表单接入

`src/components/ContactForm.astro` 目前是占位逻辑，需要接入一个真实的表单接收服务，推荐两个免费/低成本选项：

1. **Formspree**（最简单）：注册后拿到一个 endpoint 网址，填到 `.env` 的 `CONTACT_FORM_ENDPOINT`
2. **自建接口**：如果你们以后有后端，可以换成自己的API地址

在没配置之前，表单会提示"Form endpoint not configured yet"，**这期间 WhatsApp 悬浮按钮和联系页的WhatsApp链接是可以正常用的**，不影响询盘接收。

---

## 八、部署到线上

推荐 **Vercel** 或 **Cloudflare Pages**，两者都对静态Astro站点零配置支持：

### Vercel 部署步骤
1. 把这个项目推到 GitHub 仓库
2. 登录 vercel.com → New Project → 选择该仓库 → 直接部署（Astro会被自动识别）
3. 在 Vercel 项目设置里添加环境变量（把 `.env` 里的内容对应填进去）
4. 绑定你的域名 `wlsdoblighting.com`

### 内容更新后自动重新发布
在 Sanity 后台 → API → Webhooks，添加一个 Webhook，指向 Vercel 提供的 Deploy Hook 地址。
这样以后你们在Sanity后台发布内容后，网站会在几分钟内自动更新，全程不需要人工操作。

---

## 九、目录结构

```
wls-website/
├── sanity/                    # Sanity Studio 配置与内容模型
│   └── schemas/
│       ├── product.js
│       ├── news.js
│       └── siteSettings.js
├── src/
│   ├── components/            # Header / Footer / WhatsApp按钮 / 卡片 / 表单
│   ├── layouts/Layout.astro   # 全局页面外壳（SEO meta等）
│   ├── lib/sanity.js          # Sanity数据请求函数
│   ├── pages/
│   │   ├── index.astro        # 首页
│   │   ├── about.astro
│   │   ├── cooperation.astro
│   │   ├── contact.astro
│   │   ├── products/
│   │   │   ├── index.astro    # 产品列表页
│   │   │   └── [slug].astro   # 产品详情页模板
│   │   └── news/
│   │       ├── index.astro
│   │       └── [slug].astro
│   └── styles/global.css      # 设计token（颜色/字体/间距）
└── public/images/             # 固定用图（非CMS管理的图片）
```

---

## 十、还没做完 / 后续可以做的

- [ ] 换上真实工厂/产品图（见第六节清单）
- [ ] 接入真实联系表单服务（见第七节）
- [ ] 在Sanity后台补充首批产品和新闻内容
- [ ] 部署上线并绑定域名
- [ ] （可选）后续如果印度/中东询盘量大，可以考虑加多语言版本
