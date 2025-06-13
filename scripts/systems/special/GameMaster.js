// scripts/systems/special/GameMaster.js
import { system, world, ItemStack } from "@minecraft/server";
import { resetAllTimerMap } from "./autoreloadrc.js";
import { resetCatchCounts } from "./jailSystem.js"
import { YougetOutTheGame, TERRORIST } from "./BanList.js"
import { CREATORS, ADMIN_LIST_KEY, JAIL_POS_KEY, GAME_STATE_KEY } from "../consts.js";

const banList = YougetOutTheGame();

// ゲーム状態を管理する変数
let gameStarted = false;
export function gamemastersystemscript(){
  system.afterEvents.scriptEventReceive.subscribe((event) => {
    const { id, message, sourceEntity } = event;
    const player = event.player;

    if (id === "bgc:start") {
    resetCatchCounts();
    try {
      const players = world.getPlayers();
      for (const player of players) {
        const inv = player.getComponent("minecraft:inventory")?.container;
        if (inv) {
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
      const allPlayers = world.getPlayers();

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
          banned.runCommand("gamemode spectator");
          banned.sendMessage("§c You are bannend! get out!");
        }
      }

      // 鬼と逃げるプレイヤーにタグを付与
    for (const player of oniPlayers) {
      player.runCommand("xp -1000L @a");
      player.addTag("oni");
      world.sendMessage(`鬼: §l§c${player.name}§r`);

      const userItem = new ItemStack("minecraft:stick", 1);

      const inventoryComp = player.getComponent("minecraft:inventory");
      if (inventoryComp) {
        const inv = inventoryComp.container;
        inv.setItem(0, userItem);
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

  } else if (id === "bgc:end") {
    if (!gameStarted) return;
    gameStarted = false;
  
    const players = world.getPlayers();
    const adminList = getAdminList();
  
    // ✅ ロビー座標の取得（ループの外）
    const configRaw = world.getDynamicProperty("config_data");
    let lobby = null;
    try {
      const config = JSON.parse(configRaw ?? "{}");
      lobby = config.lobby;
    } catch (e) {
      console.warn("⚠️ config_data 読み込み失敗:", e);
    }
  
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
      }
  
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
        inv.setItem(1, new ItemStack("additem:verified_admin", 1));
      } else {
        inv.setItem(0, new ItemStack("additem:setusystem", 1));
      }
    }
  
    world.setDynamicProperty(GAME_STATE_KEY, JSON.stringify({ started: false }));
  }

  // プレイヤーがワールドに参加したときの処理
  world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;
    if (!player) {
      console.warn("⛔ playerSpawnイベントにプレイヤーが含まれていません。");
      return;
    }

    console.warn("[DEBUG] プレイヤー生成:", player.name);

    // タグ削除
    const tags = player.getTags();
    for (const tag of tags) {
      player.removeTag(tag);
    }

    // "player" タグを追加
    player.addTag("player");

    // インベントリクリア
    const inv = player.getComponent("minecraft:inventory")?.container;
    if (inv) {
      for (let i = 0; i < inv.size; i++) {
        inv.setItem(i, undefined);
      }
    }

    // 管理者確認とアイテム付与
    const adminList = getAdminList();
    if (adminList.includes(player.name)) {
      const userItem = new ItemStack("additem:setusystem", 1)
      const adminItem = new ItemStack("additem:verified_admin", 1);
      inv.setItem(0, userItem)
      inv.setItem(1, adminItem);
    } else {
      const userItem = new ItemStack("additem:setusystem", 1);
      inv.setItem(0, userItem);
    }
  });



  // 管理者リストを取得する関数
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
