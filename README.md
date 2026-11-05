# Hibi — 個人用勤怠管理

出勤した日だけを記録する打刻、1か月の全日付を見渡せる出勤カレンダー、出勤日数集計、CSV 出力を備えた静的 Web アプリです。データはブラウザの localStorage に保存されます。同じ端末・ブラウザで利用し、定期的に CSV を保存してください。共有データベース・従業員管理・ログイン機能はありません。

## 開発

Node.js 24、Python 3 が必要です。外部依存パッケージのインストールは不要です。

```sh
npm test
npm run build
npm start
```

開発サーバーのポートは 3000 です。成果物は `dist/` です。出勤は日本時間で1日1回記録します。退勤・休憩・勤務時間の管理はありません。以前の形式で保存された記録は出勤日として引き継ぎます。CSV も選択月の全日付と出勤状況を出力します。

## GitHub Pages

リポジトリの Settings → Pages → Source を **GitHub Actions** に設定し、ファイルを main に push してください。`.github/workflows/deploy.yml` がテスト・ビルド後に公開します。公開 URL は Actions の deployment 出力で確認できます。

他の静的サイトホスティングではビルドコマンドを `npm run build`、公開ディレクトリを `dist` に設定します。
