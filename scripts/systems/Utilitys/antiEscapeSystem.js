// scripts/systems/antiEscapeSystem.js
import { system, world } from "@minecraft/server";
import { CONFIG_KEY } from "../consts.js";

const BORDER_CACHE_KEY = "__border_positions";

const borderPositions = new Set(); // x,zのみ記録

export function antiEscapeSystem() {
  // ワールド初期スキャンで border_block の座標取得
  system.runTimeout(() => {
  const raw = world.getDynamicProperty("config_data");
  let config = {};
  try {
    config = JSON.parse(raw ?? "{}");
  } catch {}

  if (config.borderScan) {
    scanBorderBlocks(); // ← 自作関数
    config.borderScan = false;
    world.setDynamicProperty("config_data", JSON.stringify(config)); // OFFに戻す
    console.warn("✅ ボーダースキャン完了 & トグル解除");
  }
  }, 20); // ゲーム開始後1秒

  // 毎秒チェック：マップ外検出とY座標チェック
  system.runInterval(() => {
    const raw = world.getDynamicProperty(CONFIG_KEY);
    let config = {};
    try {
      config = JSON.parse(raw ?? "{}");
    } catch {}

    const lobby = config.lobby ?? { x: 0, y: 60, z: 0 };
    const minY = typeof config.minYLimit === "number" ? config.minYLimit : -Infinity;

    for (const player of world.getPlayers()) {
      const { x, y, z } = player.location;
      const posKey = `${Math.floor(x)},${Math.floor(z)}`;

      // ① Borderブロック上にいる
      if (borderPositions.has(posKey)) {
        player.teleport(lobby);
        player.sendMessage("§c⛔ 境界エリアに入りました。戻されます。");
        continue;
      }

      // ② Y座標下限
      if (y < minY) {
        player.teleport(lobby);
        player.sendMessage("§c⛔ 下限を下回りました。戻されます。");
      }
    }
  }, 20); // 毎秒
}

function scanBorderBlocks() {
  borderPositions.clear();
  const dim = world.getDimension("overworld");

  for (let x = -128; x <= 128; x++) {
    for (let z = -128; z <= 128; z++) {
      for (let y = 0; y < 256; y++) {
        const block = dim.getBlock({ x, y, z });
        if (!block) continue; // チャンクが未ロードの場合
        if (block.typeId === "minecraft:border_block") {
          borderPositions.add(`${x},${z}`);
          break; // 最初に見つかったyでそのx,zは完了
        }
      }
    }
  }

  console.warn(`[BorderScan] 完了: ${borderPositions.size}箇所のx,z記録`);
}

