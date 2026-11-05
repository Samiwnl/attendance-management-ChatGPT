# Hibi — 個人用勤怠管理

出勤・退勤・休憩の打刻、日本時間での月別勤務履歴、実働集計、CSV 出力を備えた静的 Web アプリです。データはブラウザの localStorage に保存されます。同じ端末・ブラウザで利用し、定期的に CSV を保存してください。共有データベース・従業員管理・ログイン機能はありません。

## 開発

Node.js 24、Python 3 が必要です。外部依存パッケージのインストールは不要です。

```sh
npm test
npm run build
npm start
```

開発サーバーのポートは 3000 です。成果物は `dist/` です。1日1勤務に対応し、休憩は複数回記録できます。日を跨ぐ勤務は出勤日の記録として集計します。

## GitHub Pages

リポジトリの Settings → Pages → Source を **GitHub Actions** に設定し、ファイルを main に push してください。`.github/workflows/deploy.yml` がテスト・ビルド後に公開します。公開 URL は Actions の deployment 出力で確認できます。

他の静的サイトホスティングではビルドコマンドを `npm run build`、公開ディレクトリを `dist` に設定します。
