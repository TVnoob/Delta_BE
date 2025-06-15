// scripts/ssytems/GameSystems/PlayerSpawn.js
import { world, ItemStack, system } from "@minecraft/server";
import { getOwnerNames, getAdminList } from "../consts.js";

export const OWNER_NAME = ["world_owner"];

let creatorInitialized = false;

export function playerjoinevent01okk(){
    world.afterEvents.playerSpawn.subscribe((event) => {
    const players = world.getPlayers();
    const player = event.player;
    const name = player.name;

    if (!player || creatorInitialized) return;
    let owners = getOwnerNames();

    if (!owners.includes(name)) {
        owners.push(name);
        world.setDynamicProperty("owner_names", JSON.stringify(owners));
        console.warn( "作動済み" );
        player.sendMessage("§a✅ あなたがオーナーとして登録されました。");
    }

    creatorInitialized = true;

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

    // ✅ ロビー座標の取得
    const configRaw = world.getDynamicProperty("config_data");
    let lobby = null;
    try {
    const config = JSON.parse(configRaw ?? "{}");
    lobby = config.lobby;
    } catch (e) {
    console.warn("⚠️ config_data 読み込み失敗:", e);
    }
    try {
    player.teleport(lobby);
    } catch (e){
    console.warn("ロビー位置が設定されてないため終了", e);
    }

    // インベントリクリア
    const inv = player.getComponent("minecraft:inventory")?.container;
    if (inv) {
        player.runCommand("clear @s");
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
        player.runCommand('replaceitem entity @s slot.hotbar 0 additem:setusystem 1 0 {"item_lock":{"mode":"lock_in_slot"}}');
        inv.setItem(1, adminItem);
    } else {
        const userItem = new ItemStack("additem:setusystem", 1);
        inv.setItem(0, userItem);
        player.runCommand('replaceitem entity @s slot.hotbar 0 additem:setusystem 1 0 {"item_lock":{"mode":"lock_in_slot"}}');
    }
    });
}
