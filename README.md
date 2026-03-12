# javascript

業務用フロントエンド補助スクリプト集。

## 主なファイル

- `maintenanceSchedule.js` : メンテナンス予定管理系
- `list.js` : 一覧表示系
- `formsave.js` / `webform.js` : フォーム保存・補助
- `mail_assist*.js` : メール補助（PC/モバイル）
- `noticeTomanagers*.js` : 管理者通知
- `heic_conv.js` : 画像変換補助
- `mqtt_test.js` : MQTTテスト

## 現在の状態

- 単一ファイル運用（npmプロジェクト化は未実施）
- `_old` / `_temp` 系ファイルが混在

## 次の整理方針（推奨）

1. `legacy/` に `_old` / `_temp` を移動
2. 役割別に `forms/`, `mail/`, `notice/`, `schedule/` へ整理
3. 実運用ファイルの命名統一（例: `create_terst.js` -> `create_test.js`）


## legacy について

- 旧版/一時版は `legacy/` に移動しました。
- 当面は互換スタブを残しています（段階的に参照更新予定）。
