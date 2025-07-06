<<<<<<< HEAD

# release V1.4.2 !
### [リソースパック](https://github.com/TVnoob/Delta_RE)

# 注意!!!

- クリエイター機能項目を全部ONにしてください。

- Realms非対応

- 入り直したプレイヤーは強制的に試合から除外されます

# 鬼ごっこシステム

- ゲームスタート:/scriptevent bgc:start

- ワールドオーナーは/tag @s add EditCでconfig編集

- 強制終了:/scriptevent bgc:end

- banlist変更:/tag @s add OBL

- スタミナムはしゃがまずに使用した時と、しゃがんで使用した時で効果を使い分けれます。

- 逃げるプレイヤーは金棒で殴られた後即復活しますが、透明化と速度を付与して保護しています

- 鬼は20秒間ロビーで待機してから解放されます。

- 鬼は金棒を持っていると移動が少々上昇します。

- 捕まったプレイヤーは牢屋に20秒間束縛されます。
- 全プレイヤーが牢屋に居る又は全プレイヤーが復活不可になった場合、鬼が勝ちます

- banlistに追加されたプレイヤーは試合を観戦できます

- 鬼は全身にネザライト装備を纏っています

- 自動復活と手動復活をそれぞれ用意!

## 鬼ごっこのセットアップ

- [!WARNING>高権限アイテム<] を持ち、しゃがんで使用し牢屋位置(逃げるプレイヤーがtpするところ)を設定してください。
- (本来、その牢屋の位置は本当に牢屋の予定だったのですが、現在単に逃げるプレイヤーがtpする位置となっています)
- [!WARNING>高権限アイテム<]を左手に持ち、右手でスタミナム設定を開くと各スタミナムの効果を設定できます
- ロビー位置や鬼がスポーンする位置などはConfigUIから設定できます。
- (broken!)となってる部分は壊れてるので触らないようにおねがいします。
- ルートチェスト(ランダムでアイテムを生成するチェスト)も作成できます。
- xyzfullという名前を防具立てに付け、adminUIで操作をすれば、xyzfullという名前の防具立ての位置がランダムTP先の一部になる
- もしこの座標をリセットしたいときは/scrpitevent xyz:resetを実行
- jailという名前を防具立てに付け、adminUIで操作をすれば、jailという名前の防具立ての位置が牢屋のランダムTP先の一部になる
- jail座標をリセットしたいときは/scrpitevent jail:reset
### 以下の3つの機能は旧式の機能です。こちらを試してください [BEパック](https://github.com/TVnoob/A.R.C.A) [REパック](https://github.com/TVnoob/A.R.C.A-RE)
- ルートチェスト作成キット: 簡単にルートチェストを作れます
- ルートチェストステータス: ルートチェストを管理
- ルートチェストローダー: ルートチェストを生成＆自動再生成の設定も可能

## BanList(強制登録済み)
- 現在はなし

# スクリプト一覧
- main.js … スクリプトファイル証明
- consts.js … const宣言コードを集合させたconfigファイル

## Game Systems
- JailrandomTP.js … 牢屋に飛ぶところをランダムTPに
- PlayerSpawn.js … GameMaster.jsにあるコードの一部を移動させた
- GameMaster.js … ゲーム開始・終了・タグ管理・アイテム配布
- endGameSystem.js … 状態監視と勝敗判定（強制終了含む）
- reviveSystem.js … 捕まり後の20秒処理・復活or観戦
- speedEnevt.js … スタミナムイベント
- catchedEv.js … 金棒のシステム
- BanList.js … BanListに入っているプレイヤーは全員強制観戦[adminlist,banlist]
- RandomTP.js … ランダムTPシステム
- startcountdownonlysystem.js … reviveSystem.jsの機能の一部を隔離させた

## Admin Systems
- adminControl.js … 高権限プレイヤーUI[adminlist]
- configUI.js … ゲーム設定UI(復活回数・鬼数など)[adminlist]
- permissionGuard.js … 高権限所持プレイヤー関連システム[adminlist]

## Jail Systems
- jailSystem.js … 捕まったプレイヤーのテレポート・復活数記録

## Utilitys
- antiEscapeSystem.js … 境界越え・下限Y対策(broken)
  (未使用、いつか削除しときます)

## User Systems
- setUsystemUI.js … スタミナム設定UIスクリプト[adminlist]

## rcuis

- rootchestkitUI.js … RootChestCreateKitから統合、rootchestを作成[ops]

- rootchestlib.js … RootChestCreateKitから統合、rootchestIDを管理[ops]

- autoreloadrc.js … RootChestCreateKitから統合、rootchestを定期的に再生成[ops]

- loadrc.js … RootChestCreateKitから統合、rootchestを生成できる[ops]

## temp_scripts
- script1.js … 金棒の加速スクリプト


# 今後の予定
- 未定
## 更新ログ

- alpha V0.0.1 配布版

- V1.4.2 1.21.90に対応

- V1.4.1(alpha) システム改良

- V1.4(alpha) 鬼ごっこの全体改良

- V1.3.1 鬼の明確化と鬼のTP修正

- V1.3 banlistを追加

- V1.2 牢屋の機能を復元

- V1.1 ユーザー補助機能追加

- V1.0 コアシステム完成

## 最後に

- このアドオンはまだ潜在的なバグが残っている可能性があります

- Create by Delta_conveyor (The only developer)

=======
# Delta_BE
myaddon_a_repository
>>>>>>> 430ded9f57c0f28daf5567af67e64055c68bb104
