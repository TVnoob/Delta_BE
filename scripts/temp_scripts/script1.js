import { world, system, ItemStack } from "@minecraft/server";

export function script1runcommand(){
    system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const mainHandItem = player.getComponent("minecraft:equippable")?.getEquipment("mainhand");

        if (mainHandItem instanceof ItemStack) {
        const itemId = mainHandItem.typeId;
        const customData = mainHandItem.getComponent("<itemID>")?.data;

        if (itemId === "<itemID>" && customData?.my_item === true) {
            player.runCommand("<command>");
        }
        }
    }
    },);
}
