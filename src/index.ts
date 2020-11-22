import path = require('path');
import { fs, log, util, selectors } from "vortex-api";
import { IExtensionContext, IDiscoveryResult, ProgressDelegate, IInstallResult, IExtensionApi, IGameStoreEntry, IMod, IDeployedFile, ITestResult, IModTable } from 'vortex-api/lib/types/api';
import { UnrealGameHelper, ProfileClient, isActiveGame } from "vortex-ext-common";

import { getUserConfigPath, isGameManaged } from "./util";
import { GeneralSettings, settingsReducer, TweakSettings, Features, BackupSettings, Settings } from "./settings";
import { checkForConflicts, updateSlots, AircraftView } from "./slots";
import { SaveGameManager, runCleanBackups, runSaveBackup } from "./saves";
import { advancedInstall } from "./install";
import { tableAttributes, skinsAttribute, installedFilesRenderer } from "./attributes";
import { debug } from 'console';

export const GAME_ID = 'acecombat7skiesunknown'
export const I18N_NAMESPACE = 'game-acecombat7skiesunknown';
export const STEAMAPP_ID = 502500;
export const MOD_FILE_EXT = ".pak";
export const unreal: UnrealGameHelper = new UnrealGameHelper(GAME_ID);

export type ModList = { [modId: string]: IMod; };

const relModPath = path.join('Game', 'Content', 'Paks', '~mods');

export type GroupedPaths = { [key: string]: string[] }

export type RunningTools = {[key: string]: {exePath: string, started: any, pid: number, exclusive: boolean}};


export function findGame() {
    return util.GameStoreHelper.findByAppId(STEAMAPP_ID.toString())
        .then((game: IGameStoreEntry) => game.gamePath);
}

//This is the main function Vortex will run when detecting the game extension. 
function main(context: IExtensionContext) {
    const isAceCombatManaged = (): boolean => {
        return isGameManaged(context.api);
    }
    const refreshSkins = (instanceIds: string[], clobber: boolean = true) => {
        const state = context.api.store.getState();
        const gameId = selectors.activeGameId(state);
        var mods = instanceIds.map(i => {
            return util.getSafe<IMod>(state.persistent.mods, [gameId, i], undefined);
        })
        .filter(m => m);
        updateSlots(context.api, mods, clobber)
      };

    context.registerSettings('Interface', GeneralSettings, undefined, isAceCombatManaged, 101);
    context.registerSettings('Workarounds', TweakSettings, () => {t: context.api.translate}, isAceCombatManaged, 101);
    context.registerSettings('Workarounds', BackupSettings, () => {t: context.api.translate}, () => isActiveGame(context.api, GAME_ID), 102);
    context.registerReducer(['settings', 'acevortex'], settingsReducer);
    context.once(() => {
        context.api.setStylesheet('av-common', path.join(__dirname, 'acevortex.scss'));
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
        context.api.onAsync('did-deploy', (profileId: string, deployment: { [typeId: string]: IDeployedFile[] }): Promise<any> => {
            if (isActiveGame(context.api, GAME_ID) && Features.saveBackupsEnabled(context.api.getState())) {
                log('debug', 'running backup event handler');
                runSaveBackup(context.api);
            }
            return Promise.resolve();
        });
        context.api.events.on('gamemode-activated', (gameId: string): void => {
            var state = context.api.getState();
            if (gameId && gameId == GAME_ID && Features.saveBackupsEnabled(state)) {
                runCleanBackups(context.api);
            }
        });
        context.api.onStateChange(['session', 'base', 'toolsRunning'], async (previous: RunningTools, current: RunningTools) => {
            handleGameLaunch(context.api, previous, current);
        });
        context.api.onStateChange(
            ['persistent', 'mods'],
            onModsChanged(context.api));
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
        },
        requiresLauncher: getLauncher,
        environment: {
            SteamAPPId: STEAMAPP_ID.toString()
        },
        details: {
            steamAppId: STEAMAPP_ID,
            settingsPath: () => getUserConfigPath()
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
    // context.registerTableAttribute('mods', {
    //     ...tableAttributes.skins,
    //     calc: (mod: IMod) => getSkinName(mod),
    //     condition: () => selectors.activeGameId(context.api.getState()) === GAME_ID,
    // });
    context.registerTableAttribute('mods', skinsAttribute(context.api));

    context.registerMainPage('aircraft', 'Skins', AircraftView, {
        group: 'per-game',
        visible: () => {
            return (isActiveGame(context.api, GAME_ID))
        },
        props: () => ({api: context.api})
    });

    return true
}

async function getLauncher(gamePath: string): Promise<{ launcher: string, addInfo?: any }> {
    return gamePath.includes('steamapps') ? {launcher: 'steam'} : undefined;
}

async function handleGameLaunch(api: IExtensionApi, previous: RunningTools, current: RunningTools): Promise<void> {
    // if ("tool has been launched" && "tool is AC7")
    if ((Object.keys(current) > Object.keys(previous)) && Object.keys(current).some(a => a == "ace7game.exe")) {
        if (Features.saveBackupsEnabled(api.getState())) {
            log('debug', 'detected game launch, running save backup');
            runSaveBackup(api)
        }
    }
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
    // var enableAdvanced = util.getSafe(api.getState().settings, ['acevortex', 'installer'], true);
    var enableAdvanced = Features.isInstallerEnabled(api.getState());
    if (!enableAdvanced) {
        return unreal.installContent(files, destinationPath, gameId, progress);
    } else {
        return advancedInstall(api, files, destinationPath, gameId, progress);
    }
}

function onModsChanged(api: IExtensionApi) {
    if (!isActiveGame(api, GAME_ID)) {
        return;
    }
    let lastModTable = api.store.getState().persistent.mods;
    log('debug', 'scheduling skin update on mods changed')

    const updateDebouncer: util.Debouncer = new util.Debouncer(
        (newModTable: IModTable) => {
            if ((lastModTable === undefined) || (newModTable === undefined)) {
                return;
            }
            const state = api.store.getState();
            // ensure anything changed for the actiave game
            if ((lastModTable[GAME_ID] !== newModTable[GAME_ID])
                && (lastModTable[GAME_ID] !== undefined)
                && (newModTable[GAME_ID] !== undefined)) {
                var newIds = Object.keys(newModTable[GAME_ID]).filter(x => !Object.keys(lastModTable[GAME_ID]).includes(x));
                if (!newIds || newIds.length == 0) {
                    return Promise.resolve();
                }
                log('debug', 'invoking AC slot updates', { newIds })
                return updateSlots(api, newIds.map(i => newModTable[GAME_ID][i]), false);
            }
        }, 5000);

    // we can't pass oldValue to the debouncer because that would only include the state
    // for the last time the debouncer is triggered, missing all other updates
    return (oldValue: IModTable, newValue: IModTable) =>
        updateDebouncer.schedule((err: Error) => log('debug', 'Updated skin slots for AC7 mods', { err }), newValue);

}

module.exports = {
    default: main,
};