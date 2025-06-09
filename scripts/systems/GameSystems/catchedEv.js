// scripts/catchedEv.js
import { world, Player, EquipmentSlot } from "@minecraft/server";

export function registerCatchedEvents() {
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

        if (!heldItem || heldItem.typeId !== "minecraft:stick") return;

        try {
            hurtEntity.addTag("catched");
        } catch (e) {
            console.warn("⚠️ タグ付与エラー:", e);
        }
    });
}

