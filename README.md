<<<<<<< HEAD

# プロジェクト状態
- Dev-V1.4.2(support to minecraft 1.21.90)

## 仕様変更又は追加
### V1.4には以下の仕様を追加
- セットアップが完了できてない場合はゲームスタートを停止
# git commands

## 安定板をアップデート
- git checkout main
- git merge dev

## 開発続行
- git checkout dev

# Hardcodes

## lists
- [adminlist] → ハードコード:getGods(); (動的)
- [banlist] → ハードコード:TERRORIST

## BanList(強制登録済み)

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
## Developers
- Create by Delta_conveyor (The only developer)

=======
# Delta_BE
myaddon_a_repository
>>>>>>> 430ded9f57c0f28daf5567af67e64055c68bb104
