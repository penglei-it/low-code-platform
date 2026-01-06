# CORS问题解决方案

## 问题描述

在API设计器中调用外部API（如 `https://cassint.casstime.com:8000`）时遇到CORS跨域错误，而Apifox可以正常调用。

## 根本原因

1. **浏览器同源策略限制**：浏览器不允许JavaScript直接访问不同源的API
2. **服务器CORS配置**：目标服务器可能没有正确配置CORS响应头
3. **Cookie传输**：跨域请求默认不发送Cookie，而SAP等系统需要Cookie进行认证

## 解决方案

### 1. 添加代理配置（主要方案）

在 `frontend/vite.config.ts` 中添加了代理配置：

```typescript
'/proxy-api': {
  target: 'https://cassint.casstime.com:8000',
  changeOrigin: true,
  secure: false, // 允许自签名证书
  rewrite: (path) => path.replace(/^\/proxy-api/, ''),
  configure: (proxy, _options) => {
    proxy.on('proxyReq', (proxyReq, req, _res) => {
      // 转发Cookie（重要：用于SAP认证）
      if (req.headers.cookie) {
        proxyReq.setHeader('Cookie', req.headers.cookie);
      }
      // 转发自定义请求头
      const customHeaders = ['x-requested-with', 'accept', 'content-type', 'authorization'];
      customHeaders.forEach((headerName) => {
        const headerValue = req.headers[headerName];
        if (headerValue && typeof headerValue === 'string') {
          proxyReq.setHeader(headerName, headerValue);
        }
      });
    });
  },
}
```

**工作原理**：
- 外部API请求通过 `/proxy-api` 路径代理
- 开发服务器（Vite）将请求转发到目标服务器
- 由于是服务器到服务器的请求，不受浏览器CORS限制

### 2. 添加Cookie支持

在 `frontend/src/pages/ApiDesigner.tsx` 中：

```typescript
const [sendCredentials, setSendCredentials] = useState<boolean>(true);

// 在fetch请求中
fetchOptions.credentials = sendCredentials ? 'include' : 'same-origin';
```

**作用**：确保Cookie（如 `sap-usercontext`）能够正确发送到服务器。

### 3. 添加代理开关

在UI中添加了"使用代理"开关，允许用户选择：
- **开启**：使用代理绕过CORS（推荐，与Apifox类似）
- **关闭**：直接请求，需要服务器正确配置CORS

### 4. 优化URL构建逻辑

`buildFullUrl` 函数现在会：
1. 检测是否是外部URL（跨域）
2. 如果启用代理，将外部URL转换为代理路径：`/proxy-api/path`
3. 如果关闭代理，直接使用原始URL

## 使用说明

### 步骤1：重启开发服务器

由于修改了 `vite.config.ts`，需要重启开发服务器：

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
cd frontend
npm run dev
```

### 步骤2：配置API测试

1. 在API设计器中，填写外部API地址（如：`https://cassint.casstime.com:8000/sap/opu/odata/sap/ZGS_ICERP_CASSINT_DINGINFO_SRV/UserInfoSet`）
2. 确保"使用代理"开关**开启**（默认开启）
3. 确保"发送Cookie"开关**开启**（默认开启）
4. 配置请求头（如：`Accept: application/json`, `X-Requested-With: X`）
5. 填写请求体（JSON格式）
6. 点击"发送测试"

### 步骤3：验证请求

- 检查浏览器开发者工具的Network标签
- 请求URL应该是：`http://localhost:3000/proxy-api/...`
- 状态码应该是200或201（成功）

## 与Apifox的对比

| 特性 | Apifox | 本项目（使用代理） |
|------|--------|------------------|
| CORS处理 | 内置代理/云端代理 | Vite开发服务器代理 |
| Cookie支持 | 自动发送 | 通过开关控制 |
| 请求头转发 | 自动 | 自动（通过代理配置） |
| 跨域请求 | 无限制 | 无限制（通过代理） |

## 注意事项

1. **仅开发环境**：代理配置仅在开发环境（`npm run dev`）中生效
2. **生产环境**：生产环境需要：
   - 配置后端代理服务
   - 或确保目标服务器正确配置CORS
3. **安全性**：代理会转发所有请求头，包括Cookie，请确保目标服务器可信
4. **证书验证**：`secure: false` 允许自签名证书，仅用于开发环境

## 故障排查

### 问题1：仍然报CORS错误

**可能原因**：
- 开发服务器未重启
- "使用代理"开关未开启
- 请求URL格式错误

**解决方法**：
1. 重启开发服务器
2. 检查"使用代理"开关状态
3. 检查Network标签中的实际请求URL

### 问题2：代理返回404

**可能原因**：
- 目标服务器地址错误
- 代理路径配置错误

**解决方法**：
1. 检查 `vite.config.ts` 中的 `target` 配置
2. 检查 `buildFullUrl` 函数生成的代理路径

### 问题3：Cookie未发送

**可能原因**：
- "发送Cookie"开关未开启
- 浏览器未设置Cookie

**解决方法**：
1. 确保"发送Cookie"开关开启
2. 在浏览器开发者工具中检查请求头是否包含Cookie

## 后续优化建议

1. **动态代理目标**：支持配置多个代理目标，根据URL自动选择
2. **环境变量配置**：将代理目标配置移到环境变量
3. **代理日志**：添加代理请求日志，便于调试
4. **错误处理**：优化代理错误提示，提供更详细的错误信息

