// scripts/systems/special/GameMaster.js
import { system, world, ItemStack } from "@minecraft/server";
import { resetAllTimerMap } from "./autoreloadrc.js";

const CREATORS = ["SCPzaidann 1958","Reiya4384"];
const ADMIN_LIST_KEY = "admin_list";
const JAIL_POS_KEY = "jail_positions";
const GAME_STATE_KEY = "game_state";

// ゲーム状態を管理する変数
let gameStarted = false;
export function gamemastersystemscript(){
  system.afterEvents.scriptEventReceive.subscribe((event) => {
    const { id, message, sourceEntity } = event;
    const player = event.player;

    if (id === "bgc:start") {
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

      const configRaw = world.getDynamicProperty("config_data");
      let totalOniCount = 1;
      if (configRaw) {
        try {
          const config = JSON.parse(configRaw);
          totalOniCount = config.oniCount ?? 1;
        } catch {}
      }

      // プレイヤーをシャッフルして鬼を選出
      const shuffledPlayers = shuffleArray(players);
      const oniPlayers = shuffledPlayers.slice(0, totalOniCount);
      const playerPlayers = shuffledPlayers.slice(totalOniCount);

      // 鬼と逃げるプレイヤーにタグを付与
      for (const player of oniPlayers) {
        player.addTag("oni");

        const userItem = new ItemStack("minecraft:stick", 1)

        inv.setItem(0, userItem)
      }
      for (const player of playerPlayers) {
        player.addTag("nige");
      }

      // 鬼はアドベンチャーモードで待機
      for (const player of oniPlayers) {
        player.runCommand("gamemode adventure");
      }

      // 逃げるプレイヤーはスペクテイターモードで開始地点を選択
      for (const player of playerPlayers) {
        player.runCommand("gamemode adventure");
      }

      // 20秒後に逃げるプレイヤーをアドベンチャーモードに変更し、鬼を解放
      system.runTimeout(() => {
        for (const player of playerPlayers) {
          player.runCommand("gamemode adventure");
        }

        // 鬼をロビーからゲームエリアへテレポート
        const configRaw = world.getDynamicProperty(configRaw);
        if (configRaw) {
          try {
            const config = JSON.parse(configRaw);
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
      if (!gameStarted) return; // ゲームが開始されていない場合は無視
      gameStarted = false;

      // ゲーム終了時の処理
      const players = world.getPlayers();
      const adminList = getAdminList();

      for (const player of players) {
        // タグとインベントリをクリア
        const tags = player.getTags();
        for (const tag of tags) {
          player.removeTag(tag);
        }
        // インベントリクリア（推奨：APIベース）
        const container = player.getComponent("minecraft:inventory")?.container;
        if (container) {
          for (let i = 0; i < container.size; i++) {
            container.setItem(i, undefined);
          }
        }

        // アイテムを付与
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
      }

      // ゲーム状態をリセット
      world.setDynamicProperty(GAME_STATE_KEY, JSON.stringify({ started: false }));
    }
  });

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
