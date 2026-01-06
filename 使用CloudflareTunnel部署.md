# 🌐 使用 Cloudflare Tunnel 实现互联网访问（免费方案）

## 📋 简介

Cloudflare Tunnel 是 Cloudflare 提供的免费内网穿透服务，相比 ngrok：
- ✅ **完全免费** - 无需付费
- ✅ **域名稳定** - 可以配置自定义域名，不会每次变化
- ✅ **自动 HTTPS** - Cloudflare 自动配置 SSL 证书
- ✅ **无流量限制** - 不像 ngrok 有流量限制
- ✅ **高性能** - 通过 Cloudflare 全球 CDN 加速

## 🚀 快速开始

### 方式一：使用自动化脚本（推荐）

1. **首次部署**：运行 `部署CloudflareTunnel.bat`
2. **日常启动**：运行 `一键启动CloudflareTunnel.bat`

### 方式二：手动部署

## 📝 详细步骤

### 步骤 1：下载 Cloudflare Tunnel

**Windows**：
1. 访问：https://github.com/cloudflare/cloudflared/releases
2. 下载 `cloudflared-windows-amd64.exe`
3. 重命名为 `cloudflared.exe`
4. 放到 PATH 目录（如 `C:\Windows\System32`）或项目目录

**或使用包管理器**：
```bash
# 使用 Scoop（推荐）
scoop install cloudflared

# 或使用 Chocolatey
choco install cloudflared
```

### 步骤 2：登录 Cloudflare

```bash
cloudflared tunnel login
```

这会打开浏览器，登录您的 Cloudflare 账号（如果没有，需要先注册：https://dash.cloudflare.com/sign-up）

### 步骤 3：创建隧道

```bash
cloudflared tunnel create low-code-platform
```

### 步骤 4：配置隧道

创建配置文件 `~/.cloudflared/config.yml`：

```yaml
tunnel: <tunnel-id>
credentials-file: C:\Users\<用户名>\.cloudflared\<tunnel-id>.json

ingress:
  # 前端服务
  - hostname: your-domain.com
    service: http://localhost:4173
  
  # 后端 API
  - hostname: api.your-domain.com
    service: http://localhost:3001
  
  # 默认规则（必须放在最后）
  - service: http_status:404
```

### 步骤 5：配置 DNS

在 Cloudflare Dashboard 中：
1. 选择您的域名
2. 进入 DNS 设置
3. 添加记录：
   - 类型：CNAME
   - 名称：@ 或 www
   - 目标：`<tunnel-id>.cfargotunnel.com`
   - 代理状态：已代理（橙色云朵）

### 步骤 6：运行隧道

```bash
cloudflared tunnel run low-code-platform
```

现在可以通过您的域名访问了！

## 简化方案（不需要域名）

如果不想配置域名，也可以使用随机域名：

```bash
# 直接运行，会获得随机域名
cloudflared tunnel --url http://localhost:4173
```

## Windows 服务配置（开机自启）

```bash
# 安装为 Windows 服务
cloudflared service install
```

## 配置文件示例

创建 `cloudflared-config.yml`：

```yaml
tunnel: <您的tunnel-id>
credentials-file: C:\Users\<用户名>\.cloudflared\<tunnel-id>.json

ingress:
  # 前端 - 主域名
  - hostname: your-domain.com
    service: http://localhost:4173
  
  # 后端 API - 子域名
  - hostname: api.your-domain.com
    service: http://localhost:3001
  
  # 所有其他请求返回 404
  - service: http_status:404
```

运行：
```bash
cloudflared tunnel --config cloudflared-config.yml run
```

## 优势

- ✅ 完全免费
- ✅ 可以使用自己的域名
- ✅ 自动 HTTPS
- ✅ 域名稳定（不会每次变化）
- ✅ 无流量限制
- ✅ 高性能（Cloudflare 全球 CDN）

