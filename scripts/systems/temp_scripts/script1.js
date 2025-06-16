import { world, system, ItemStack, EquipmentSlot } from "@minecraft/server";

export function script1runcommand() {
  system.runInterval(() => {
    for (const player of world.getPlayers()) {
      const mainHand = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);

      if (mainHand && mainHand.typeId === "minecraft:stick") {
        player.runCommand("effect @s speed 1 1 true");
      }
    }
  }, 5); // 1秒ごとにチェック（20tick）
}
