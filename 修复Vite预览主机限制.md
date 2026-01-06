# 修复 Vite 预览主机限制

## 问题描述

访问 Cloudflare Tunnel 提供的地址时出现错误：
```
Blocked request. This host ("xxx.trycloudflare.com") is not allowed.
To allow this host, add "xxx.trycloudflare.com" to `preview.allowedHosts` in vite.config.js.
```

## 原因

Vite 预览模式默认只允许 `localhost` 访问，这是安全机制。当通过 Cloudflare Tunnel 等反向代理访问时，需要使用不同的主机名。

## ✅ 已修复

已在 `frontend/vite.config.ts` 中添加了 `preview.allowedHosts` 配置：

```typescript
preview: {
  host: '0.0.0.0',
  port: 4173,
  strictPort: false,
  allowedHosts: [
    'localhost',
    '.localhost',
    '.trycloudflare.com', // Cloudflare Tunnel 域名
    '.cfargotunnel.com',  // Cloudflare Tunnel 备用域名
  ],
}
```

## 🔄 重启服务

已自动重启前端服务，新配置已生效。

## ✅ 验证

现在可以：
1. 访问 Cloudflare Tunnel 提供的地址
2. 通过互联网访问您的应用
3. 不再出现 "host is not allowed" 错误

## 📝 如果仍有问题

如果修改后仍有问题，请：
1. 手动重启前端服务：
   ```bash
   cd frontend
   npm run preview -- --host 0.0.0.0
   ```

2. 检查 Cloudflare Tunnel 窗口中的地址是否正确

3. 清除浏览器缓存并刷新页面

---

**问题已修复！现在可以通过 Cloudflare Tunnel 地址正常访问了！** ✅

