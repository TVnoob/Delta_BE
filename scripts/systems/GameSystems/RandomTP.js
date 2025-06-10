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

// 🎯 jail1 周辺のプレイヤーをランダムTP（1秒毎）
system.runInterval(() => {
  if (teleportPoints.length === 0) return;

  const raw = world.getDynamicProperty(JAIL_POS_KEY) ?? "{}";
  let jailData;
  try {
    jailData = JSON.parse(raw);
  } catch {
    return;
  }

  const jail1 = jailData?.jail1;
  if (!jail1) return;

  for (const p of world.getPlayers()) {
    const loc = p.location;
    const dx = loc.x - jail1.x;
    const dy = loc.y - jail1.y;
    const dz = loc.z - jail1.z;

    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && Math.abs(dz) <= 1) {
      const target = teleportPoints[Math.floor(Math.random() * teleportPoints.length)];
      p.teleport(target);
      console.warn(`[RandomTP] ${p.name} をランダムTP: ${target.x}, ${target.y}, ${target.z}`);
    }
  }
}, );
