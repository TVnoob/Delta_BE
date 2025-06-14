// scripts/systems/GameSystems/endGameSystem.js
import { system, world } from "@minecraft/server";
import { CONFIG_KEY } from "../consts.js";

const GAME_STARTED_KEY = "game_started";
const END_COMMAND = "function r_bgc";
let remainingTicks = -1;

export function endGameSystem() {
  // 金棒ドロップによる強制終了検知(broken!  アイテム名のカラーコードが識別できない問題)
  world.afterEvents.entitySpawn.subscribe(ev => {
    const ent = ev.entity;
    if (ent?.typeId === "minecraft:item") {
      const stkComp = ent.getComponent("minecraft:item");
      const stk = stkComp?.itemStack;
      console.warn(`🔍 Spawned item: ${stk?.typeId} nameTag=${stk?.nameTag}`);
      if (stk?.typeId === "minecraft:stick" && stk?.nameTag === "§l§g金棒") {
        const throwerId = ent.getComponent("minecraft:thrower")?.thrower;
        console.warn(`🔍 Thrower ID: ${throwerId}`);
        const oni = world.getPlayers().find(p => p.id === throwerId && p.hasTag("oni"));
        if (oni) {
          console.warn(`⚠️ 金棒ドロップ検出！強制終了トリガー by ${oni.name}`);
          ent.kill();
          world.setDynamicProperty(GAME_STARTED_KEY, false);
          // runCommand に .catch を使わない。同期版なので例外なら try/catch
          try {
            world.getDimension("overworld").runCommand("scriptevent bgc:end forceEnd");
          } catch (ex) {
            console.warn("⚠️ scriptevent bgc:end forceEnd コマンド実行失敗:", ex);
          }
          runEndCommand("鬼による金棒ドロップで強制終了");
        }
      }
    }
  });

  system.afterEvents.scriptEventReceive.subscribe(event => {
    if (event.id === "bgc:start") {
      world.setDynamicProperty(GAME_STARTED_KEY, true);
      console.warn("🎮 ゲームスタート信号を受信");
      remainingTicks = -1;
      try {
        const cfg = JSON.parse(world.getDynamicProperty(CONFIG_KEY) ?? "{}");
        const sec = typeof cfg.timeLimitSec === "number" ? cfg.timeLimitSec : 600;
        if (sec > 0) {
          remainingTicks = sec * 20;
          console.warn(`⏱️ 制限時間: ${sec}s → ${remainingTicks} ticks`);
        } else {
          console.warn("⚠️ 制限時間が無効のため無制限です。");
        }
      } catch (e) {
        console.warn("⚠️ 制限時間取得に失敗:", e);
      }
    }

    if (event.id === "bgc:end") {
      world.setDynamicProperty(GAME_STARTED_KEY, false);
      remainingTicks = -1;
      runEndCommand("ゲーム終了トリガーにより終了");
    }
  });

  system.runInterval(() => {
    const started = world.getDynamicProperty(GAME_STARTED_KEY);
    if (!started) return;

    const players = world.getPlayers();
    if (players.length === 0) return;

    // ① 全逃走者が injail → 鬼勝利
    const runners = players.filter(p => !p.hasTag("oni"));
    if (runners.length > 0 && runners.every(p => p.hasTag("othersyste"))) { // ここをinjail以外にしてデバッグ
      world.setDynamicProperty(GAME_STARTED_KEY, false);
      try {
        world.getDimension("overworld").runCommand("scriptevent bgc:end allCaught");
      } catch (ex) {
        console.warn("⚠️ scriptevent bgc:end allCaught 実行失敗:", ex);
      }
      runEndCommand("逃げ全滅により鬼の勝利");
      return;
    }

    // ③ 制限時間カウント
    if (remainingTicks >= 0) {
      remainingTicks--;
      if (remainingTicks % 20 === 0) {
        const sec = Math.ceil(remainingTicks / 20);
        for (const p of players) {
          try {
            p.runCommand(`title @s actionbar §e残り時間: ${sec} 秒`);
          } catch {}
        }
      }
      if (remainingTicks <= 0) {
        world.setDynamicProperty(GAME_STARTED_KEY, false);
        try {
          world.getDimension("overworld").runCommand("scriptevent bgc:end timeUp");
        } catch (ex) {
          console.warn("⚠️ scriptevent bgc:end timeUp 実行失敗:", ex);
        }
        runEndCommand("時間切れによる逃げの勝利");
      }
    }

  }, 1);
}

function runEndCommand(reason) {
  try {
    const dim = world.getDimension("overworld");
    dim.runCommand(END_COMMAND);
    dim.runCommand("scoreboard objectives remove a");
    world.sendMessage(`§l§c【試合終了】§r §7(${reason})`);
  } catch (e) {
    console.warn("⚠️ function r_bgc 実行失敗:", e);
  }
}
