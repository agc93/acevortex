import path = require('path');
import { fs, log, util, selectors } from "vortex-api";
import { IExtensionContext, IDiscoveryResult, IState, ISupportedResult, ProgressDelegate, IInstallResult, IExtensionApi, IGameStoreEntry, IDialogResult, ICheckbox, IMod, IDeployedFile } from 'vortex-api/lib/types/api';
import { UnrealGameHelper, ProfileClient, isActiveGame } from "vortex-ext-common";

import { groupBy, isGameManaged } from "./util";
import { GeneralSettings, settingsReducer, TweakSettings } from "./settings";
import { checkForConflicts, updateSlots } from "./slots";
import { advancedInstall } from "./install";
import { tableAttributes, getSkinName, installedFilesRenderer } from "./attributes";

export const GAME_ID = 'acecombat7skiesunknown'
export const I18N_NAMESPACE = 'game-acecombat7skiesunknown';
export const STEAMAPP_ID = 502500;
export const MOD_FILE_EXT = ".pak";
export const unreal: UnrealGameHelper = new UnrealGameHelper(GAME_ID);

export type ModList = { [modId: string]: IMod; };

const relModPath = path.join('Game', 'Content', 'Paks', '~mods');

export type GroupedPaths = { [key: string]: string[] }


export function findGame() {
    return util.GameStoreHelper.findByAppId(STEAMAPP_ID.toString())
        .then((game: IGameStoreEntry) => game.gamePath);
}

//This is the main function Vortex will run when detecting the game extension. 
function main(context: IExtensionContext) {
    const isAceCombatManaged = (): boolean => {
        return isGameManaged(context.api);
    }
    const refreshSkins = (instanceIds: string[]) => {
        const state = context.api.store.getState();
        const gameId = selectors.activeGameId(state);
        var mods = instanceIds.map(i => {
            return util.getSafe<IMod>(state.persistent.mods, [gameId, i], undefined);
        })
        .filter(m => m);
        updateSlots(context.api, mods)
      };

    context.registerSettings('Interface', GeneralSettings, undefined, isAceCombatManaged, 101);
    context.registerSettings('Workarounds', TweakSettings, () => {t: context.api.translate}, isAceCombatManaged, 101);
    context.registerReducer(['settings', 'acevortex'], settingsReducer);
    context.once(() => {
        try {
            var langContent = fs.readFileSync(path.join(__dirname, 'language.json'), {encoding: 'utf-8'});
            context.api.getI18n().addResources('en', I18N_NAMESPACE, JSON.parse(langContent));
            // using require here instead of `fs` means that webpack will bundle the language file for us
            // unfortunately this doesn't seem to actually work for some reason.
            // context.api.getI18n().addResources('en', I18N_NAMESPACE, require('./language.json'));
        } catch { }
        util.installIconSet('acevortex', path.join(__dirname, 'icons.svg'));
        context.api.onAsync('did-deploy', (profileId: string, deployment: { [typeId: string]: IDeployedFile[] }) => {
            if (isActiveGame(context.api, GAME_ID)) {
                log('debug', 'running skin slot event handler');
                checkForConflicts(context.api, Object.values(deployment).flat());
            }
            return Promise.resolve();
        });
    });
    context.registerGame({
        name: "Ace Combat 7: Skies Unknown",
        mergeMods: true,
        logo: 'gameart.png',
        supportedTools: [],
        executable: () => 'Ace7Game.exe',
        requiredFiles: [
            'Ace7Game.exe'
        ],
        id: GAME_ID,
        queryPath: findGame,
        queryModPath: () => relModPath,
        setup: (discovery: IDiscoveryResult) => {
            log('debug', 'running acevortex setup')
            unreal.prepareforModding(discovery, relModPath)
            // prepareForModding(discovery);
        },
        environment: {
            SteamAPPId: STEAMAPP_ID.toString()
        },
        details: {
            steamAppId: STEAMAPP_ID
        }
    });

    context.registerAction('mods-action-icons', 201, 'aircraft', {},
                         'Refresh Skins', refreshSkins, () => isActiveGame(context.api, GAME_ID));
    context.registerAction('mods-multirow-actions', 201, 'aircraft', {},
                         'Refresh Skins', refreshSkins, () => isActiveGame(context.api, GAME_ID));

    context.registerInstaller(
        'ac7-pakmods',
        25,
        unreal.testSupportedContent,
        (files, destination, gameId, progress) => installContent(context.api, files, destination, gameId, progress)
    );

    context.registerTableAttribute('mods', {
        ...tableAttributes.installedPaks,
        calc: (mod: IMod) => util.getSafe(mod.attributes, ['installedPaks'], []),
        condition: () => isActiveGame(context.api, GAME_ID),
        customRenderer: (mod: IMod) => installedFilesRenderer(context.api, mod)
    });
    context.registerTableAttribute('mods', {
        ...tableAttributes.skins,
        calc: (mod: IMod) => getSkinName(mod),
        condition: () => selectors.activeGameId(context.api.getState()) === GAME_ID,
    });

    return true
}

/**
 * The main extension installer implementation.
 * @remarks
 * The main logic for this was mostly borrowed from agc93/beatvortex and Nexus-Mods/vortex-games so thanks respective authors
 *
 * @param api - The extension API.
 * @param files - The list of mod files for installation
 * @param gameId - The game ID for installation (should only ever be GAME_ID)
 * @param progressDelegate - Delegate for reporting progress (not currently used)
 *
 * @returns Install instructions for mapping mod files to output location.
 */
async function installContent(api: IExtensionApi, files: string[], destinationPath: string, gameId: string, progress: ProgressDelegate): Promise<IInstallResult> {
    log('debug', `running acevortex installer. [${gameId}]`, { files, destinationPath });
    var enableAdvanced = util.getSafe(api.getState().settings, ['acevortex', 'installer'], true);
    if (!enableAdvanced) {
        return unreal.installContent(files, destinationPath, gameId, progress);
    } else {
        return advancedInstall(api, files, destinationPath, gameId, progress);
    }
    
}



module.exports = {
    default: main,
};