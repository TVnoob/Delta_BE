// scripts/systems/jailSystem.js
import { world, system } from "@minecraft/server";
import { JAIL_POS_KEY, REVIVE_LIMIT_KEY } from "../consts.js";
import { randomTeleportToJail } from "../GameSystems/JailrandomTP.js";

const PLAYER_CATCH_COUNT_KEY = "player_catch_counts";

let JailintervalId = null;
let initialPhase = false;

export function settingjailsystem(){
  system.afterEvents.scriptEventReceive.subscribe(e => {
    if (e.id === "bgc:otherstart")
    console.warn("jailSystem.js is working ");
    initialPhase = true;
    let reviveMode = "auto"; // reviveSystem.js と仕組みを併用(説明脳死)
    try {
        const configRaw = world.getDynamicProperty("config_data") ?? "{}";
        const config = JSON.parse(configRaw);
        reviveMode = config.reviveMode ?? "auto";
      } catch (e) {
        console.warn("⚠️ reviveMode 読み込み失敗:", e);
      }
    if (JailintervalId !== null) {
      system.clearRun(JailintervalId);
      JailintervalId = null;
    }
      if (reviveMode === "auto") {
      JailintervalId = system.runInterval(jailSystemone, 1);
    } else if (reviveMode === "manual") {
      JailintervalId = system.runInterval(jailsystemtwo, 1);
    }
    if (e.id === "bgc:end" ){
    if (JailintervalId !== null) {
      system.clearRun(JailintervalId);
      JailintervalId = null;
      console.warn("JailSystem.jsのリセット完了");
    }
    }
  });
}

function jailSystemone() {
    const raw = world.getDynamicProperty(JAIL_POS_KEY);
    if (!raw) return;

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
        randomTeleportToJail(player);
        player.removeTag("catched");
        player.addTag("injail");

        const playerName = player.name;
        catchCounts[playerName] = (catchCounts[playerName] || 0) + 1;

        if (catchCounts[playerName] > reviveLimitNumber) {
          player.runCommand("gamemode spectator");
          world.sendMessage(`§e${playerName}は、もう復活できないようだ...`);
        } else {
          player.sendMessage("§c 捕まりました。 20秒後に復活します");
        }

        console.warn(`[JAIL] ${playerName} を牢屋1に移動し、catched → injail`);
      } catch (e) {
        console.warn(`⚠️ テレポート失敗: ${e}`);
      }
    }
  world.setDynamicProperty(PLAYER_CATCH_COUNT_KEY, JSON.stringify(catchCounts));
}

function jailsystemtwo(){
    const raw = world.getDynamicProperty(JAIL_POS_KEY);
    if (!raw) return;

    for (const player of world.getPlayers()) {
      if (!player.hasTag("catched") || player.hasTag("injail")) continue;

      try {
        randomTeleportToJail(player);
        player.removeTag("catched");
        player.addTag("injail");

        const playerName = player.name;


        player.sendMessage("§c 捕まりました。仲間からの救助を待ちましょう")

        console.warn(`[INJAIL] ${playerName}`);
      } catch (e) {
        console.warn(`⚠️ テレポート失敗: ${e}`);
      }
    }
}


export function resetCatchCounts() {
  world.setDynamicProperty(PLAYER_CATCH_COUNT_KEY, JSON.stringify({}));
}
