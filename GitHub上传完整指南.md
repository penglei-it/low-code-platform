# 📤 GitHub 上传完整指南

## 🚀 快速上传

运行：
```bash
完成GitHub上传.bat
```

---

## 📝 详细步骤

### 步骤 1：创建 GitHub 仓库

1. 访问 https://github.com/new
2. **Repository name**: 填写仓库名称（例如：`low-code-platform`）
3. **Description**: 可选，填写项目描述
4. **Visibility**: 选择 Public（公开）或 Private（私有）
5. **重要**：**不要**勾选以下选项：
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. 点击 **"Create repository"**

### 步骤 2：获取仓库地址

创建后，GitHub 会显示仓库地址，格式：
- HTTPS: `https://github.com/username/repo-name.git`
- SSH: `git@github.com:username/repo-name.git`

### 步骤 3：配置远程仓库

```bash
# 添加远程仓库
git remote add origin https://github.com/username/repo-name.git

# 或使用 SSH（如果配置了 SSH 密钥）
git remote add origin git@github.com:username/repo-name.git
```

### 步骤 4：推送代码

```bash
# 确保在 main 分支
git branch -M main

# 推送到 GitHub
git push -u origin main
```

---

## 🔐 身份验证

GitHub 不再接受密码登录，需要使用以下方式之一：

### 方式一：Personal Access Token（推荐）

1. **生成 Token**：
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - Note: 填写描述（例如：`Local Development`）
   - Expiration: 选择过期时间
   - Select scopes: 勾选 `repo`（全部权限）
   - 点击 "Generate token"
   - **重要**：复制 Token（只显示一次）

2. **使用 Token**：
   - 推送时，用户名输入 GitHub 用户名
   - 密码输入刚才复制的 Token（不是 GitHub 密码）

### 方式二：SSH 密钥

1. **生成 SSH 密钥**：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # 按回车使用默认路径
   # 可以设置密码或直接回车
   ```

2. **复制公钥**：
   ```bash
   # Windows
   type %USERPROFILE%\.ssh\id_ed25519.pub
   
   # 或手动打开文件：C:\Users\YourName\.ssh\id_ed25519.pub
   ```

3. **添加到 GitHub**：
   - 访问 https://github.com/settings/keys
   - 点击 "New SSH key"
   - Title: 填写描述（例如：`My Laptop`）
   - Key: 粘贴刚才复制的公钥
   - 点击 "Add SSH key"

4. **使用 SSH URL**：
   ```bash
   git remote set-url origin git@github.com:username/repo-name.git
   ```

---

## ✅ 验证上传成功

1. 访问您的 GitHub 仓库
2. 确认文件结构正确
3. 检查文件内容是否正确

---

## 🐛 常见问题

### 问题 1：推送被拒绝

**错误**：`error: failed to push some refs to 'origin'`

**原因**：远程仓库有内容（如 README）

**解决**：
```bash
# 先拉取远程内容
git pull origin main --allow-unrelated-histories

# 解决冲突（如果有）
# 然后推送
git push -u origin main
```

### 问题 2：身份验证失败

**错误**：`Authentication failed` 或 `remote: Support for password authentication was removed`

**解决**：
- 使用 Personal Access Token 代替密码
- 或配置 SSH 密钥

### 问题 3：大文件上传

**错误**：`remote: error: File is too large`

**解决**：
- 检查 `.gitignore` 是否正确
- 确保 `node_modules`、`dist` 等被忽略
- 如果必须上传大文件，使用 Git LFS

### 问题 4：分支名称不匹配

**错误**：远程仓库使用 `master`，本地使用 `main`

**解决**：
```bash
# 方法 1：重命名本地分支
git branch -M master
git push -u origin master

# 方法 2：推送到 main
git push -u origin main
```

---

## 📋 上传检查清单

- [ ] GitHub 账号已注册
- [ ] 已创建新仓库（或已有仓库）
- [ ] 已复制仓库地址
- [ ] 已配置远程仓库
- [ ] 已配置身份验证（Token 或 SSH）
- [ ] 代码已提交
- [ ] 代码已成功推送
- [ ] 在 GitHub 上验证文件存在

---

## 🔄 后续更新

上传成功后，后续更新代码：

```bash
# 添加更改
git add .

# 提交
git commit -m "更新说明"

# 推送
git push
```

---

**运行 `完成GitHub上传.bat` 开始上传！** 🚀

