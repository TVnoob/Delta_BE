// scripts/systems/RandomTP.js
import { world, system } from "@minecraft/server";
import { JAIL_POS_KEY } from "../consts.js";

const ARMORSTAND_TAG = "xyzfull";
let teleportPoints = [];
const RANDOMTP_POS_KEY = "random_tp_points"; // 新しいキー名（必要に応じて変更）

// 📡 イベント登録関数
export function thisistruerandomTP() {
  system.afterEvents.scriptEventReceive.subscribe(event => {
    if (event.id === "xyz:select") {
      const dim = world.getDimension("overworld");
      const stands = dim.getEntities({ type: "minecraft:armor_stand" });

      let addedCount = 0;
      for (const e of stands) {
        if (e.nameTag === ARMORSTAND_TAG) {
          teleportPoints.push({ x: e.location.x, y: e.location.y, z: e.location.z });
          e.kill();
          addedCount++;
        }
      }

      if (addedCount > 0) {
        console.warn(`[RandomTP] ✅ ${addedCount} 箇所を追加登録しました。合計: ${teleportPoints.length}`);
      } else {
        console.warn("[RandomTP] ❌ xyzfull の防具立てが見つかりませんでした。");
      }
    }

    if (event.id === "xyz:reset") {
      teleportPoints = [];
      console.warn("[RandomTP] ⚠️ 全ての登録ポイントをリセットしました。");
    }
  });
}
// 呼び出し式トリガーに対応させたランダムTP
export function randomTeleportPlayer(player) {
  if (teleportPoints.length === 0) {
    console.warn(`[RandomTP] ⚠️ TP先が登録されていません。プレイヤー: ${player.name}`);
    player.sendMessage(`§l§g[RandomTP.js]§l§c!WARNING!どこにもランダムTP先が登録されてません!`);
    
    return;
  }

  const target = teleportPoints[Math.floor(Math.random() * teleportPoints.length)];
  player.teleport(target);
  console.warn(`[RandomTP] ${player.name} をランダムTP: ${target.x}, ${target.y}, ${target.z}`);
}

export function getRandomTPList() {
  try {
    const raw = world.getDynamicProperty(RANDOMTP_POS_KEY) ?? "[]";
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
