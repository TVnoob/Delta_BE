// scripts/susyems/AdminSystem/configUI.js
import { world, system } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

const CONFIG_KEY = "config_data";
const ADMIN_LIST_KEY = "admin_list";
const CREATORS = ["SCPzaidann 1958","Reiya4384"];

// 管理者が使用する設定UI
export function configUIHandler() {
  system.runInterval(() => {
    for (const player of world.getPlayers()) {
      if (!player.getTags().includes("EditC")) continue;

      const adminList = getAdminList();
      if (!adminList.includes(player.name)) {
        player.removeTag("EditC");
        player.sendMessage("§c⛔ あなたにはこの設定UIを開く権限がありません。");
        continue;
      }

      player.removeTag("EditC");
      showConfigUI(player);
    }
  }, 20); // 毎秒チェック
}

function showConfigUI(player) {
  const raw = world.getDynamicProperty(CONFIG_KEY);
  let config = {};
  try {
    config = JSON.parse(raw ?? "{}");
  } catch {}

  const form = new ModalFormData()
    .title("ゲーム設定 - Config UI")
    .textField("鬼の人数（数字）", "例: 1", { defaultValue: String(config.oniCount ?? 1) })
    .textField("行けるY座標の下限", "例: 0", { defaultValue: String(config.minYLimit ?? 0)})
    .toggle("Developモードを有効化(broken!)")
    .toggle("次回ゲームでボーダースキャンを実行(broken!)")
    .toggle("強制終了をONにする（broken!）", {defaultValue: true})
    .textField("制限時間（秒）", "例: 300", { defaultValue: String(config.timeLimitSec ?? 300)})
    .dropdown("鬼スポーン位置をここに設定", ["実行しない", "ここに設定"], { defaultValueIndex: 0 })
    .dropdown("ロビー地点をここに設定", ["実行しない", "ここに設定"], { defaultValueIndex: 0 });
    


  form.show(player).then(response => {
    if (response.canceled) return;

  const [oniCountText, minYLimitText, developToggle, borderScanToggle, forceToggle, timeLimitText, oniSet, lobbySet] = response.formValues;
  
  const timeLimit = parseInt(timeLimitText);
  if (!isNaN(timeLimit)) config.timeLimitSec = timeLimit;

  // 鬼の人数
  if (typeof oniCountText === "string") {
    const parsed = parseInt(oniCountText);
    if (!isNaN(parsed)) config.oniCount = parsed;
  }

  // Y座標下限
  if (typeof minYLimitText === "string") {
    const parsed = parseInt(minYLimitText);
    if (!isNaN(parsed)) config.minYLimit = parsed;
  }

  // トグルオプション
  if (developToggle === true) config.developMode = true;
  if (borderScanToggle === true) config.borderScan = true;
  if (forceToggle === true) config.forceEnd = true;


  // 現在位置を取得（必要なら設定）
  const pos = {
    x: Math.floor(player.location.x),
    y: Math.floor(player.location.y),
    z: Math.floor(player.location.z)
  };

  // ドロップダウンによる位置設定
  if (oniSet === 1) {
    config.oniSpawn = pos;
    player.sendMessage("§a✅ 鬼スポーン座標を現在地に設定しました。");
  }
  if (lobbySet === 1) {
    config.lobby = pos;
    player.sendMessage("§a✅ ロビー座標を現在地に設定しました。");
  }

  // 保存と通知
  world.setDynamicProperty(CONFIG_KEY, JSON.stringify(config));
  player.sendMessage("§a✅ 設定を保存しました。");
  }).catch(err => {
    console.warn(`[ConfigUI] フォームエラー: ${err}`);
    player.sendMessage("§c⚠️ UIの表示に失敗しました。");
  });
}

function getAdminList() {
  try {
    const raw = world.getDynamicProperty(ADMIN_LIST_KEY);
    const parsed = JSON.parse(raw ?? "[]");
    for (const name of CREATORS) {
    if (!parsed.includes(name)) parsed.push(name);
    }
    return parsed;
  } catch {
    return [CREATOR];
  }
}
