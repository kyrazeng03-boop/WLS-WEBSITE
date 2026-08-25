import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.wlsdoblighting.com',
  output: 'static',
  build: {
    format: 'directory',
  },
  vite: {
    server: {
      // 允许通过 localtunnel / ngrok 等隧道生成的外部域名访问本地开发服务器
      allowedHosts: true,
    },
  },
});
