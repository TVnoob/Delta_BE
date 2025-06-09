// scripts/systems/setUsystemUI.js
import { world, system, EquipmentSlot } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

const OPTIONS = ["speed(high)", "speed(low)", "resist"];
const ADMIN_LIST_KEY = "verified_admins";
const CREATORS = ["SCPzaidann 1958","Reiya4384"];

export function systemscript3() {
  world.beforeEvents.itemUse.subscribe((event) => {
    const { source, itemStack } = event;
    const id = itemStack?.typeId?.toLowerCase() ?? "なし";
    if (id !== "additem:setusystem") return;

    const isAdmin = isAdminWithOffhand(source);
    system.run(() => {
      if (isAdmin) {
        showAdminCommandEditor(source);
      } else {
        showUserEffectSelector(source);
      }
    });
  });

  function showUserEffectSelector(player) {
  const form = new ModalFormData()
    .title("効果を選択")
    .dropdown("通常時の効果を選んでください", OPTIONS, { defaultValueIndex: 0 })
    .dropdown("スニーク時の効果を選んでください", OPTIONS, { defaultValueIndex: 1 });

  form.show(player).then(res => {
    if (res.canceled) return;

    const normalIndex = res.formValues[0];
    const crouchIndex = res.formValues[1];
    const normalEffect = OPTIONS[normalIndex];
    const crouchEffect = OPTIONS[crouchIndex];

    if (normalEffect === crouchEffect) {
      player.sendMessage("§c⛔ 選択肢が重複していたので適応されませんでした。");
      return;
    }

    player.setDynamicProperty("custom_speed_mode", normalEffect);
    player.setDynamicProperty("custom_crouch_mode", crouchEffect);

    player.sendMessage(`§a✅ 通常時: "${normalEffect}"、しゃがみ時: "${crouchEffect}" に設定しました。`);
  }).catch(e => {
    console.warn(`⚠️ UIエラー: ${e}`);
  });
}


  function showAdminCommandEditor(player) {
    const form = new ModalFormData()
      .title("効果コマンド設定 (管理者)")
      .dropdown("編集対象の効果を選択", OPTIONS, { defaultValueIndex: 0 })
      .textField("実行するコマンド（@s 使用可）", "例: effect @s speed 2 20");

    form.show(player).then(res => {
      if (res.canceled) return;
      const index = res.formValues[0];
      const effectName = OPTIONS[index];
      const command = (res.formValues[1] ?? "").trim();

      if (!command) {
        player.sendMessage("§c⛔ コマンドが空白です。");
        return;
      }

      const raw = world.getDynamicProperty("custom_effect_map") ?? "{}";
      const parsed = JSON.parse(raw);
      parsed[effectName] = command;

      world.setDynamicProperty("custom_effect_map", JSON.stringify(parsed));
      player.sendMessage(`§a✅ "${effectName}" のコマンドを更新しました。`);
    }).catch(e => {
      console.warn(`⚠️ 管理者UIエラー: ${e}`);
    });
  }

  function isAdminWithOffhand(player) {
    const admins = getAdminList();
    const offhand = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Offhand);
    return admins.includes(player.name) && offhand?.typeId === "additem:verified_admin";
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
}
