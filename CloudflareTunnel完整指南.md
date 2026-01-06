# 🌐 Cloudflare Tunnel 完整部署指南

## 📋 什么是 Cloudflare Tunnel？

Cloudflare Tunnel 是 Cloudflare 提供的免费内网穿透服务，可以让您的本地服务通过互联网访问，而无需：
- ❌ 配置路由器端口转发
- ❌ 拥有公网 IP
- ❌ 配置防火墙规则
- ❌ 配置 SSL 证书（自动 HTTPS）

## ✅ 优势

- **完全免费** - 无需付费
- **域名稳定** - 可以使用自己的域名
- **自动 HTTPS** - Cloudflare 自动配置 SSL 证书
- **高性能** - 通过 Cloudflare 全球 CDN 加速
- **无流量限制** - 不像 ngrok 有流量限制
- **安全可靠** - 企业级安全防护

## 🚀 快速开始

### 方式一：使用自动化脚本（推荐）

运行：
```bash
部署CloudflareTunnel.bat
```

脚本会自动：
1. 检查 cloudflared 是否安装
2. 引导您登录 Cloudflare
3. 创建隧道
4. 启动服务

### 方式二：手动部署

#### 步骤 1：安装 cloudflared

**Windows - 方法 1（推荐）：使用 Scoop**
```bash
# 安装 Scoop（如果还没有）
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# 安装 cloudflared
scoop install cloudflared
```

**Windows - 方法 2：使用 Chocolatey**
```bash
choco install cloudflared
```

**Windows - 方法 3：手动下载**
1. 访问：https://github.com/cloudflare/cloudflared/releases
2. 下载：`cloudflared-windows-amd64.exe`
3. 重命名为 `cloudflared.exe`
4. 放到 PATH 目录（如 `C:\Windows\System32`）或项目目录

**验证安装**：
```bash
cloudflared version
```

#### 步骤 2：登录 Cloudflare

```bash
cloudflared tunnel login
```

这会：
1. 打开浏览器
2. 提示您登录 Cloudflare 账号（如果没有，先注册：https://dash.cloudflare.com/sign-up）
3. 选择要使用的域名（如果没有域名，可以跳过，使用随机域名）

#### 步骤 3：创建隧道

```bash
cloudflared tunnel create low-code-platform
```

#### 步骤 4：选择部署模式

---

## 📌 方案 A：快速模式（随机域名，无需配置）

**适用场景**：临时演示、测试、开发

### 启动服务

**启动前端隧道**：
```bash
cloudflared tunnel --url http://localhost:4173
```

**启动后端隧道**（新终端）：
```bash
cloudflared tunnel --url http://localhost:3001
```

### 结果

您会看到类似以下的输出：
```
+----------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time   |
|  to be reachable):                                                          |
|  https://random-words-1234.trycloudflare.com                              |
+----------------------------------------------------------------------------+
```

将这些地址分享给其他人即可访问！

### 优点
- ✅ 无需任何配置
- ✅ 立即可用
- ✅ 适合快速测试

### 缺点
- ❌ 每次重启域名都会变化
- ❌ 无法使用自定义域名

---

## 📌 方案 B：标准模式（自定义域名，需要配置）

**适用场景**：正式部署、长期使用、生产环境

### 前提条件

1. **拥有域名**（可以在 Cloudflare 购买，或使用已有域名）
2. **域名已添加到 Cloudflare**
   - 登录 Cloudflare Dashboard
   - 添加网站
   - 按照提示修改 DNS 名称服务器

### 步骤 1：创建配置文件

创建文件：`%USERPROFILE%\.cloudflared\config.yml`

```yaml
tunnel: low-code-platform
credentials-file: C:\Users\<您的用户名>\.cloudflared\<tunnel-id>.json

ingress:
  # 前端 - 主域名
  - hostname: your-domain.com
    service: http://localhost:4173
  
  # 后端 API - 子域名
  - hostname: api.your-domain.com
    service: http://localhost:3001
  
  # 默认规则（必须放在最后！）
  - service: http_status:404
```

