# TK Web Design ポートフォリオ

HP制作業務の受注用ポートフォリオサイト。静的HTML/CSS/JSのみで構成。

## 構成

```
portfolio/
├── index.html          # ポートフォリオトップ（実績・料金・依頼フロー・問い合わせ）
├── css/style.css
├── js/form.js          # 問い合わせデモフォーム（バリデーション＋完了表示。実送信なし）
├── demo/
│   └── login/          # ログイン画面デモ（実認証なし。auth.js/session.jsはpureロジック）
├── works/              # スキル提示用の架空クライアントLP
│   ├── gym-lp/         # パーソナルジム（ダーク×オレンジ / 訴求型）
│   ├── english-lp/     # 英語コーチング（白×ブルー / 信頼型）
│   └── nail-lp/        # ネイルサロン（生成り×ローズベージュ / 上質型）
├── tests/              # 単体テスト（node --test）+ E2E（Playwright）
├── package.json        # テスト実行用（サイト自体はビルド不要のまま）
└── playwright.config.js
```

- 各LPの `images/` はUnsplashのフリー素材（出典は各 `images/SOURCES.md`）
- トップの実績サムネイル（`images/works/`）はLPのスクリーンショットから生成

各LPは実案件と同じ流れ（ターゲット設定 → 訴求設計 → デザイン → コーディング）で制作し、
トップページに制作意図を明記している。架空サイトである旨は各LPに表示済み。

## ローカルで確認

`portfolio/index.html` をブラウザで開くだけ。ビルド不要。

ただし `demo/login/` は ES モジュールを使うため file:// では動かない。HTTP配信で確認する：

```bash
npm install        # 初回のみ
npm run serve      # http://localhost:5173/demo/login/
```

## テスト

```bash
npm test           # 単体テスト（node --test、認証・バリデーション・状態遷移ロジック）
npm run test:e2e   # E2E（Playwright。初回は npx playwright install chromium が必要）
```

## GitHub Pages で公開する手順

ポートフォリオ専用のリポジトリに切り出して公開する：

```bash
# 1. 新しいリポジトリを作成（公開リポジトリ）
gh repo create portfolio --public

# 2. portfolio/ の中身を新リポジトリにコピーして push
#    （index.html がリポジトリ直下に来るようにする）

# 3. GitHub Pages を有効化
gh api repos/<ユーザー名>/portfolio/pages -X POST \
  -f "source[branch]=main" -f "source[path]=/"
```

公開URL: `https://<ユーザー名>.github.io/portfolio/`

独自ドメインを使う場合はリポジトリの Settings → Pages → Custom domain で設定。

コピーして公開するのは HTML/CSS/JS のみ。`tests/`・`package.json`・`playwright.config.js`・`node_modules/` は開発用なので公開リポジトリに含めない。

## 今後の拡張候補

- [ ] OGP画像の設定（SNSシェア時の見栄え）
- [x] 問い合わせフォーム → **デモフォーム**として設置（実送信なし・注釈明示、実連絡経路はmailto。用語はリポジトリ直下の CONTEXT.md 参照）
- [ ] デモフォームの実送信化（受注が増えたらFormspree等を接続。form の action 追加とJS差し替えのみ）
- [ ] 実案件を獲得したら架空LPと差し替え
- [x] 各LPのスクリーンショットをサムネイルに使用（`images/works/`、ヘッドレスChromeで生成）
- [x] ジムLP・英語コーチングLPへの写真導入（各LPの `images/SOURCES.md` に出典）
- [x] ログイン画面デモ（`demo/login/`。バリデーション・総称認証エラー・画面遷移。単体+E2Eテスト付き）
