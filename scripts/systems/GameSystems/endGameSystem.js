// scripts/systems/GameSystems/endGameSystem.js
import { system, world } from "@minecraft/server";

const GAME_STARTED_KEY = "game_started";
const CONFIG_KEY = "config_data";
const END_COMMAND = "function r_bgc";
let remainingTicks = -1;

export function endGameSystem() {
  // 🎬 開始／終了シグナルの監視
  system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id === "bgc:start") {
      try {
        const config = JSON.parse(world.getDynamicProperty(CONFIG_KEY) ?? "{}");
        const limitSec = typeof config.timeLimitSec === "number" ? config.timeLimitSec : 600;
        world.getDimension("overworld").runCommand("scoreboard objectives add a dummy ゲーム情報");
        world.getDimension("overworld").runCommand("scoreboard objectives setdisplay sidebar a");
        world.getDimension("overworld").runCommand(`scoreboard players set 残り時間 a ${limitSec}`);
        remainingTicks = limitSec * 20;
      } catch (e) {
        console.warn("⚠️ 制限時間の初期化中にエラー:", e);
        remainingTicks = -1;
      }
      world.setDynamicProperty(GAME_STARTED_KEY, true);
      console.warn("🎮 ゲームスタート信号を受信");
    }

    if (event.id === "bgc:end") {
      world.setDynamicProperty(GAME_STARTED_KEY, false);
      remainingTicks = -1;
      runEndCommand("時間切れによる逃げの勝利");
    }
  });

  // ⏱ メインループ：毎tick検査
  system.runInterval(() => {
    if (!world.getDynamicProperty(GAME_STARTED_KEY)) return;

    const players = world.getPlayers();
    if (players.length === 0) return;

    // 1. 全逃げ捕縛 → 鬼の勝利
    const runners = players.filter(p => !p.hasTag("oni"));
    if (runners.length > 0 && runners.every(p => p.hasTag("injail"))) {
      world.setDynamicProperty(GAME_STARTED_KEY, false);
      runEndCommand("逃げ全滅により鬼の勝利");
      return;
    }

    // 2. 鬼が「金棒」をドロップ → 強制終了
    const dim = world.getDimension("overworld");
    for (const entity of dim.getEntities({ type: "item" })) {
      const itemStack = entity.getComponent("minecraft:item")?.itemStack;
      if (!itemStack) continue;
      if (itemStack.typeId === "minecraft:stick" && itemStack.nameTag === "§l§g金棒") {
        const throwerId = entity.getComponent("minecraft:thrower")?.thrower;
        const oni = world.getPlayers().find(p => p.engine.id === throwerId && p.hasTag("oni"));
        if (oni) {
          entity.kill();
          world.setDynamicProperty(GAME_STARTED_KEY, false);
          runEndCommand("ゲームが強制終了されました");
          return;
        }
      }
    }

    // 3. 時間経過による終了
    if (remainingTicks >= 0) {
      remainingTicks--;
      if (remainingTicks % 20 === 0) {
        const sec = Math.max(0, Math.floor(remainingTicks / 20));
        for (const p of players) {
          p.runCommand(`title @s actionbar §e残り時間: ${sec} 秒`);
        }
        world.getDimension("overworld")
          .runCommand(`scoreboard players set 残り時間 a ${sec}`);
      }
      if (remainingTicks <= 0) {
        world.setDynamicProperty(GAME_STARTED_KEY, false);
        runEndCommand("時間切れによる逃げの勝利");
        return;
      }
    }
  }, 1);

  function runEndCommand(reason) {
    try {
      const overworld = world.getDimension("overworld");
      overworld.runCommand(END_COMMAND);
      overworld.runCommand("scoreboard objectives remove a");
      world.sendMessage(`§l§c【試合終了】§r §7(${reason})`);
    } catch (e) {
      console.warn(`⚠️ function r_bgc の実行に失敗: ${e}`);
    }
  }
}
