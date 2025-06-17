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
  const list = getJailTPList(); // ← これで読み込み
  const hasJailRandomTP = list.length > 0;
  if (!player || !hasJailRandomTP) {
    console.warn(`[JailRandomTP] ⚠️ プレイヤーまたはTPリストが無効です`);
    return;
  }

  const target = list[Math.floor(Math.random() * list.length)];

  // Vector3チェック
  if (!target || typeof target.x !== "number" || typeof target.y !== "number" || typeof target.z !== "number") {
    console.warn(`[JailRandomTP] ⚠️ 無効なTP座標: ${JSON.stringify(target)}`);
    return;
  }

  try {
    player.teleport(target);  // ← Vector3 でなければここでエラー
    console.warn(`[JailRandomTP] ${player.name} をランダムTP: ${target.x}, ${target.y}, ${target.z}`);
  } catch (e) {
    console.warn(`[JailRandomTP] 🚨 テレポート失敗: ${e}`);
  }
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
