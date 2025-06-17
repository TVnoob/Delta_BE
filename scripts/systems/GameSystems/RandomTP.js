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
        world.setDynamicProperty(RANDOMTP_POS_KEY, JSON.stringify(teleportPoints));
        console.warn(`[RandomTP] ✅ ${addedCount} 箇所を追加登録しました。合計: ${teleportPoints.length}`);
      } else {
        console.warn("[RandomTP] ❌ xyzfull の防具立てが見つかりませんでした。");
      }
    }

    if (event.id === "xyz:reset") {
      teleportPoints = [];
      world.setDynamicProperty(RANDOMTP_POS_KEY, JSON.stringify(teleportPoints));
      console.warn("[RandomTP] ⚠️ 全ての登録ポイントをリセットしました。");
    }
  });
}
// 呼び出し式トリガーに対応させたランダムTP
export function randomTeleportPlayer(player) {
  const list = getRandomTPList(); // ← これで読み込み
  const hasRandomTP = list.length > 0;
  if (!player || !hasRandomTP) {
    console.warn(`[RandomTP] ⚠️ プレイヤーまたはTPリストが無効です`);
    return;
  }

  const target = list[Math.floor(Math.random() * list.length)];

  // Vector3チェック
  if (!target || typeof target.x !== "number" || typeof target.y !== "number" || typeof target.z !== "number") {
    console.warn(`[RandomTP] ⚠️ 無効なTP座標: ${JSON.stringify(target)}`);
    return;
  }

  try {
    player.teleport(target);  // ← Vector3 でなければここでエラー
    console.warn(`[RandomTP] ${player.name} をランダムTP: ${target.x}, ${target.y}, ${target.z}`);
  } catch (e) {
    console.warn(`[RandomTP] 🚨 テレポート失敗: ${e}`);
  }
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
