<<<<<<< HEAD

# 鬼ごっこシステム スクリプト一覧

- main.js … スクリプトファイル証明

## Game Systems
- (GameMaster.js) … ゲーム開始・終了・タグ管理・アイテム配布
- endGameSystem.js … 状態監視と勝敗判定（強制終了含む）
- reviveSystem.js … 捕まり後の20秒処理・復活or観戦
- speedEnevt.js … スタミナムイベント
- catchedEv.js … 金棒のシステム

## Admin Systems
- adminControl.js … 高権限プレイヤーUI
- configUI.js … ゲーム設定UI（復活回数・鬼数など）

## Jail Systems
- jailSystem.js … 捕まったプレイヤーのテレポート・復活数記録

## Utilitys
- antiEscapeSystem.js … 境界越え・下限Y対策

## User Systems
- setUsystemUI.js … スタミナム設定UIスクリプト

## rcuis

- rootchestkitUI.js … RootChestCreateKitから統合、rootchestを作成

- rootchestlib.js … RootChestCreateKitから統合、rootchestIDを管理

- (autoreloadrc.js) … RootChestCreateKitから統合、rootchestを定期的に再生成

- (loadrc.js) … RootChestCreateKitから統合、rootchestを生成できる

## special

- GameMaster.js
- autoreloadrc.js
- loadrc.js

- 説明: これらは互いにスクリプトをimportしあってるので別にくくりました


# 無使用スクリプト一覧

## temp_scripts
- script1.js … 使用する必要性が無くなったため未使用、main.jsからもunlist済み


# なんか書いとく

- ゲームスタートするにはコマンド/event entity @a[tag=player] bgc:start を入力

- 有権者は/tag @s add EditCでconfig編集

- 自分はよく9個もスクリプトを作ったな、、自分をほめときます。

- 今度からは共同開発じゃないとかなりきついです。
=======
# Delta_BE
testrepository
>>>>>>> 430ded9f57c0f28daf5567af67e64055c68bb104
