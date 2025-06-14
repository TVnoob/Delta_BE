// scripts/main.js
import { registerSpeedItemEvents } from "./systems/GameSystems/speedEnevt.js";
import { registerCatchedEvents } from "./systems/GameSystems/catchedEv.js";
import { script1runcommand } from "./temp_scripts/script1.js";
import {systemscript1} from "./systems/AdminSystem/adminControl.js";
import {systemscript2} from "./systems/AdminSystem/permissionGuard.js";
import {systemscript3} from "./systems/UserSystems/setUsystemUI.js";
import {jailSystem} from "./systems/special/jailSystem.js";
import {endGameSystem} from "./systems/GameSystems/endGameSystem.js";
import {gamemastersystemscript} from "./systems/special/GameMaster.js";
import {configUIHandler} from "./systems/AdminSystem/configUI.js";
import {reviveSystem} from "./systems/GameSystems/reviveSystem.js";
import { registerRootChestKitUI } from "./systems/rcuis/rootchestkitUI.js";
import { registerRootChestLibraryUI } from "./systems/rcuis/rootchestlib.js";
import { registerRootChestLoader } from "./systems/special/loadrc.js";
import { startRootChestAutoReload } from "./systems/special/autoreloadrc.js";
// import { banListSystem } from "./systems/special/BanList.js";
import { thisistruerandomTP } from "./systems/GameSystems/RandomTP.js"

thisistruerandomTP();
reviveSystem();
configUIHandler();
gamemastersystemscript();
endGameSystem();
jailSystem();
systemscript1();
systemscript2();
systemscript3();
registerSpeedItemEvents();
registerCatchedEvents();
startRootChestAutoReload();
registerRootChestLoader();
registerRootChestLibraryUI();
registerRootChestKitUI();
// banListSystem();
script1runcommand();