// scripts/systems/jailSystem.js
import { world, system } from "@minecraft/server";

const JAIL_POS_KEY = "jail_positions";
const REVIVE_LIMIT_KEY = "revive_limit";
const PLAYER_CATCH_COUNT_KEY = "player_catch_counts";

export function jailSystem() {
  system.runInterval(() => {
    const raw = world.getDynamicProperty(JAIL_POS_KEY);
    if (!raw) return;

    let jailData;
    try {
      jailData = JSON.parse(raw);
    } catch (e) {
      console.warn("⚠️ 牢屋座標のJSON解析エラー:", e);
      return;
    }

    const jail1 = jailData.jail1 ?? null;
    if (!jail1) return;

    const reviveLimit = world.getDynamicProperty(REVIVE_LIMIT_KEY);
    const reviveLimitNumber = typeof reviveLimit === "number" ? reviveLimit : 3;

    const catchCountsRaw = world.getDynamicProperty(PLAYER_CATCH_COUNT_KEY) ?? "{}";
    let catchCounts;
    try {
      catchCounts = JSON.parse(catchCountsRaw);
    } catch {
      catchCounts = {};
    }

    for (const player of world.getPlayers()) {
      if (!player.hasTag("catched") || player.hasTag("injail")) continue;

      try {
        player.teleport(jail1);
        player.removeTag("catched");
        player.addTag("injail");

        const playerName = player.name;
        catchCounts[playerName] = (catchCounts[playerName] || 0) + 1;

        if (catchCounts[playerName] > reviveLimitNumber) {
          player.runCommand("gamemode spectator");
          world.sendMessage(`§e${playerName}は、もう復活できないようだ...`);
        } else {
          player.sendMessage("§c⛓️ 捕まりました。 間もなく復活します");
        }

        console.warn(`[JAIL] ${playerName} を牢屋1に移動し、catched → injail`);
      } catch (e) {
        console.warn(`⚠️ テレポート失敗: ${e}`);
      }
    }

    world.setDynamicProperty(PLAYER_CATCH_COUNT_KEY, JSON.stringify(catchCounts));
  }, 1);
}

export function resetCatchCounts() {
  world.setDynamicProperty(PLAYER_CATCH_COUNT_KEY, "{}");
}
