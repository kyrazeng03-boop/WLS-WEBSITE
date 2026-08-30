const { defineCliConfig } = require('sanity/cli')

module.exports = defineCliConfig({
  api: {
    projectId: 'f7nom1u6',
    dataset: 'production',
  },
  studioHost: 'wls-lighting',
})
