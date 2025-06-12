// scripts/systems/RandomTP.js
import { world, system } from "@minecraft/server";

const ARMORSTAND_TAG = "xyzfull";
const JAIL_POS_KEY = "jail_positions";
let teleportPoints = [];

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
    return;
  }

  const target = teleportPoints[Math.floor(Math.random() * teleportPoints.length)];
  player.teleport(target);
  console.warn(`[RandomTP] ${player.name} をランダムTP: ${target.x}, ${target.y}, ${target.z}`);
}
