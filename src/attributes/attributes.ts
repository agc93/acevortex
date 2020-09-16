import { ITableAttribute, IMod } from "vortex-api/lib/types/api";
import { util } from "vortex-api";

export const tableAttributes: {[name: string]: ITableAttribute} = {
    skins: {
        id: 'acev-skin',
        placement: 'detail',
        name: 'Skin(s)',
        help: 'The skins included in this mod (if any).',
        edit: {},
        isToggleable: true,
        isSortable: true
    },
    installedPaks: {
        id: 'acev-paks',
        placement: 'detail',
        name: 'Installed files',
        help: 'Which specific files from the mod were installed',
        edit: {},
        isToggleable: true,
        isSortable: false
    }
}

const slotNames = {
    "00": "Osea",
    "01": "Erusea",
    "02": "Special",
    "03": "Mage",
    "04": "Spare",
    "05": "Strider",
    // "06": "Slot 7 (DLC)",
    // "07": "Slot 8 (DLC)"
};

/**
 * For anyone who comes looking, this is *deliberately* covering as **few** cases as possible.
 * Given we are not validating this in the base game, we only want to cover objectively confusing cases here.
 */
const specialAircraftNames = {
    "a10a": "A-10C",
    "f18f": "F/A-18F",
    "f104av": "Avril F-104",
    "m21b": "MiG-21",
    "m29a": "MiG-29",
    "m31b": "MiG-31",
    "mr2k": "Mirage",
    "mrgn": "ADFX-01",
    "pkfa": "Su-57",
    "rflm": "Rafale M",
    "su30": "SU-30M2", //this is capitalised to match the fallback behaviour
    "typn": "Typhoon",
    "zoef": "ADF-01"
}

export function getSlotName(slotIdent: string) {
    var knownName = slotNames[slotIdent];
    if (knownName) {
        return knownName;
    } else {
        return /[a-z]/.test(slotIdent)
            ? `NPC ${slotIdent}`
            : ` Slot ${Number.parseInt(slotIdent, 10) + 1} ⭐`;
    }
}
export function getAircraftName(aircraftIdent: string): string {
    var knownName = specialAircraftNames[aircraftIdent];
    if (knownName) {
        return knownName;
    } else {
        var basicName = aircraftIdent.toUpperCase();
        var firstNum = basicName.replace(/(\d+)/g, '-$&');
        return firstNum;
    }
    
}

export function getSkinName (mod: IMod) {
    return util.getSafe<string[]>(mod.attributes, ['skinSlots'], [])
        .map(sl => sl.split('|'))
        .map(segs => `${getAircraftName(segs[0])} (${getSlotName(segs[1])})`)
        .join(', ');
}