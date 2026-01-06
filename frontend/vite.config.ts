import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // 允许外部访问 / Allow external access
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // 代理外部API请求以绕过CORS限制
      // 格式：/proxy-api/path -> https://cassint.casstime.com:8000/path
      '/proxy-api': {
        target: 'https://cassint.casstime.com:8000',
        changeOrigin: true,
        secure: false, // 允许自签名证书
        rewrite: (path) => {
          // 移除 /proxy-api 前缀，保留原始路径
          return path.replace(/^\/proxy-api/, '');
        },
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // 转发Cookie（重要：用于SAP认证）
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
            // 转发所有自定义请求头
            const customHeaders = ['x-requested-with', 'accept', 'content-type', 'authorization'];
            customHeaders.forEach((headerName) => {
              const headerValue = req.headers[headerName];
              if (headerValue && typeof headerValue === 'string') {
                proxyReq.setHeader(headerName, headerValue);
              }
            });
          });
          proxy.on('error', (err, _req, _res) => {
            console.error('代理错误:', err);
          });
        },
      },
    },
  },
  preview: {
    host: '0.0.0.0', // 允许外部访问 / Allow external access
    port: 4173, // Vite 预览服务器默认端口
    strictPort: false, // 如果端口被占用，尝试下一个可用端口
    // 允许所有主机访问（用于 Cloudflare Tunnel 等反向代理）
    // Allow all hosts (for Cloudflare Tunnel and other reverse proxies)
    allowedHosts: [
      'localhost',
      '.localhost',
      '.trycloudflare.com', // Cloudflare Tunnel 域名
      '.cfargotunnel.com', // Cloudflare Tunnel 备用域名
    ],
    // 注意：Vite preview 模式不支持 proxy 配置
    // 解决方案：1. 使用 Nginx 反向代理 2. 配置 VITE_API_BASE_URL 环境变量指向后端
    // Note: Vite preview mode doesn't support proxy config
    // Solution: 1. Use Nginx reverse proxy 2. Set VITE_API_BASE_URL env var to backend URL
  },
});

