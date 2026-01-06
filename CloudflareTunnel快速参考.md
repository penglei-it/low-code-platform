# Cloudflare Tunnel 快速参考卡片

## 🚀 一键命令

### 安装 cloudflared
```bash
# Windows (Scoop)
scoop install cloudflared

# Windows (Chocolatey)
choco install cloudflared
```

### 登录 Cloudflare
```bash
cloudflared tunnel login
```

### 创建隧道
```bash
cloudflared tunnel create low-code-platform
```

### 快速模式（随机域名）
```bash
# 前端
cloudflared tunnel --url http://localhost:4173

# 后端（新终端）
cloudflared tunnel --url http://localhost:3001
```

### 标准模式（自定义域名）
```bash
cloudflared tunnel run low-code-platform
```

## 📁 配置文件位置

**Windows**: `%USERPROFILE%\.cloudflared\config.yml`
通常路径：`C:\Users\<用户名>\.cloudflared\config.yml`

## 📝 配置文件模板

```yaml
tunnel: low-code-platform
credentials-file: C:\Users\<用户名>\.cloudflared\<tunnel-id>.json

ingress:
  # 前端
  - hostname: your-domain.com
    service: http://localhost:4173
  
  # 后端 API
  - hostname: api.your-domain.com
    service: http://localhost:3001
  
  # 默认规则（必须最后）
  - service: http_status:404
```

## 🔍 常用命令

```bash
# 查看隧道列表
cloudflared tunnel list

# 查看隧道信息
cloudflared tunnel info low-code-platform

# 删除隧道
cloudflared tunnel delete low-code-platform

# 安装为 Windows 服务
cloudflared service install

# 启动服务
net start cloudflared
```

## 🌐 DNS 配置

在 Cloudflare Dashboard → DNS → Records：

| 类型  | 名称 | 目标                    | 代理状态 |
|-------|------|-------------------------|----------|
| CNAME | @    | `<tunnel-id>.cfargotunnel.com` | 已代理   |
| CNAME | api  | `<tunnel-id>.cfargotunnel.com` | 已代理   |

## 📚 详细文档

- 完整指南：`CloudflareTunnel完整指南.md`
- 快速部署：`部署CloudflareTunnel.bat`
- 一键启动：`一键启动CloudflareTunnel.bat`

