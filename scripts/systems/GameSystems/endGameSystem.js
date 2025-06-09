// scripts/systems/GameSystems/endGameSystem.js
import { system, world } from "@minecraft/server";

const GAME_STARTED_KEY = "game_started";
const CONFIG_KEY = "config_data";
const END_COMMAND = "function r_bgc";
let remainingTicks = -1;

export function endGameSystem() {
system.afterEvents.scriptEventReceive.subscribe(event => {
  if (event.id === "bgc:start") {
    world.setDynamicProperty(GAME_STARTED_KEY, true);
    console.warn("🎮 ゲームスタート信号を受信");
    remainingTicks = -1;
    try {
      const config = JSON.parse(world.getDynamicProperty(CONFIG_KEY) ?? "{}");
      const limitSec = typeof config.timeLimitSec === "number" ? config.timeLimitSec : 600;
      if (limitSec > 0) {
        remainingTicks = limitSec * 20;
        console.warn(`⏱️ 制限時間: ${limitSec} 秒 → ${remainingTicks} tick`);
      } else {
        console.warn("⚠️ 制限時間が無効なので制限なしになります。");
      }
    } catch (e) {
      console.warn("⚠️ 制限時間の初期取得に失敗:", e);
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
  if (!started) return;

  const players = world.getPlayers();
  if (players.length === 0) return;

  // 判定①：逃げ全員が injail なら鬼勝利
  const runners = players.filter(p => !p.hasTag("oni"));
  if (runners.length > 0 && runners.every(p => p.hasTag("injail"))) {
    world.setDynamicProperty(GAME_STARTED_KEY, false);
    world.getDimension("overworld").runCommandAsync("scriptevent bgc:end allCaught")
      .catch(e => console.warn("⚠️ bgc:end トリガー失敗:", e));
    runEndCommand("逃げ全滅により鬼の勝利");
    return;
  }

  // 判定②：金棒による強制終了
  const items = world.getDimension("overworld").getEntities({ type: "item" });
  for (const item of items) {
    const comp = item.getComponent("minecraft:item")?.itemStack;
    if (comp?.typeId === "minecraft:stick" && comp.nameTag === "§l§g金棒") {
      const thrower = item.getComponent("minecraft:thrower")?.thrower;
      if (thrower) {
        const oni = players.find(p => p.id === thrower && p.hasTag("oni"));
        if (oni) {
          item.kill();
          world.setDynamicProperty(GAME_STARTED_KEY, false);
          world.getDimension("overworld").runCommandAsync("scriptevent bgc:end forceEnd")
            .catch(e => console.warn("⚠️ bgc:end トリガー失敗:", e));
          runEndCommand("鬼による金棒ドロップで強制終了");
          return;
        }
      }
    }
  }

  // 判定③：時間切れ
  if (remainingTicks >= 0) {
    remainingTicks--;
    if (remainingTicks % 20 === 0) {
      const sec = Math.ceil(remainingTicks / 20);
      for (const p of players) {
        p.runCommand(`title @s actionbar §e残り時間: ${sec} 秒`);
      }
    }
    if (remainingTicks <= 0) {
      world.setDynamicProperty(GAME_STARTED_KEY, false);
      world.getDimension("overworld").runCommand("scriptevent bgc:end timeUp")
        .catch(e => console.warn("⚠️ bgc:end トリガー失敗:", e));
      runEndCommand("時間切れによる逃げの勝利");
      return;
    }
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
