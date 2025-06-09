<<<<<<< HEAD

# 鬼ごっこシステム＆スクリプト一覧

- ゲームスタート:/scriptevent bgc:start

- 有権者は/tag @s add EditCでconfig編集

- 強制終了:/scriptevent bgc:end

- ハードコードにより、有権者には
- SCPzaidann 1958 (開発者、Delta_convetor)
- Reiya4384 (配信主、れいやさん) が強制的に追加されてます

- main.js … スクリプトファイル証明

## Game Systems
- (GameMaster.js) … ゲーム開始・終了・タグ管理・アイテム配布
- endGameSystem.js … 状態監視と勝敗判定（強制終了含む）
- reviveSystem.js … 捕まり後の20秒処理・復活or観戦
- speedEnevt.js … スタミナムイベント
- catchedEv.js … 金棒のシステム
- BanList.js … BanListに入っているプレイヤーは全員強制観戦

## Admin Systems
- adminControl.js … 高権限プレイヤーUI
- configUI.js … ゲーム設定UI（復活回数・鬼数など）

## Jail Systems
- jailSystem.js … 捕まったプレイヤーのテレポート・復活数記録

## Utilitys
- antiEscapeSystem.js … 境界越え・下限Y対策(broken)
  (このスクリプトのは需要が無くなってきているので、将来的に削除される可能性が高いです)

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


# 今後の予定

- 複数のスポーンシステム作成(1.21.90以降予定)
- 復活直後のプレイヤー保護(1.21.90以降予定)

- 1.21.90に伴いbeta-APIがbeta-2.1.0になるので、その場合
- source.isOpが使用できなくなり、スクリプトの一部が機能しなくなります
- 機能しなくなると予想されたスクリプト
- loadrc.js
- rootchestlib.js
- autoreloadrc.js
- rootchestkitUI.js
- これらはアプリが来てから修正に取り掛かります。

## 最後に

- Create by Delta_conveyor (only developer)

=======
# Delta_BE
testrepository
>>>>>>> 430ded9f57c0f28daf5567af67e64055c68bb104
