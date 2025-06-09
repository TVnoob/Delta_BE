// scripts/systems/endGameSystem.js
import { system, world } from "@minecraft/server";

const GAME_STARTED_KEY = "game_started";
const CONFIG_KEY = "config_data";
const END_COMMAND = "function r_bgc";
let remainingTicks = -1;

export function endGameSystem() {
  // Script Event: ゲーム開始 / 終了トリガー
  system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id === "bgc:start") {
    try {
        const config = JSON.parse(world.getDynamicProperty("config_data") ?? "{}");
        const limit = typeof config.timeLimit === "number" ? config.timeLimit : 600; // 秒指定, デフォルト600秒（10分）
        world.getDimension("overworld").runCommand(`scoreboard objectives add a dummy ゲーム情報`);
        world.getDimension("overworld").runCommand(`scoreboard objectives setdisplay sidebar a`);
        world.getDimension("overworld").runCommand(`scoreboard players set 残り時間 a ${limit}`);
        } catch (e) {
          console.warn("⚠️ 制限時間の初期化中にエラー:", e);
        }
      world.setDynamicProperty(GAME_STARTED_KEY, true);
      console.warn("🎮 ゲームスタート信号を受信");

      // 制限時間の取得（秒 → tick）
      const configRaw = world.getDynamicProperty(CONFIG_KEY);
      try {
        const config = JSON.parse(configRaw ?? "{}");
        if (typeof config.timeLimitSec === "number" && config.timeLimitSec > 0) {
          remainingTicks = config.timeLimitSec * 20;
          console.warn(`⏱️ 制限時間: ${config.timeLimitSec} 秒（${remainingTicks} tick）`);
        } else {
          remainingTicks = -1;
        }
      } catch {
        remainingTicks = -1;
      }
    }

    if (event.id === "bgc:end") {
      world.setDynamicProperty(GAME_STARTED_KEY, false);
      remainingTicks = -1;
      runEndCommand("時間切れによる逃げの勝利");
    }
  });

  // 毎tick監視
  system.runInterval(() => {
    const started = world.getDynamicProperty(GAME_STARTED_KEY);
    if (!started) return;

    const players = world.getPlayers();
    if (players.length === 0) return;

    // 【1】逃げ全員が捕まったら鬼勝利
    const targets = players.filter(p => !p.hasTag("oni"));
    if (targets.length === 0) return;

    const allCaught = targets.every(p => p.hasTag("injail"));
    if (allCaught) {
      world.setDynamicProperty(GAME_STARTED_KEY, false);
      runEndCommand("逃げ全滅により鬼の勝利");
      return;
    }

    // 【2】金棒ドロップで強制終了
    const dim = world.getDimension("overworld");
    const entities = dim.getEntities({ type: "item" });

    for (const entity of entities) {
      const itemComp = entity.getComponent("minecraft:item");
      const itemStack = itemComp?.itemStack;

      if (!itemStack || itemStack.typeId !== "minecraft:stick") continue;
      if (itemStack.nameTag !== "§l§g金棒") continue;

      const throwerComp = entity.getComponent("minecraft:thrower");
      const throwerId = throwerComp?.thrower;

      if (throwerId) {
        const thrower = world.getPlayers().find(p => p.id === throwerId);
        if (thrower?.hasTag("oni")) {
          entity.kill();
          world.setDynamicProperty(GAME_STARTED_KEY, false);
          runEndCommand("ゲームが強制終了されました");
          return;
        }
      }
    }

    // 【3】時間切れによる終了
    if (remainingTicks >= 0) {
      remainingTicks--;
      if (remainingTicks % 20 === 0) {
        const secLeft = Math.floor(remainingTicks / 20);
        for (const player of players) {
          player.runCommand(`title @s actionbar §e残り時間: ${secLeft} 秒`);
        }
      }

      if (remainingTicks <= 0) {
        world.setDynamicProperty(GAME_STARTED_KEY, false);
        runEndCommand("時間切れによる逃げの勝利");
      }
    }
  }, 1); // 毎tick
}

function runEndCommand(reason) {
  try {
    world.getDimension("overworld").runCommand(END_COMMAND);
    overworld.runCommand(`scoreboard objectives remove a`);
    world.sendMessage(`§l§c【試合終了】§r §7(${reason})`);
  } catch (e) {
    console.warn(`⚠️ function r_bgc の実行に失敗: ${e}`);
  }
}
