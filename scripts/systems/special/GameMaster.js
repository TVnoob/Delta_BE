// scripts/systems/special/GameMaster.js
import { system, world, ItemStack } from "@minecraft/server";
import { resetAllTimerMap } from "./autoreloadrc.js";
import { resetCatchCounts } from "../JailSystems/jailSystem.js"
import { getAllBanList } from "./BanList.js";
import { GAME_STATE_KEY, TERRORIST, getAdminList } from "../consts.js";

// ゲーム状態を管理する変数
let gameStarted = false;
export function gamemastersystemscript(){
  system.afterEvents.scriptEventReceive.subscribe((event) => {
    const { id, message, sourceEntity } = event;
    const player = event.player;
    const allPlayers = world.getPlayers();
    const banList = getAllBanList();

    if (id === "bgc:start") {
    resetCatchCounts();
    try {
      const players = world.getPlayers();
      for (const player of players) {
        const inv = player.getComponent("minecraft:inventory")?.container;
        if (inv) {
          player.runCommand("clear @s");
          for (let i = 0; i < inv.size; i++) {
            inv.setItem(i, undefined);
          }
        }
      }
    } catch (err) {
      console.warn("⚠️ インベントリクリア中にエラー:", err);
    }
      if (gameStarted) return;
      gameStarted = true;

      resetAllTimerMap();

      // ゲーム開始時の処理
      const players = world.getPlayers();
      const adminList = getAdminList();

      const configRaw = world.getDynamicProperty("config_data");
      let totalOniCount = 1;
      if (configRaw) {
        try {
          const config = JSON.parse(configRaw);
          totalOniCount = config.oniCount ?? 1;
        } catch {}
      }

      // プレイヤーをシャッフルして鬼を選出
      console.warn(`🔍 所持プレイヤー数: ${players.length}, OniCount: ${totalOniCount}`);
      const eligiblePlayers = allPlayers.filter(p => !banList.includes(p.name) && !TERRORIST.includes(p.name));
      const shuffled = shuffleArray(eligiblePlayers);
      const oniPlayers = shuffled.slice(0, totalOniCount);
      const playerPlayers = shuffled.slice(totalOniCount);

      // BanList に含まれるプレイヤーは観戦者に強制変更
      for (const banned of allPlayers) {
        if (banList.includes(banned.name)) {
          banned.addTag("banned");
          banned.runCommand("gamemode spectator");
          banned.sendMessage("§c あなたはこのゲームへの参加が禁止されています");
        }
      }

      // 鬼と逃げるプレイヤーにタグを付与
    for (const player of oniPlayers) {
      const chest = new ItemStack("minecraft:leather_chestplate", 1);
      player.runCommand("xp -1000L @a");
      player.addTag("oni");
      player.runCommand('replaceitem entity @s slot.armor.head 0 minecraft:netherite_helmet 1 0 {"item_lock":{"mode":"lock_in_slot"}}');
      player.runCommand(`replaceitem entity @s slot.armor.chest 0 minecraft:netherite_chestplate 1 0 {"item_lock":{"mode":"lock_in_slot"}}`);
      player.runCommand('replaceitem entity @s slot.armor.legs 0 minecraft:netherite_leggings 1 0 {"item_lock":{"mode":"lock_in_slot"}}');
      player.runCommand('replaceitem entity @s slot.armor.feet 0 minecraft:netherite_boots 1 0 {"item_lock":{"mode":"lock_in_slot"}}');
      world.sendMessage(`鬼: §l§c${player.name}§r`);

      // ✅ ロビー座標の取得
      const configRaw = world.getDynamicProperty("config_data");
      let lobby = null;
      try {
        const config = JSON.parse(configRaw ?? "{}");
        lobby = config.lobby;
      } catch (e) {
        console.warn("⚠️ config_data 読み込み失敗:", e);
      }
      player.teleport(lobby);

      const userItem = new ItemStack("minecraft:stick", 1);

      const inventoryComp = player.getComponent("minecraft:inventory");
      if (inventoryComp) {
        const inv = inventoryComp.container;
        inv.setItem(0, userItem);
        player.runCommand('replaceitem entity @s slot.hotbar 0 minecraft:stick 1 0 {"item_lock":{"mode":"lock_in_slot"}}');
      }
    }
      for (const player of playerPlayers) {
        player.addTag("nige");
        player.runCommand("effect @s[tag=nige] invisibility 20 1 true")
        player.runCommand("effect @s[tag=nige] speed 10 5 true")
      }

      // 鬼はアドベンチャーモードで待機
      for (const player of oniPlayers) {
        player.runCommand("gamemode adventure");
        player.runCommand("xp -1000L");
      }

      // 20秒後に逃げるプレイヤーをアドベンチャーモードに変更し、鬼を解放
      system.runTimeout(() => {
        for (const player of playerPlayers) {
          player.runCommand("gamemode adventure");
        }

        // 鬼をロビーからゲームエリアへテレポート
        const configJson = world.getDynamicProperty("config_data");
        if (configJson) {
          try {
            const config = JSON.parse(configJson);
            const oniSpawn = config.oniSpawn;
            if (oniSpawn) {
              for (const player of oniPlayers) {
                player.teleport(oniSpawn);
              }
            }
          } catch (e) {
            console.warn("鬼スポーンの取得エラー:", e);
          }
        }
      }, 20 * 20); // 20秒後（20tick * 20）

      // ゲーム状態を保存
      world.setDynamicProperty(GAME_STATE_KEY, JSON.stringify({ started: true }));
    }
   else if (id === "bgc:end") {
    if (!gameStarted) return;
    gameStarted = false;
  
    const players = world.getPlayers();
    const adminList = getAdminList();

    for (const player of players) {
      // タグとインベントリをクリア
      const tags = player.getTags();
      for (const tag of tags) {
        player.removeTag(tag);
      }
  
      const container = player.getComponent("minecraft:inventory")?.container;
      if (container) {
        for (let i = 0; i < container.size; i++) {
          container.setItem(i, undefined);
        }
        player.runCommand("clear @s");
      }

      // ✅ ロビー座標の取得
      const configRaw = world.getDynamicProperty("config_data");
      let lobby = null;
      try {
        const config = JSON.parse(configRaw ?? "{}");
        lobby = config.lobby;
      } catch (e) {
        console.warn("⚠️ config_data 読み込み失敗:", e);
      }
      player.teleport(lobby);
  
      // ✅ ロビーにTP
      if (lobby && typeof lobby.x === "number") {
        player.runCommand("gamemode 2");
        player.runCommand("xp -1000L");
        player.teleport(lobby);
        player.sendMessage("§a🏁 ロビーに戻されました");
      }
  
      // ✅ アイテム付与
      const inv = player.getComponent("minecraft:inventory")?.container;
      if (adminList.includes(player.name)) {
        inv.setItem(0, new ItemStack("additem:setusystem", 1));
        player.runCommand('replaceitem entity @s slot.hotbar 0 additem:setusystem 1 0 {"item_lock":{"mode":"lock_in_slot"}}');
        inv.setItem(1, new ItemStack("additem:verified_admin", 1));
      } else {
        inv.setItem(0, new ItemStack("additem:setusystem", 1));
        player.runCommand('replaceitem entity @s slot.hotbar 0 additem:setusystem 1 0 {"item_lock":{"mode":"lock_in_slot"}}');
      }
    }
  
    world.setDynamicProperty(GAME_STATE_KEY, JSON.stringify({ started: false }));
  }

  // 配列をシャッフルする関数
  function shuffleArray(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
)}
