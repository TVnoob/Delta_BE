import { world, PlayerPermissionLevel } from "@minecraft/server";

// import { <consts> } from "../consts.js";
export const DEVELOPERS = ["SCPzaidann 1958"];
export const ADMIN_LIST_KEY = "verified_admins";
export const JAIL_POS_KEY = "jail_positions";
export const REVIVE_LIMIT_KEY = "revive_limit";
export const GAME_STATE_KEY = "game_state";
export const CONFIG_KEY = "config_data";
export const CHEST_DATA_KEY = "rootchest_data_map";
export const TERRORIST = ["おこそ"];

export function getAdminList() {
    const GODS = getGods();
    try {
    const raw = world.getDynamicProperty(ADMIN_LIST_KEY);
    const parsed = JSON.parse(raw ?? "[]");
    for (const name of GODS) {
        if (!parsed.includes(name)) parsed.push(name);
    }
    return [...new Set(parsed)];
    } catch (e) {
    console.warn(`⚠️ 管理者リストの解析エラー: ${e}`);
    return [...GODS]; // fallback
    }
}

export function getOwnerNames() {
  try {
    const raw = world.getDynamicProperty("owner_names");
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
// const GODS = getGods();
export function getGods() {
  return [...new Set([...DEVELOPERS, ...getOwnerNames()])];
}

export function isOp(player) {
  return player?.playerPermissionLevel === PlayerPermissionLevel.Operator;
}
