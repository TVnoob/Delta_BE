// scripts/speedEvent.js
import { world } from "@minecraft/server";

export function registerSpeedItemEvents() {
  world.afterEvents.itemCompleteUse.subscribe((event) => {
    const itemStack = event.itemStack;
    const source = event.source;

    if (!itemStack || !source) {
      console.warn("⛔ missing item or source");
      return;
    }

    if (itemStack.typeId === "additem:sutaminamu") {
      try {
        // しゃがみ状態判定（コンポーネントから取得）
        const isSneaking = source.isSneaking;

        // 適用するモード（しゃがみか通常か）
        const selectedMode = isSneaking
          ? source.getDynamicProperty("custom_crouch_mode") ?? "resist"
          : source.getDynamicProperty("custom_speed_mode") ?? "speed(high)";

        const rawMap = world.getDynamicProperty("custom_effect_map") ?? "{}";
        const effectMap = JSON.parse(rawMap);

        const command = effectMap[selectedMode];

        if (command) {
          const result = source.runCommand(command);
          console.warn(`✅ コマンド実行結果(${selectedMode}):`, JSON.stringify(result));
        } else {
          console.warn(`⚠️ 未設定の効果モード: "${selectedMode}"`);
          source.sendMessage(`§c⚠️ "${selectedMode}" に対応する効果が未設定です。`);
        }
      } catch (e) {
        console.warn("⚠️ コマンド実行エラー:", e);
      }
    }
  });
}
