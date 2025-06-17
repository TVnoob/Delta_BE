// scripts/systems/JailramdomTP.js
import { world, system } from "@minecraft/server";
import { JAIL_POS_KEY } from "../consts.js";

const JAIL_STAND_TAG = "jail";

let jailPoints = [];

// scripteventで防具立て登録・リセットを受け付ける
export function JailramdomTPsettingcodes(){
  system.afterEvents.scriptEventReceive.subscribe(ev => {
    if (ev.id === "jail:select") {
    const dimm = world.getDimension("overworld");
    const stands = dimm.getEntities({ type: "minecraft:armor_stand" });
      let cnt = 0;
      for (const e of stands) {
        if (e.nameTag === JAIL_STAND_TAG) {
          jailPoints.push({ x: e.location.x, y: e.location.y, z: e.location.z });
          e.kill();
          cnt++;
        }
      }
      if (cnt > 0) {
        world.setDynamicProperty(JAIL_POS_KEY, JSON.stringify(jailPoints));
        console.warn(`[RandomTP] ✅ ${cnt} 箇所を追加登録しました。合計: ${jailPoints.length}`);
      } else {
        console.warn("[RandomTP] ❌ xyzfull の防具立てが見つかりませんでした。");
      }
    }
    else if (ev.id === "jail:reset") {
      jailPoints = [];
      world.setDynamicProperty(JAIL_POS_KEY, JSON.stringify(jailPoints));
      console.warn("[JailTP] 登録ポイントをリセットしました");
    }
  });
}

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

export function getJailTPList() {
  try {
    const raw = world.getDynamicProperty(JAIL_POS_KEY) ?? "[]";
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
