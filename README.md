# ふたりのタスク

夫婦2人で家事・用事・計画を共有するスマホ向けWebアプリ（PWA）。

- Vite + React + TypeScript + vite-plugin-pwa
- データは Supabase（Postgres + Realtime）。合言葉＝2人で共有する1つのアカウントのパスワード
- `src/config.ts` が空のあいだは「お試しモード」（端末の localStorage のみ、共有されない）
- GitHub Pages に公開（main に push すると GitHub Actions がビルド）

## Supabase の準備（最初に1回）

1. https://supabase.com で無料プロジェクトを作る（Region は Tokyo）
2. **SQL Editor** を開き、`supabase/setup.sql` の中身を貼り付けて **Run**
3. **Authentication → Sign In / Providers** で **Allow new users to sign up をオフ**にする
   （オンのままだと、合言葉を知らない人でもアカウントを作って中を見られてしまう）
4. **Authentication → Users → Add user → Create new user**
   - Email：共有用のアドレス（実在しなくてよい。例 `futari@example.com`）
   - Password：2人で決めた合言葉
   - **Auto Confirm User** にチェック
5. **Project Settings → API Keys** で次の2つをコピー
   - Project URL（`https://xxxx.supabase.co`）
   - Publishable key（`sb_publishable_...`。古いプロジェクトなら anon key）
6. `src/config.ts` に URL・キー・手順4のメールアドレスを書いて push

無料プランは1週間アクセスがないと一時停止する。止まったら Supabase の画面から再開できる（データは消えない）。

## 開発

```
npm install
npm run dev
npm run build
```
