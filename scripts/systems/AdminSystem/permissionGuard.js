// scripts/systems/permissionGuard.js
import { world, system } from "@minecraft/server";
import { ADMIN_LIST_KEY, CREATORS } from "../consts.js";

const TICK_INTERVAL = 20; // 約1おき

export function systemscript2() {
  system.runInterval(() => {
    const admins = getAdminList();

    for (const player of world.getPlayers()) {
      const inventory = player.getComponent("minecraft:inventory");
      if (!inventory) continue;

      const container = inventory.container;
      for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (!item) continue;

        if (item.typeId === "additem:verified_admin" && !admins.includes(player.name)) {
          container.setItem(i, undefined);
          player.sendMessage("§c⛔ このアイテムはあなたには許可されていません。");
        }
      }
    }
  }, TICK_INTERVAL);

  function getAdminList() {
    try {
      const raw = world.getDynamicProperty(ADMIN_LIST_KEY);
      const parsed = JSON.parse(raw ?? "[]");
      for (const name of CREATORS) {
      if (!parsed.includes(name)) parsed.push(name);
      }
      return parsed;
    } catch {
      return [CREATOR];
    }
  }
}
