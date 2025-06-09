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

- これらのスクリプトを一人で作るの、マジで想像以上にきついですよ? ChatGPTを使っても全然きついですね。

- なぜか、各スクリプトの中身をデバッグするときに隅々まで覚えれてるわけがない

- おまけに、ChatGPTはフリープランなのでGPTのRAMがスクリプトの中身を保存しきれないのです。ChatGPTが忘れていそうな部分を再度探す必要も出てきます。

- なお、ChatGPTが忘れたところは完全に別のコード又は間違っているコードを飛ばしてくるのでこれも負担の原因です

- 発狂しそうなほどの負担の大一要因は、ChatGPTに全コードを書かせようとすると、GPTが忘れた部分のコードが高確率で間違っている又は使ってないコードになるので、手動で修正されたコードを注入したりしていかなければなりません

- 最大の負担は、エラーが出ることです。エラーが出るだけでモチベーションが削れ、気力が逝きます。エラーが出てせっかく作ったコードが易々と否定されるこの残酷さと悲惨さはアドオン作ってないとわからないでしょうね!エラーが出るだけで発狂できそうまである。まあやっとエラーを修正していく段階まで行けたと思ってる場合はその時はあまり気力は削れないですが、時間の問題です。最終的にゴリゴリ削れて逝きます。

- ストレス開放aaaaaaaaaaaaaaaaaaaaa(省略、省略したため未だに解放できず)

- もしこのアドオンが最初から使われなかったら泣く自信しかありません。どうか何回かは使ってほしいです。
=======
# Delta_BE
testrepository
>>>>>>> 430ded9f57c0f28daf5567af67e64055c68bb104
