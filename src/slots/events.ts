import { IDeployedFile, IExtensionApi, IMod } from "vortex-api/lib/types/api";
import { util } from "vortex-api";
import { GAME_ID, ModList } from "..";

type SlotList = {[key: string]: IMod[]};

export function checkForConflicts(api: IExtensionApi, files: IDeployedFile[]) {
    var mods = util.getSafe<ModList>(api.getState().persistent, ['mods', GAME_ID], {});
    var deployedMods = [...new Set(files.map(f => mods[f.source]))];
    var skinMods = Object.values(deployedMods)
        .filter(m => util.getSafe(m.attributes, ['skinSlots'], undefined));
    // var slotRoots = groupBy(skinMods, (mod) => util.getSafe(mod.attributes, ['skinSlots'], ''));
    var slotRoots = buildConflictList(skinMods);
    if (Object.keys(slotRoots).some(rk => slotRoots[rk].length > 1)) {
        var conflicts = removeNonConflicts(slotRoots);
        api.sendNotification({
            'type': 'warning',
            title: 'Potential skin slot conflict!',
            message: 'It looks like more than one mod is changing the same skin slot.',
            actions: [
                {
                    title: 'See More',
                    action: (dismiss) => {
                        api.showDialog('error', 'Potential skin slot conflict!', {
                            text: "It looks like more than one of the mods that was just deployed are modifying the same skin slot! This can lead to unexpected results and is probably not what you're looking for. The mods and slots in question are shown below.\n\nIf the mod came with multiple options for skin slots, you can try reinstalling and installing only some of the mod files.",
                            options: {
                                wrap: false
                            },
                            message: renderConflictList(conflicts)
                        }, [
                            {label: 'Continue', action: () => dismiss()}
                        ]);
                    }
                }
            ]
        });
    }
}

function renderConflictList(conflicts: SlotList): string {
    return Object.keys(conflicts)
        .map(ck => {
            return `Slot ${ck.replace('|', '/')}: ${conflicts[ck].map(m => util.getSafe(m.attributes, ['modName'], m.id)).join(', ')}`
        })
        .join('\n');
}

function buildConflictList(mods: IMod[]): SlotList {
    var slots: {[key: string]: IMod[]} = {};
    var allSlots = mods.reduce(function (slots, mod) {

        var skins = util.getSafe<string[]>(mod.attributes, ['skinSlots'], []);
        if (skins) {
            skins.forEach(sk => {
                // If the key doesn't exist yet, create it
                if (!slots.hasOwnProperty(sk)) {
                    slots[sk] = [];
                }
                slots[sk].push(mod);
            });
        }
		// Return the object to the next item in the loop
		return slots;
    }, slots);
    return allSlots;
    // return removeNonConflicts(allSlots);
}

function removeNonConflicts(slots: SlotList) {
    for (var slot in slots) {
        if (slots[slot].length < 2) {
            delete slots[slot];
        }
    }
    return slots;
}