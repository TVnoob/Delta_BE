// scripts/systems/reviveSystem.js
import { system, world, Player, EquipmentSlot } from "@minecraft/server";
import { randomTeleportPlayer } from "./RandomTP.js";
import { startcountdownonlysystem } from "./startcountdownonlysystem.js"
import { REVIVE_LIMIT_KEY, getGods } from "../consts.js";


const REVIVE_DURATION_TICKS = 20 * 20; // 20秒
const CATCH_COUNT_KEY = "player_catch_counts";
const reviveTimers = new Map();
let intervalId = null;
let initialPhase = false;

export function reviveSystem() {
  system.afterEvents.scriptEventReceive.subscribe(e => {
    if (e.id === "bgc:otherstart")
    console.warn("reviveSystem.js is working");
    initialPhase = true;
    reviveTimers.clear();

    const configRaw = world.getDynamicProperty("config_data") ?? "{}";
    let reviveMode = "auto"; // デフォルト
    try {
    const config = JSON.parse(configRaw);
    reviveMode = config.reviveMode ?? "auto";
  } catch (e) {
    console.warn(`[ReviveSystem]`, e);
  }
  if (intervalId !== null) {
    system.clearRun(intervalId);
    intervalId = null;
  }
    if (reviveMode === "auto") {
    intervalId = system.runInterval(autoReviveLogic, 1);
  } else if (reviveMode === "manual") {
    intervalId = system.runInterval(manualReviveLogic, 1);
  }
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

    if (e.id === "bgc:end" ){
    if (intervalId !== null) {
      system.clearRun(intervalId);
      intervalId = null;
      console.warn("reviveSystem.jsのリセット完了");
    }
    }
    if (e.id === "dev:mr" ){
    const GODS = getGods();
    GODS.removeTag("injail");
    randomTeleportPlayer(GODS)
    }
  });

  function autoReviveLogic() {

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
          player.runCommand("effect @s[tag=nige] invisibility 10 1 true")
          player.runCommand("effect @s[tag=nige] speed 5 7 true")
          randomTeleportPlayer(player);
        }
      }
  }

  function manualReviveLogic() {
    world.afterEvents.entityHurt.subscribe((event) => {
        const { hurtEntity, damageSource } = event;
        // 攻撃者が存在しない場合は終了
        if (!damageSource || !damageSource.damagingEntity) return;

        const attacker = damageSource.damagingEntity;

        if (!(attacker instanceof Player)) return;

        // ✅ 正しく EquipmentSlot.Mainhand を使用
        const heldItem = attacker.getComponent("equippable")?.getEquipment(EquipmentSlot.Mainhand);
        // 使用されたアイテムが 'additem:kanabou' でない場合は終了
        console.warn("✅ 右手アイテム:", heldItem?.typeId);

        if (!heldItem || heldItem.typeId !== "minecraft:tripwire_hook") return;
        const player = hurtEntity
        if (!(player instanceof Player)) return;
        const tofreeplayer = !player.hasTag("oni") && player.hasTag("injail");
        if (!tofreeplayer) return;
        try {
            player.removeTag("injail");
            randomTeleportPlayer(player)
            const inventory = attacker.getComponent("minecraft:inventory")?.container;
            if (inventory) {
              for (let i = 0; i < inventory.size; i++) {
                const item = inventory.getItem(i);
                if (item && item.typeId === "minecraft:tripwire_hook") {
                  item.amount -= 1;
                  if (item.amount <= 0) {
                    inventory.setItem(i, undefined);
                  } else {
                    inventory.setItem(i, item);
                  }
                  break;
                }
              }
            }
        } catch (e) {
            console.warn("⚠️ タグ付与エラー:", e);
        }
    });
  }
}
