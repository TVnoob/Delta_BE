// script/systems/GameSystems/startcountdownonlysystem.js
import { system, world } from "@minecraft/server";

const initialPhaseMap = new Map(); 
let intervalId = null;


export function startcountdownonlysystem() {
  initialPhaseMap.clear();
  for (const p of world.getPlayers()) {
    initialPhaseMap.set(p.name, 20);
  }

  // 既存の interval を止める（多重実行防止）
  if (intervalId !== null) {
    system.clearRun(intervalId);
    intervalId = null;
  }

  intervalId = system.runInterval(() => {
    for (const [name, time] of initialPhaseMap.entries()) {
      const p = world.getPlayers().find(p => p.name === name);
      if (!p) continue;

      const remaining = time - 1;
      p.addLevels(-1);

      if (remaining <= 0) {
        initialPhaseMap.delete(name);
        p.sendMessage("§l§c 鬼ごっこ 開始");
      } else {
        initialPhaseMap.set(name, remaining);
      }
    }
  }, 20);
}