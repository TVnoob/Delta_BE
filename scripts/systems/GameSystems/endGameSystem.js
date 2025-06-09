// scripts/systems/GameSystems/endGameSystem.js
import { system, world } from "@minecraft/server";

const GAME_STARTED_KEY = "game_started";
const CONFIG_KEY = "config_data";
const END_COMMAND = "function r_bgc";
let remainingTicks = -1;

export function endGameSystem() {
  system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id === "bgc:start") {
      world.setDynamicProperty(GAME_STARTED_KEY, true);
      console.warn("🎮 ゲームスタート信号を受信");

      try {
        const config = JSON.parse(world.getDynamicProperty(CONFIG_KEY) ?? "{}");
        const limitSec = Number.isFinite(config.timeLimitSec) ? config.timeLimitSec : 600;
        remainingTicks = limitSec * 20;

        const dim = world.getDimension("overworld");
        dim.runCommand(`scoreboard objectives add a dummy ゲーム情報`);
        dim.runCommand(`scoreboard objectives setdisplay sidebar a`);
        dim.runCommand(`scoreboard players set 残り時間 a ${limitSec}`);
        console.warn(`⏱️ 制限時間: ${limitSec} 秒 → ${remainingTicks} tick`);
      } catch (e) {
        console.warn("⚠️ 制限時間の初期取得に失敗:", e);
        remainingTicks = -1;
      }
    }

    if (event.id === "bgc:end") {
      world.setDynamicProperty(GAME_STARTED_KEY, false);
      remainingTicks = -1;
      runEndCommand("ゲーム終了トリガーにより強制終了");
    }
  });

  system.runInterval(() => {
    const started = world.getDynamicProperty(GAME_STARTED_KEY);
    if (!started || remainingTicks < 0) return;

    const players = world.getPlayers();
    if (players.length === 0) return;

    // ① 逃げ全員がinjailなら鬼勝利
    const runners = players.filter(p => !p.hasTag("oni"));
    if (runners.length > 0 && runners.every(p => p.hasTag("injail"))) {
      world.setDynamicProperty(GAME_STARTED_KEY, false);
      runEndCommand("逃げ全滅により鬼の勝利");
      return;
    }

    // ② 鬼が金棒をドロップで強制終了
    const dim = world.getDimension("overworld");
    const items = dim.getEntities({ type: "item" });
    for (const item of items) {
      const comp = item.getComponent("minecraft:item")?.itemStack;
      if (comp?.typeId === "minecraft:stick" && comp.nameTag === "§l§g金棒") {
        const thrower = item.getComponent("minecraft:thrower")?.thrower;
        if (thrower) {
          const oni = world.getPlayers().find(p => p.id === thrower && p.hasTag("oni"));
          if (oni) {
            item.kill();
            world.setDynamicProperty(GAME_STARTED_KEY, false);
            runEndCommand("鬼による金棒ドロップで強制終了");
            return;
          }
        }
      }
    }

    // ③ 制限時間経過による終了
    remainingTicks--;
    if (remainingTicks % 20 === 0) {
      const sec = Math.floor(remainingTicks / 20);
      for (const p of players) {
        p.runCommand(`title @s actionbar §e残り時間: ${sec} 秒`);
      }
      dim.runCommand(`scoreboard players set 残り時間 a ${sec}`);
    }

    if (remainingTicks <= 0) {
      world.setDynamicProperty(GAME_STARTED_KEY, false);
      runEndCommand("時間切れによる逃げの勝利");
    }
  }, 1);
}

function runEndCommand(reason) {
  try {
    const dim = world.getDimension("overworld");
    dim.runCommand(END_COMMAND);
    dim.runCommand(`scoreboard objectives remove a`);
    world.sendMessage(`§l§c【試合終了】§r §7(${reason})`);
  } catch (e) {
    console.warn("⚠️ function r_bgc の実行に失敗:", e);
  }
}
