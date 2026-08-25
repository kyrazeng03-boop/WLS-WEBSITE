// 用 .cjs 后缀而不是 .js：因为 package.json 里配置了 "type": "module"，
// 会让 .js 文件默认按 ESM 处理，但 Sanity CLI 工具内部读取这个配置文件时
// 用的是旧的 CommonJS 方式（require），两者冲突会导致 "require is not defined"
// 警告，并进一步导致 CLI 读不到 projectId 报错。.cjs 后缀强制这个文件按
// CommonJS 处理，绕开这个冲突，经过测试验证有效。
const { defineCliConfig } = require('sanity/cli')

module.exports = defineCliConfig({
  api: {
    projectId: 'f7nom1u6',
    dataset: 'production',
  },
})
