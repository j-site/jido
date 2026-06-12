# Jido（ジドー）

建設業の事務を、自動に。— 建設業向け業務SaaS

見積書・請求書・領収書・案内状・日報・写真管理・AIチャットをブラウザだけで。
月額 ¥1,200（Stripeサブスクリプション）。

## 構成

- **フロントエンド**: React 18 + Vite + React Router（SPA）
- **API**: Vercel Functions
  - `api/create-checkout.js` — Stripe Checkoutセッション作成（月額¥1,200サブスク）
  - `api/webhook.js` — Stripe Webhook受信（署名検証あり）
  - `api/chat.js` — AIチャット（Claude APIプロキシ）
- **データ**: 書類・日報はlocalStorage、写真はIndexedDB（端末内保存）

## デプロイ手順（Vercel）

1. このリポジトリをVercelにImport（Framework: Vite が自動検出される）
2. 環境変数を設定:

| 変数名 | 値 |
|---|---|
| `STRIPE_SECRET_KEY` | Stripeのシークレットキー（sk_live_...） |
| `VITE_STRIPE_PUBLIC_KEY` | Stripeの公開キー（pk_live_...） |
| `STRIPE_WEBHOOK_SECRET` | Webhook設定後に取得（whsec_...） |
| `ANTHROPIC_API_KEY` | （任意）AIチャット用。未設定でも他機能は動作 |

3. Deploy

## Stripe Webhook設定

1. [Stripeダッシュボード → 開発者 → Webhook](https://dashboard.stripe.com/webhooks) で「エンドポイントを追加」
2. URL: `https://<デプロイURL>/api/webhook`
3. イベント: `checkout.session.completed` / `invoice.payment_failed` / `customer.subscription.deleted`
4. 作成後に表示される **署名シークレット（whsec_...）** をVercelの `STRIPE_WEBHOOK_SECRET` に設定して再デプロイ

## ローカル開発

```bash
npm install
npm run dev        # フロントのみ（APIはVercel環境が必要）
npx vercel dev     # API込みで動かす場合
```