**重要**：
- 将 `your-domain.com` 替换为您的实际域名
- 将 `<tunnel-id>` 替换为实际的隧道 ID（运行 `cloudflared tunnel list` 查看）
- 将 `<您的用户名>` 替换为 Windows 用户名

### 步骤 2：配置 DNS

在 Cloudflare Dashboard：

1. 选择您的域名
2. 进入 **DNS** → **Records**
3. 添加记录：

**前端记录**：
- 类型：`CNAME`
- 名称：`@` 或 `www`
- 目标：`<tunnel-id>.cfargotunnel.com`
- 代理状态：已代理（橙色云朵）

**后端记录**：
- 类型：`CNAME`
- 名称：`api`
- 目标：`<tunnel-id>.cfargotunnel.com`
- 代理状态：已代理（橙色云朵）

### 步骤 3：运行隧道

```bash
cloudflared tunnel run low-code-platform
```

### 步骤 4：验证

访问：
- 前端：`https://your-domain.com`
- 后端 API：`https://api.your-domain.com/api/health`

---

## 🔧 高级配置

### 配置为 Windows 服务（开机自启）

```bash
# 1. 安装为 Windows 服务
cloudflared service install

# 2. 启动服务
net start cloudflared

# 3. 停止服务
net stop cloudflared

# 4. 卸载服务
cloudflared service uninstall
```

### 使用配置文件运行

如果您创建了配置文件，可以直接运行：

```bash
cloudflared tunnel --config %USERPROFILE%\.cloudflared\config.yml run low-code-platform
```

### 查看隧道列表

```bash
cloudflared tunnel list
```

### 删除隧道

```bash
cloudflared tunnel delete low-code-platform
```

---

## 🐛 常见问题

### Q1: 登录时提示"没有域名"

**A**: 
- 如果只是想测试，可以选择"跳过"，使用随机域名方案
- 如果需要自定义域名，先在 Cloudflare 添加域名

### Q2: DNS 配置后无法访问

**A**: 
1. 检查 DNS 记录是否正确
2. 等待 DNS 生效（可能需要几分钟到几小时）
3. 确保代理状态是"已代理"（橙色云朵）

### Q3: 如何查找隧道 ID？

**A**: 
```bash
cloudflared tunnel list
```

会显示类似：
```
ID                                   NAME
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  low-code-platform
```

### Q4: 配置文件位置在哪里？

**A**: 
- Windows: `%USERPROFILE%\.cloudflared\config.yml`
- 通常路径：`C:\Users\<用户名>\.cloudflared\config.yml`

### Q5: 如何同时运行多个隧道？

**A**: 
创建多个配置文件，使用不同的配置文件运行：
```bash
cloudflared tunnel --config config1.yml run tunnel1
cloudflared tunnel --config config2.yml run tunnel2
```

---

## 📝 完整示例

### 示例 1：快速测试（随机域名）

```bash
# 终端 1 - 前端
cloudflared tunnel --url http://localhost:4173

# 终端 2 - 后端
cloudflared tunnel --url http://localhost:3001
```

### 示例 2：使用自定义域名

**配置文件** (`~/.cloudflared/config.yml`)：
```yaml
tunnel: low-code-platform
credentials-file: C:\Users\YourName\.cloudflared\xxxxx.json

ingress:
  - hostname: app.example.com
    service: http://localhost:4173
  - hostname: api.example.com
    service: http://localhost:3001
  - service: http_status:404
```

**运行**：
```bash
cloudflared tunnel run low-code-platform
```

---

## 🎯 推荐配置

### 开发/测试环境
→ 使用**快速模式**（随机域名）

### 正式部署
→ 使用**标准模式**（自定义域名）+ Windows 服务

---

## 📚 相关资源

- Cloudflare 官网：https://www.cloudflare.com
- Cloudflare Tunnel 文档：https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- cloudflared GitHub：https://github.com/cloudflare/cloudflared

---

**现在运行 `部署CloudflareTunnel.bat` 开始部署！** 🚀

