// scripts/systems/special/BanList.js
import { world, system } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

const BANLIST_KEY = "ban_list";
const CREATORS = ["SCPzaidann 1958", "Reiya4384"]; // 保護アカウント
const TERRORIST = ["おこそ"];

export function banListSystem() {
  system.runInterval(() => {
    for (const player of world.getPlayers()) {
      if (!player.hasTag("OBL")) continue;
      if (!CREATORS.includes(player.name)) {
        player.sendMessage("§c⛔ BanList UIを開く権限がありません。");
        player.removeTag("OBL");
        continue;
      }

      player.removeTag("OBL");
      showBanListUI(player);
    }
  }, 20); // 1秒おきにチェック
}

function getBanList() {
  try {
    const raw = world.getDynamicProperty(BANLIST_KEY);
    const arr = JSON.parse(raw ?? "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function showBanListUI(player) {
  const banArr = getBanList();
  const options = banArr.length > 0 ? banArr : ["(現在のBanListに乗っているプレイヤー名一覧)"];

  const form = new ModalFormData()
    .title("BanList 管理")
    .textField("追加するプレイヤー名（空欄で無視）", "例: Steve")
    .textField("削除するプレイヤー名（空欄で無視）", "例: Alex")
    .dropdown("現在のBanListに登録済みの名前一覧", options, { defaultValueIndex: 0 });

  form.show(player).then(res => {
    if (res.canceled) return;

    const toAdd = typeof res.formValues[0] === "string" ? res.formValues[0].trim() : "";
    const toRemove = typeof res.formValues[1] === "string" ? res.formValues[1].trim() : "";
    const dropdownSel = res.formValues[2]; // 今回は使用しない

    const banSet = new Set(getBanList());

    // 追加制限
    if (toAdd && !CREATORS.includes(toAdd) && toAdd !== "TERRORIST") {
      banSet.add(toAdd);
    } else if (CREATORS.includes(toAdd) || toAdd === "TERRORIST") {
      player.sendMessage("§cこの行動は許可されてません");
    }

    // 削除制限
    if (toRemove && !CREATORS.includes(toRemove) && toRemove !== "TERRORIST") {
      banSet.delete(toRemove);
    } else if (CREATORS.includes(toRemove) || toRemove === "TERRORIST") {
      player.sendMessage("§cこの行動は許可されてません");
    }

    const newList = Array.from(banSet);
    world.setDynamicProperty(BANLIST_KEY, JSON.stringify(newList));
    player.sendMessage(`§a✅ BanListを更新しました。現在の登録数: ${newList.length} 名`);
  }).catch(err => {
    console.warn(`⚠️ BanList UI 表示失敗: ${err}`);
    player.sendMessage("§c⛔ BanList UIの表示に失敗しました。");
  });
}
