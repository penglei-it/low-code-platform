# 📤 上传项目到 GitHub 指南

## 🚀 快速上传

### 方式一：使用自动化脚本（推荐）

运行：
```bash
上传到GitHub.bat
```

脚本会自动完成所有步骤。

---

## 📝 手动上传步骤

### 步骤 1：检查 Git

```bash
git --version
```

如果未安装 Git，请访问：https://git-scm.com/download/win

### 步骤 2：初始化 Git 仓库（如果还没有）

```bash
git init
```

### 步骤 3：添加文件

```bash
git add .
```

### 步骤 4：提交

```bash
git commit -m "Initial commit: 低代码开发平台"
```

### 步骤 5：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写仓库名称（例如：`low-code-platform`）
3. 选择 **Public** 或 **Private**
4. **不要**勾选 "Initialize this repository with a README"
5. 点击 **"Create repository"**
6. 复制仓库地址（例如：`https://github.com/username/repo.git`）

### 步骤 6：添加远程仓库

```bash
git remote add origin https://github.com/username/repo.git
```

### 步骤 7：推送代码

```bash
git branch -M main
git push -u origin main
```

---

## 🔐 身份验证

### 方式一：使用 Personal Access Token（推荐）

1. **生成 Token**：
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 选择权限：`repo`（全部）
   - 生成并复制 Token

2. **推送时使用**：
   - 用户名：您的 GitHub 用户名
   - 密码：粘贴 Token（不是 GitHub 密码）

### 方式二：使用 SSH 密钥

1. **生成 SSH 密钥**：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **添加到 GitHub**：
   - 复制公钥：`cat ~/.ssh/id_ed25519.pub`
   - 访问 https://github.com/settings/keys
   - 点击 "New SSH key"
   - 粘贴公钥

3. **使用 SSH URL**：
   ```bash
   git remote set-url origin git@github.com:username/repo.git
   ```

---

## ✅ 验证上传成功

1. 访问您的 GitHub 仓库
2. 确认所有文件都已上传
3. 检查文件结构是否正确

---

## 🐛 常见问题

### 问题 1：推送被拒绝

**错误**：`error: failed to push some refs`

**解决**：
```bash
# 如果是新仓库，先拉取
git pull origin main --allow-unrelated-histories

# 然后推送
git push -u origin main
```

### 问题 2：身份验证失败

**错误**：`Authentication failed`

**解决**：
- 使用 Personal Access Token 代替密码
- 或配置 SSH 密钥

### 问题 3：大文件上传失败

**错误**：`remote: error: File is too large`

**解决**：
- 检查 `.gitignore` 是否正确配置
- 确保 `node_modules`、`dist` 等目录被忽略
- 如果必须上传大文件，使用 Git LFS

---

## 📋 上传检查清单

- [ ] Git 已安装
- [ ] Git 仓库已初始化
- [ ] `.gitignore` 已配置
- [ ] 文件已添加到暂存区
- [ ] 已提交更改
- [ ] GitHub 仓库已创建
- [ ] 远程仓库已配置
- [ ] 代码已成功推送
- [ ] 在 GitHub 上验证文件存在

---

**运行 `上传到GitHub.bat` 开始上传！** 🚀

