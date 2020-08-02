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
    "05": "Strider"
};

function getSlotName(slotIdent: string) {
    var knownName = slotNames[slotIdent];
    if (knownName) {
        return knownName;
    } else {
        return /[a-z]/.test(slotIdent)
            ? `NPC ${slotIdent}`
            : `0${Number.parseInt(slotIdent) + 1}`;
    }
}

export function getSkinName (mod: IMod) {
    return util.getSafe<string[]>(mod.attributes, ['skinSlots'], [])
        .map(sl => sl.split('|'))
        .map(segs => `${segs[0].toUpperCase()} (${getSlotName(segs[1])})`)
        .join(', ');
}