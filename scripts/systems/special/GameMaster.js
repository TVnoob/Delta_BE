// scripts/systems/special/GameMaster.js
import { system, world, ItemStack } from "@minecraft/server";
import { resetAllTimerMap } from "./autoreloadrc.js";

const CREATORS = ["SCPzaidann 1958","Reiya4384"];
const ADMIN_LIST_KEY = "admin_list";
const JAIL_POS_KEY = "jail_positions";
const BANLIST_KEY = "ban_list";
let gameStarted = false;

export function gamemastersystemscript(){
  system.afterEvents.scriptEventReceive.subscribe(event => {
    const { id } = event;

    if (id === "bgc:start") {
      if (gameStarted) return;
      gameStarted = true;
      resetAllTimerMap();

      const players = world.getPlayers();
      const banArr = getBanList();

      // インベントリクリア
      for (const p of players) {
        const invComp = p.getComponent("minecraft:inventory");
        if (invComp) {
          const container = invComp.container;
          for (let i = 0; i < container.size; i++) container.setItem(i, undefined);
        }
      }

      // banプレイヤーは脱落＝injailタグ＆スペクテイター
      for (const p of players) {
        if (banArr.includes(p.name)) {
          p.removeTag("nige");
          p.addTag("injail");
          p.runCommand("gamemode spectator");
        }
      }

      // 鬼抽選（ban除外）
      const eligibles = players.filter(p => !banArr.includes(p.name));
      const shuffled = shuffleArray(eligibles);
      const totalOni = Math.max(1, JSON.parse(world.getDynamicProperty("config_data") ?? "{}").oniCount || 1);
      const oniPlayers = shuffled.slice(0, totalOni);
      const runnerPlayers = shuffled.slice(totalOni);

      // 鬼にタグとアイテム
      for (const p of oniPlayers) {
        p.addTag("oni");
        const invComp = p.getComponent("minecraft:inventory");
        if (invComp) invComp.container.setItem(0, new ItemStack("minecraft:stick", 1));
      }
      // 逃げプレイヤーにタグ
      for (const p of runnerPlayers) p.addTag("nige");

      // ゲームモード設定と鬼経験値リセット
      for (const p of oniPlayers) {
        p.runCommand("gamemode adventure");
        p.runCommand("xp -1000L");
      }

      // 逃げプレイヤーは牢屋へtp＆advモード
      const rawJail = world.getDynamicProperty(JAIL_POS_KEY) ?? "{}";
      const jailData = JSON.parse(rawJail);
      const jail1 = jailData.jail1;
      for (const p of runnerPlayers) {
        p.runCommand("gamemode adventure");
        if (jail1?.x != null) p.teleport(jail1);
      }

      // リリース処理はreviveSystem.jsへ委任
      world.setDynamicProperty("game_state", JSON.stringify({ started: true }));
    }

    else if (id === "bgc:end") {
      gameStarted = false;
      const players = world.getPlayers();
      // タグ・インベントリ・アイテム再配布処理等…
      // （省略可能。特定構成器で対応）
      world.setDynamicProperty("game_state", JSON.stringify({ started: false }));
    }
  });
}

function getBanList() {
  try {
    const arr = JSON.parse(world.getDynamicProperty(BANLIST_KEY) ?? "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function shuffleArray(arr) {
  const a = arr.slice();
  for(let i = a.length -1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

