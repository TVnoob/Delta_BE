// scripts/systems/reviveSystem.js
import { system, world } from "@minecraft/server";

const REVIVE_DURATION_TICKS = 20 * 20; // 20秒
const REVIVE_LIMIT_KEY = "revive_limit";
const CATCH_COUNT_KEY = "player_catch_counts";
const JAIL_POS_KEY = "jail_positions";

const reviveTimers = new Map();
let initialPhase = true;

export function reviveSystem() {
  system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id !== "bgc:start") return;

    initialPhase = true;
    reviveTimers.clear();

    for (const player of world.getPlayers()) {
      if (player.hasTag("oni")) {
        player.runCommand("gamemode adventure");
        continue;
      }

      player.runCommand("gamemode adventure");
      player.teleport({ x: player.location.x, y: player.location.y + 0.5, z: player.location.z });
      reviveTimers.set(player.name, 0);
      player.runCommand("xp 20L");
    }
  });

  system.runInterval(() => {
    const reviveLimitRaw = world.getDynamicProperty(REVIVE_LIMIT_KEY);
    const reviveLimit = typeof reviveLimitRaw === "number" ? reviveLimitRaw : 3;

    const countRaw = world.getDynamicProperty(CATCH_COUNT_KEY) ?? "{}";
    let catchMap = {};
    try {
      catchMap = JSON.parse(countRaw);
    } catch {}

    for (const player of world.getPlayers()) {
      const name = player.name;

      const isEligible =
        (!player.hasTag("oni") &&
          ((initialPhase && reviveTimers.has(name)) || (!initialPhase && player.hasTag("injail"))));

      if (!isEligible) continue;

      const caughtCount = catchMap[name] ?? 0;
      if (caughtCount > reviveLimit) continue;

      const ticks = (reviveTimers.get(name) ?? 0) + 1;

      // プレイヤーを空中に固定
      const currentLocation = player.location;
      const raw = world.getDynamicProperty("jail_positions");
      if (!raw) {
        console.warn("⚠️ 牢屋座標が未設定です");
        return;
      }
      let jailData;
      try {
        jailData = JSON.parse(raw);
      } catch (e) {
        console.warn("⚠️ JSON解析失敗:", e);
        return;
      }

      const jail1 = jailData.jail1;
      if (!jail1 || typeof jail1.x !== "number") {
        console.warn("⚠️ jail1座標が存在しません");
        return;
      }
      player.teleport({ x: currentLocation.x, y: currentLocation.y, z: currentLocation.z });
      if (ticks >= REVIVE_DURATION_TICKS) {
        player.runCommand("xp -1000L"); // 念のため XP を完全にリセット
        player.runCommand("gamemode adventure");
        player.removeTag("injail");
        reviveTimers.delete(name);
        player.sendMessage("§a✅ 復活しました。");
        player.teleport(jail1);

        if (initialPhase && reviveTimers.size === 0) {
          releaseOni();
          initialPhase = false;
        }
      } else {
        // 20で割り切れるtickなら経験値1減らす
        if (ticks % 20 === 0) {
          player.runCommand("xp -1L");
        }
        reviveTimers.set(name, ticks);
      }
    }
  }, 1);
}

function releaseOni() {
  for (const player of world.getPlayers()) {
    if (player.hasTag("oni")) {
      player.teleport(oniSpawn);
      player.sendMessage("§c👹 鬼が解放されました！");
    }
  }
}
