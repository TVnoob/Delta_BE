// scripts/systems/reviveSystem.js
import { system, world } from "@minecraft/server";
import { randomTeleportPlayer } from "./RandomTP.js";
import { startcountdownonlysystem } from "./startcountdownonlysystem.js"
import { JAIL_POS_KEY, REVIVE_LIMIT_KEY } from "../consts.js";


const REVIVE_DURATION_TICKS = 20 * 20; // 20秒
const CATCH_COUNT_KEY = "player_catch_counts";
const reviveTimers = new Map();

let initialPhase = false;

export function reviveSystem() {
  system.afterEvents.scriptEventReceive.subscribe(e => {
    if (e.id !== "bgc:start") return;
    initialPhase = true;
    reviveTimers.clear();

    for (const p of world.getPlayers()) {
      if (!p.hasTag("oni")) {
        console.warn(`[ReviveSystem] ランダムTP対象: ${p.name}`);
        p.runCommand("gamemode adventure");
        p.addLevels(20);
        startcountdownonlysystem();
        randomTeleportPlayer(p);
      } else {
        console.warn(`[ReviveSystem] 鬼のためTPスキップ: ${p.name}`);
      }
    }
  });


  system.runInterval(() => {

    const reviveLimit = typeof world.getDynamicProperty(REVIVE_LIMIT_KEY) === "number"
      ? world.getDynamicProperty(REVIVE_LIMIT_KEY)
      : 3;

    const catchMap = JSON.parse(world.getDynamicProperty(CATCH_COUNT_KEY) ?? "{}");

    for (const player of world.getPlayers()) {
      const name = player.name;
      const eligible = !player.hasTag("oni") && player.hasTag("injail");
      if (!eligible) continue;
      if (!reviveTimers.has(name)) {
      player.addLevels(20);
      reviveTimers.set(name, 0);
      }
      if ((catchMap[name] || 0) > reviveLimit) continue;
      const ticks = (reviveTimers.get(name) || 0) + 1;
      reviveTimers.set(name, ticks);
      if (ticks % 20 === 0) {
        player.addLevels(-1);
      }

      if (ticks >= REVIVE_DURATION_TICKS) {
        player.runCommand("xp -1000L");
        player.runCommand("gamemode adventure");
        player.removeTag("injail");
        reviveTimers.delete(name);
        player.sendMessage("§a✅ 復活しました。");
        player.runCommand("effect @s[tag=nige] invisibility 20 1 true")
        player.runCommand("effect @s[tag=nige] speed 10 5 true")
        randomTeleportPlayer(player);
      }
    }
  }, 1);
}