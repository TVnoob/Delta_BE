// scripts/systems/adminControl.js
import { world, system } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { getGods, ADMIN_LIST_KEY, JAIL_POS_KEY, REVIVE_LIMIT_KEY, getAdminList } from "../consts.js";

export function systemscript1() {
  world.beforeEvents.itemUse.subscribe((event) => {
    const { source, itemStack } = event;
    const id = itemStack?.typeId ?? "なし";
    const name = source?.name ?? "不明";
    console.warn(`[DEBUG] ${name} が使用: ${id}`);

    if (id !== "additem:verified_admin") return;

    system.run(() => {
      const isAdmin = getAdminList().includes(name);
      if (!isAdmin) {
        source.sendMessage("§c⛔ あなたには管理者権限がありません。");
        return;
      }

      if (source.isSneaking) {
        showJailSetupUI(source);
      } else {
        showAdminManagementUI(source);
      }
    });
  });

  function showAdminManagementUI(player) {
    const admins = getAdminList();
    const options = admins.length > 0 ? admins : ["(管理者なし)"];

    const form = new ModalFormData()
      .title("Verified Admin 管理")
      .textField("追加するユーザー名（空白で無視）", "例: Steve")
      .textField("削除するユーザー名（空白で無視）", "例: Alex")
      .dropdown("現在の管理者リスト", options, { defaultValueIndex: 0 });

    form.show(player).then((r) => {
      if (r.canceled) return;

      const toAdd = typeof r.formValues[0] === "string" ? r.formValues[0].trim() : "";
      const toRemove = typeof r.formValues[1] === "string" ? r.formValues[1].trim() : "";

      const current = new Set(getAdminList());
      const GODS = getGods();
      if (toAdd) current.add(toAdd);
      if (toRemove && !GODS.includes(toRemove)) current.delete(toRemove);

      const finalList = Array.from(current);
      world.setDynamicProperty(ADMIN_LIST_KEY, JSON.stringify(finalList));
      player.sendMessage("§a✅ 管理者リストを更新しました。");
    }).catch(err => {
      console.warn(`⚠️ UI表示エラー: ${err}`);
      player.sendMessage("§c⛔ 管理者UIの表示に失敗しました。");
    });
  }
}

export function showJailSetupUI(player) {
    const form = new ModalFormData()
      .title("牢屋座標設定")
      .toggle("jailという名前が付いた防具立ての座標に牢屋を登録")
      .toggle("jail位置の登録を全てリセット")
      .textField("復活できる回数", "例: 3", { defaultValue: "3" });


  form.show(player).then(res => {
    if (res.canceled) return;

    const [setJail, doReset, reviveLimitInput] = res.formValues;

    // 🔧 JAIL_POS_KEY の読み込みと初期化
    let jailPoints = [];
    try {
      const raw = world.getDynamicProperty(JAIL_POS_KEY) ?? "[]";
      jailPoints = JSON.parse(raw);
      if (!Array.isArray(jailPoints)) jailPoints = [];
    } catch {
      jailPoints = [];
    }

    if (setJail) {
      player.runCommand("scriptevent jailselect");
      player.sendMessage("§a✅ 牢屋を登録しました");
    }
    if (doReset) {
      player.runCommand("scriptevent jailreset");
      player.sendMessage("§c✅ 牢屋をリセットしました");
    }

      const reviveCount = parseInt(reviveLimitInput);
      if (!isNaN(reviveCount) && reviveCount >= 0) {
        world.setDynamicProperty(REVIVE_LIMIT_KEY, reviveCount);
        player.sendMessage(`§a✅ 復活できる回数を ${reviveCount} 回に設定しました。`);
      } else {
        player.sendMessage("§c⛔ 無効な復活回数が入力されました。");
      }

      world.setDynamicProperty(JAIL_POS_KEY, JSON.stringify(jailPoints));
    }).catch(err => {
      console.warn("⚠️ 牢屋UIエラー:", err);
      player.sendMessage("§c⛔ 牢屋座標の設定に失敗しました。");
    });
}
