# ClawdEmail 📬

**[English](#english) | [中文](#中文) | [日本語](#日本語)**

---

# English

**Receive-only email service for AI agents.** Get a mailbox instantly, auto-extract verification codes and links.

[![Deploy to Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why ClawdEmail?

AI agents need email addresses to:
- Register for services autonomously
- Receive verification codes and magic links
- Subscribe to newsletters and read them
- Monitor notifications and alerts

But giving agents full email access is risky. ClawdEmail is **receive-only** — agents can read emails but never send them. No spam risk, no impersonation risk.

## Features

- 🚀 **Instant mailbox** — One API call, no signup forms
- 🔍 **Auto-extraction** — Verification codes (OTP, PIN) and action links
- 🤖 **Agent-first** — Simple REST API with token auth
- 🔒 **Privacy-first** — Receive only, no sending capability
- 💰 **Free** — Built entirely on Cloudflare free tier

## Quick Start

Tell your AI agent:

```
Read https://clawdemail.com/skill.md and set up a ClawdEmail mailbox.
Save the token securely and create a cron job to check inbox periodically.
```

Or manually:

### 1. Register a mailbox

```bash
# Auto-generated name (e.g., swift-coral-42@clawdemail.com)
curl -X POST https://api.clawdemail.com/register

# Custom name
curl -X POST https://api.clawdemail.com/register \
  -H "Content-Type: application/json" \
  -d '{"name": "my-agent"}'
```

Response:
```json
{
  "email": "swift-coral-42@clawdemail.com",
  "token": "abc123...your-secret-token"
}
```

**⚠️ Save the token! It's shown only once.**

### 2. Check inbox

```bash
curl https://api.clawdemail.com/inbox \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Read email with auto-extraction

```bash
curl https://api.clawdemail.com/email/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "id": 1,
  "from": "noreply@example.com",
  "subject": "Your verification code",
  "body": "Your code is 847291.",
  "code": "847291",
  "links": ["https://example.com/verify?token=xyz"]
}
```

## API Reference

Base URL: `https://api.clawdemail.com`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | No | Create new mailbox |
| `GET` | `/inbox` | Token | List all emails |
| `GET` | `/email/:id` | Token | Get email with extraction |
| `DELETE` | `/email/:id` | Token | Delete email |
| `GET` | `/stats` | Token | Mailbox statistics |
| `GET` | `/health` | No | Health check |

### Authentication

```
Authorization: Bearer YOUR_TOKEN
```

## Self-Hosting

### Prerequisites

- Cloudflare account (free)
- Domain added to Cloudflare
- Node.js 18+, Wrangler CLI

### Step 1: Clone and Install

```bash
git clone https://github.com/user/clawdemail.git
cd clawdemail
npm install
```

### Step 2: Login to Cloudflare

```bash
npx wrangler login
```

### Step 3: Create D1 Database

```bash
npx wrangler d1 create clawdemail-db
```

### Step 4: Configure wrangler.toml

```toml
name = "clawdemail"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
DOMAIN = "yourdomain.com"
TOKEN_SECRET = "your-secret-here"  # openssl rand -hex 32

[[d1_databases]]
binding = "DB"
database_name = "clawdemail-db"
database_id = "YOUR_DATABASE_ID"

[triggers]
emails = ["*@yourdomain.com"]
```

### Step 5: Initialize Database

```bash
npx wrangler d1 execute clawdemail-db --remote --file=schema.sql
```

### Step 6: Deploy

```bash
npx wrangler deploy
```

### Step 7: Configure Email Routing

1. Cloudflare Dashboard → Your domain → Email → Email Routing
2. Enable Email Routing, add DNS records
3. Add catch-all rule → Send to Worker → clawdemail

### Step 8: (Optional) Custom API Domain

```toml
[[routes]]
pattern = "api.yourdomain.com/*"
zone_name = "yourdomain.com"
```

## Project Structure

```
src/
├── index.ts      # API router + email handler
├── auth.ts       # Token generation/verification
├── db.ts         # D1 operations
├── email.ts      # MIME parsing
├── extract.ts    # Code/link extraction
├── names.ts      # Name generator
├── static.ts     # Homepage content
└── types.ts      # TypeScript types
```

## License

MIT

---

# 中文

**专为 AI Agent 设计的只收邮件服务。** 一键创建邮箱，自动提取验证码和链接。

## 为什么需要 ClawdEmail？

AI Agent 需要邮箱来：
- 自主注册各类服务
- 接收验证码和魔法链接
- 订阅新闻简报并阅读
- 监控通知和告警

但是给 Agent 完整的邮箱权限风险太大。ClawdEmail **只能收邮件** — Agent 可以读取邮件但无法发送。零垃圾邮件风险，零冒充风险。

## 特性

- 🚀 **即时邮箱** — 一个 API 调用，无需注册表单
- 🔍 **自动提取** — 验证码（OTP、PIN）和操作链接
- 🤖 **Agent 优先** — 简洁的 REST API + Token 认证
- 🔒 **隐私优先** — 只收不发
- 💰 **免费** — 完全基于 Cloudflare 免费套餐

## 快速开始

让你的 AI Agent 执行：

```
阅读 https://clawdemail.com/skill.md 并创建一个 ClawdEmail 邮箱。
安全保存 token，并创建定时任务检查收件箱。
```

或者手动操作：

### 1. 注册邮箱

```bash
# 自动生成名称（如 swift-coral-42@clawdemail.com）
curl -X POST https://api.clawdemail.com/register

# 自定义名称
curl -X POST https://api.clawdemail.com/register \
  -H "Content-Type: application/json" \
  -d '{"name": "my-agent"}'
```

返回：
```json
{
  "email": "swift-coral-42@clawdemail.com",
  "token": "abc123...你的密钥"
}
```

**⚠️ 请保存好 token！只显示一次。**

### 2. 查看收件箱

```bash
curl https://api.clawdemail.com/inbox \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. 读取邮件（自动提取）

```bash
curl https://api.clawdemail.com/email/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

返回：
```json
{
  "id": 1,
  "from": "noreply@example.com",
  "subject": "您的验证码",
  "body": "您的验证码是 847291。",
  "code": "847291",
  "links": ["https://example.com/verify?token=xyz"]
}
```

## API 接口

基础 URL: `https://api.clawdemail.com`

| 方法 | 接口 | 认证 | 说明 |
|------|------|------|------|
| `POST` | `/register` | 无 | 创建邮箱 |
| `GET` | `/inbox` | Token | 查看收件箱 |
| `GET` | `/email/:id` | Token | 读取邮件 + 自动提取 |
| `DELETE` | `/email/:id` | Token | 删除邮件 |
| `GET` | `/stats` | Token | 邮箱统计 |
| `GET` | `/health` | 无 | 健康检查 |

### 认证方式

```
Authorization: Bearer YOUR_TOKEN
```

## 自托管部署

### 前置条件

- Cloudflare 账号（免费）
- 已添加到 Cloudflare 的域名
- Node.js 18+，Wrangler CLI

### 第 1 步：克隆并安装

```bash
git clone https://github.com/user/clawdemail.git
cd clawdemail
npm install
```

### 第 2 步：登录 Cloudflare

```bash
npx wrangler login
```

### 第 3 步：创建 D1 数据库

```bash
npx wrangler d1 create clawdemail-db
```

### 第 4 步：配置 wrangler.toml

```toml
name = "clawdemail"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
DOMAIN = "yourdomain.com"
TOKEN_SECRET = "你的密钥"  # openssl rand -hex 32

[[d1_databases]]
binding = "DB"
database_name = "clawdemail-db"
database_id = "你的数据库ID"

[triggers]
emails = ["*@yourdomain.com"]
```

### 第 5 步：初始化数据库

```bash
npx wrangler d1 execute clawdemail-db --remote --file=schema.sql
```

### 第 6 步：部署

```bash
npx wrangler deploy
```

### 第 7 步：配置邮件路由

1. Cloudflare 控制台 → 你的域名 → Email → Email Routing
2. 启用 Email Routing，添加 DNS 记录
3. 添加 catch-all 规则 → Send to Worker → clawdemail

### 第 8 步：（可选）自定义 API 域名

```toml
[[routes]]
pattern = "api.yourdomain.com/*"
zone_name = "yourdomain.com"
```

## 项目结构

```
src/
├── index.ts      # API 路由 + 邮件处理
├── auth.ts       # Token 生成/验证
├── db.ts         # D1 数据库操作
├── email.ts      # MIME 解析
├── extract.ts    # 验证码/链接提取
├── names.ts      # 名称生成器
├── static.ts     # 首页内容
└── types.ts      # TypeScript 类型
```

## 许可证

MIT

---

# 日本語

**AI エージェント向けの受信専用メールサービス。** ワンクリックでメールボックスを作成、認証コードとリンクを自動抽出。

## なぜ ClawdEmail？

AI エージェントがメールアドレスを必要とする場面：
- サービスへの自律的な登録
- 認証コードやマジックリンクの受信
- ニュースレターの購読と閲覧
- 通知やアラートの監視

しかし、エージェントに完全なメールアクセス権を与えるのはリスクが高い。ClawdEmail は**受信専用** — メールを読むことはできますが、送信はできません。スパムリスクゼロ、なりすましリスクゼロ。

## 特徴

- 🚀 **即時メールボックス** — API 1回で作成、登録フォーム不要
- 🔍 **自動抽出** — 認証コード（OTP、PIN）とアクションリンク
- 🤖 **エージェントファースト** — シンプルな REST API + トークン認証
- 🔒 **プライバシーファースト** — 受信のみ、送信機能なし
- 💰 **無料** — Cloudflare 無料枠で完全動作

## クイックスタート

AI エージェントに指示：

```
https://clawdemail.com/skill.md を読んで ClawdEmail メールボックスを作成してください。
トークンを安全に保存し、受信箱を定期的にチェックする cron ジョブを作成してください。
```

または手動で：

### 1. メールボックスを登録

```bash
# 自動生成名（例：swift-coral-42@clawdemail.com）
curl -X POST https://api.clawdemail.com/register

# カスタム名
curl -X POST https://api.clawdemail.com/register \
  -H "Content-Type: application/json" \
  -d '{"name": "my-agent"}'
```

レスポンス：
```json
{
  "email": "swift-coral-42@clawdemail.com",
  "token": "abc123...シークレットトークン"
}
```

**⚠️ トークンを保存してください！一度しか表示されません。**

### 2. 受信箱を確認

```bash
curl https://api.clawdemail.com/inbox \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. メールを読む（自動抽出付き）

```bash
curl https://api.clawdemail.com/email/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

レスポンス：
```json
{
  "id": 1,
  "from": "noreply@example.com",
  "subject": "認証コード",
  "body": "認証コードは 847291 です。",
  "code": "847291",
  "links": ["https://example.com/verify?token=xyz"]
}
```

## API リファレンス

ベース URL: `https://api.clawdemail.com`

| メソッド | エンドポイント | 認証 | 説明 |
|----------|----------------|------|------|
| `POST` | `/register` | 不要 | メールボックス作成 |
| `GET` | `/inbox` | Token | 受信箱一覧 |
| `GET` | `/email/:id` | Token | メール取得 + 自動抽出 |
| `DELETE` | `/email/:id` | Token | メール削除 |
| `GET` | `/stats` | Token | 統計情報 |
| `GET` | `/health` | 不要 | ヘルスチェック |

### 認証

```
Authorization: Bearer YOUR_TOKEN
```

## セルフホスティング

### 前提条件

- Cloudflare アカウント（無料）
- Cloudflare に追加済みのドメイン
- Node.js 18+、Wrangler CLI

### ステップ 1：クローンとインストール

```bash
git clone https://github.com/user/clawdemail.git
cd clawdemail
npm install
```

### ステップ 2：Cloudflare にログイン

```bash
npx wrangler login
```

### ステップ 3：D1 データベース作成

```bash
npx wrangler d1 create clawdemail-db
```

### ステップ 4：wrangler.toml を設定

```toml
name = "clawdemail"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
DOMAIN = "yourdomain.com"
TOKEN_SECRET = "シークレット"  # openssl rand -hex 32

[[d1_databases]]
binding = "DB"
database_name = "clawdemail-db"
database_id = "データベースID"

[triggers]
emails = ["*@yourdomain.com"]
```

### ステップ 5：データベース初期化

```bash
npx wrangler d1 execute clawdemail-db --remote --file=schema.sql
```

### ステップ 6：デプロイ

```bash
npx wrangler deploy
```

### ステップ 7：メールルーティング設定

1. Cloudflare ダッシュボード → ドメイン → Email → Email Routing
2. Email Routing を有効化、DNS レコード追加
3. catch-all ルール追加 → Send to Worker → clawdemail

### ステップ 8：（オプション）カスタム API ドメイン

```toml
[[routes]]
pattern = "api.yourdomain.com/*"
zone_name = "yourdomain.com"
```

## プロジェクト構成

```
src/
├── index.ts      # API ルーター + メールハンドラー
├── auth.ts       # トークン生成/検証
├── db.ts         # D1 データベース操作
├── email.ts      # MIME パース
├── extract.ts    # コード/リンク抽出
├── names.ts      # 名前ジェネレーター
├── static.ts     # ホームページコンテンツ
└── types.ts      # TypeScript 型定義
```

## ライセンス

MIT

---

