<<<<<<< HEAD

# 注意!!!

- クリエイター機能項目を全部ONにしてください。

- Realms非対応

- 入り直したプレイヤーは強制的に試合から除外されます

# 鬼ごっこシステム

- ゲームスタート:/scriptevent bgc:start

- 有権者は/tag @s add EditCでconfig編集

- 強制終了:/scriptevent bgc:end

- BanListUIを開く:/tag @s add OBL(現在稼働不可)

- ハードコードにより、有権者には
- SCPzaidann 1958 (開発者、Delta_convetor)
- Reiya4384 (配信主、れいやさん) が強制的に追加されてます

- スタミナムはしゃがまずに使用した時と、しゃがんで使用した時で効果を使い分けれます。

- 逃げるプレイヤーは金棒で殴られた後即復活しますが、透明化と速度を付与して保護しています

- 鬼は20秒間ロビーで待機してから解放されます。

- 鬼は金棒を持っていると移動が少々上昇します。

## 鬼ごっこのセットアップ

- [!WARNING>高権限アイテム<] を持ち、しゃがんで使用し牢屋位置(逃げるプレイヤーがtpするところ)を設定してください。
- (本来、その牢屋の位置は本当に牢屋の予定だったのですが、現在単に逃げるプレイヤーがtpする位置となっています)
- [!WARNING>高権限アイテム<]を左手に持ち、右手でスタミナム設定を開くと各スタミナムの効果を設定できます
- ロビー位置や鬼がスポーンする位置などはConfigUIから設定できます。
- (broken!)となってる部分は壊れてるので触らないようにおねがいします。
- ルートチェスト(ランダムでアイテムを生成するチェスト)も作成できます。
- xyzfullという名前を防具立てに付け、/scrpitevent xyz:selectを実行すれば、xyzfullという名前の防具立ての位置がランダムTP先の一部になる
- もしこの座標をリセットしたいときは/scrpitevent xyz:resetを実行
- (プレイヤーはまず、jail1にTPされ、その後jail1の座標と一致したプレイヤーがランダムTPされる仕様です)

- ルートチェスト作成キット: 簡単にルートチェストを作れます
- ルートチェストステータス: ルートチェストを管理
- ルートチェストローダー: ルートチェストを生成＆自動再生成の設定も可能

- これでもまだわからないことがあったらデルタコンベアーに聞いてください。

# スクリプト一覧

- main.js … スクリプトファイル証明

## Game Systems
- (GameMaster.js) … ゲーム開始・終了・タグ管理・アイテム配布
- endGameSystem.js … 状態監視と勝敗判定（強制終了含む）
- reviveSystem.js … 捕まり後の20秒処理・復活or観戦
- speedEnevt.js … スタミナムイベント
- catchedEv.js … 金棒のシステム
- BanList.js … BanListに入っているプレイヤーは全員強制観戦
- RandomTP.js … ランダムTPシステム

## Admin Systems
- adminControl.js … 高権限プレイヤーUI
- configUI.js … ゲーム設定UI（復活回数・鬼数など）
- permissionGuard.js … 高権限所持プレイヤー関連システム

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

- 1.21.90に伴いbeta-APIがbeta-2.1.0になるので、その場合
- source.isOpが使用できなくなり、スクリプトの一部が機能しなくなります
- 機能しなくなると予想されたスクリプト
- loadrc.js
- rootchestlib.js
- autoreloadrc.js
- rootchestkitUI.js
- これらはアプリが来てから修正に取り掛かります。

## 更新ログ

- V1.1 ユーザー補助機能追加

- V1.0 コアシステム完成

## 最後に

- Create by Delta_conveyor (only developer)

=======
# Delta_BE
testrepository
>>>>>>> 430ded9f57c0f28daf5567af67e64055c68bb104
