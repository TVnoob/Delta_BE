// scripts/systems/JailramdomTP.js
import { world, system } from "@minecraft/server";
import { JAIL_POS_KEY } from "../consts.js";

const JAILTAG = "jail";
const JAIL_STAND_TAG = "xyzjail";

let jailPoints = [];

// 起動時に保存データを復元
(function loadSaved() {
  try {
    const raw = world.getDynamicProperty(JAIL_POS_KEY) ?? "[]";
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) jailPoints = arr;
  } catch {}
})();

// scripteventで防具立て登録・リセットを受け付ける
system.afterEvents.scriptEventReceive.subscribe(ev => {
  if (ev.id === "jailselect") {
    const stands = world.getDimension("overworld")
      .getEntities({ type: "minecraft:armor_stand" });
    let cnt = 0;
    for (const e of stands) {
      if (e.nameTag === JAIL_STAND_TAG) {
        const p = { x: e.location.x, y: e.location.y, z: e.location.z };
        jailPoints.push(p);
        e.kill();
        cnt++;
      }
    }
    world.setDynamicProperty(JAIL_POS_KEY, JSON.stringify(jailPoints));
    console.warn(`[JailTP] 登録 ${cnt} 箇所、合計 ${jailPoints.length} 箇所`);
  }
  else if (ev.id === "jailreset") {
    jailPoints = [];
    world.setDynamicProperty(JAIL_POS_KEY, JSON.stringify(jailPoints));
    console.warn("[JailTP] 登録ポイントをリセットしました");
  }
});

// ✅ 関数：指定プレイヤーをランダムな牢屋座標へTP
export function randomTeleportToJail(player) {
  if (!player || jailPoints.length === 0) {
    console.warn("[JailTP] ⚠️ TP先未登録またはプレイヤーが無効です");
    return;
  }
  const target = jailPoints[Math.floor(Math.random() * jailPoints.length)];
  player.teleport(target);
  console.warn(`[JailTP] ${player.name} を牢屋TP: (${target.x}, ${target.y}, ${target.z})`);
}

