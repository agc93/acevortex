import path = require('path');
import { fs, log, util, selectors } from "vortex-api";
import { IExtensionContext, IDiscoveryResult, IState, ISupportedResult, ProgressDelegate, IInstallResult, IExtensionApi, IGameStoreEntry, IDialogResult, ICheckbox } from 'vortex-api/lib/types/api';
import { InstructionType, IInstruction } from 'vortex-api/lib/extensions/mod_management/types/IInstallResult';
import { UnrealGameHelper, ProfileClient } from "vortex-ext-common";

import { groupBy } from "./util";

export const GAME_ID = 'acecombat7skiesunknown'
export const STEAMAPP_ID = 502500;
const MOD_FILE_EXT = ".pak";
const unreal: UnrealGameHelper = new UnrealGameHelper(GAME_ID);

export const PROFILE_SETTINGS = {
    AllowUnknown: 'bs_allow_unknown'
};

let GAME_PATH = '';
const relModPath = path.join('Game', 'Content', 'Paks', '~mods');

export type GroupedPaths = { [key: string]: string[] }


export function findGame() {
    return util.GameStoreHelper.findByAppId(STEAMAPP_ID.toString())
        .then((game: IGameStoreEntry) => game.gamePath);
}

//This is the main function Vortex will run when detecting the game extension. 
function main(context: IExtensionContext) {
    // unreal = new UnrealGameHelper(GAME_ID);
    unreal.enableFallback = () => new ProfileClient(context.api.store).getProfileSetting(PROFILE_SETTINGS.AllowUnknown, false);
    context.once(() => {
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
            SteamAPPId: STEAMAPP_ID.toString(),
            gamepath: GAME_PATH
        },
        details: {
            steamAppId: STEAMAPP_ID
        }
    });

    context.registerInstaller(
        'ac7-pakmods',
        25,
        unreal.testSupportedContent,
        (files, destination, gameId, progress) => installContent(context.api, files, destination, gameId)
    );

    // addProfileFeatures(context);
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
async function installContent(api: IExtensionApi, files: string[], destinationPath: string, gameId: string): Promise<IInstallResult> {
    log('debug', `running acevortex installer. [${gameId}]`, { files, destinationPath });
    //basically need to keep descending until we find a reliable indicator of mod root
    const allPaks = files.filter(file => path.extname(file).toLowerCase() === MOD_FILE_EXT);
    const uniquePakRoots = groupBy(allPaks, (pakPath) => {
        return path.dirname(pakPath);
    });
    /* log('debug', 'separated pak roots');
    log('debug', JSON.stringify(uniquePakRoots)); */
    var keys = Object.keys(uniquePakRoots);
    if (!uniquePakRoots || keys.length == 0) {
        log('warn', "Couldn't find reliable root indicator in file list!");
        return Promise.reject();
    } else if (keys.length == 1) {
        if (keys[0].length > 1) {
            return await installMultipleModArchive(api, keys, uniquePakRoots, files);
        } else {
            return unreal.installContent(files, destinationPath, gameId, null);
        }
    } else if (keys.length > 1) {
        var result: IDialogResult = await api.showDialog(
            'question',
            'Multiple mod files detected',
            {
                text: `The mod package you are installing appears to contain multiple nested mod packages! We found ${keys.length} mod locations in the archive.\n\nYou can either cancel now and verify the mod is packaged correctly, or attempt to install all of them together. This will probably cause conflicts!\n\nAlternatively, you can select only the paths you want to install from below and choose Install Selected to install all paks from only those folders.`,
                checkboxes: keys.map(k => {
                    return {
                        id: k,
                        text: `${path.basename(k)} (${uniquePakRoots[k].length} files)`
                    } as ICheckbox
                }),
                options: {
                    translated: false
                }
            },
            [
                { label: 'Cancel' },
                { label: 'Install Selected' },
                { label: 'Install All_plural' }
            ]
        );
        if (result.action == 'Cancel') {
            return Promise.reject('Multiple mod paths located!');
        } else if (result.action == 'Install All' || result.action == 'Install All_plural') {
            log('debug', JSON.stringify(result.input));
            let instructions: IInstruction[] = [];
            instructions = keys.flatMap(k => buildInstructions(files, uniquePakRoots[k][0]));
            return Promise.resolve({ instructions });
        } else if (result.action == 'Install Selected') {
            var selections: string[] = Object.keys(result.input).filter(s => result.input[s]);
            // var selectedRoots = selections.map(sv => parseInt(sv.split('-')[1])).map(si => uniquePakRoots[si]);
            return await installMultipleModArchive(api, selections, uniquePakRoots, files);
        }
    }
}

async function installMultipleModArchive(api: IExtensionApi, selections: string[], pakRoots: GroupedPaths, files: string[]): Promise<IInstallResult> {
    var selectedRoots = selections.map(sk => pakRoots[sk]);
    if (selectedRoots.some(sr => sr.length > 1)) {

        var pakResult: IDialogResult = await api.showDialog(
            'question',
            'Multiple mod files detected',
            {
                text: `The package paths you have selected also contain multiple mod files!\n\nYou can individually disable any mod files below to skip installing them or choose Install to continue with all the selected files.`,
                checkboxes: selectedRoots.flatMap(sr => sr).map(k => {
                    return {
                        id: k,
                        text: `${path.basename(k)}`,
                        value: true
                    } as ICheckbox
                })
            },
            [
                { label: 'Cancel' },
                { label: 'Install Selected' }
            ]
        );
        if (pakResult.action == 'Cancel') {
            return Promise.reject('Multiple mod paths located!');
        } else if (pakResult.action == 'Install Selected') {
            let instructions: IInstruction[] = [];
            var modSelections: string[] = Object.keys(pakResult.input).filter(s => pakResult.input[s]);
            instructions = selections.flatMap(k => buildInstructions(files, pakRoots[k][0], (file) => modSelections.map(s => path.basename(s)).some(bn => bn == path.basename(file))));
            return Promise.resolve({ instructions });
        }
    } else {
        var instructions = selections.flatMap(k => buildInstructions(files, pakRoots[k][0]));
        return Promise.resolve({ instructions });
    }
}

function buildInstructions(files: string[], modFile: string, sourceFilter?: (sourceFile: string) => boolean) {
    const idx = modFile.indexOf(path.basename(modFile));
    const rootPath = path.dirname(modFile);
    let filtered = files.filter(file =>
        ((file.indexOf(rootPath) !== -1)
            && (!file.endsWith(path.sep))));

    // const filtered = files.filter(file => (((root == "." ? true : (file.indexOf(root) !== -1)) && (!file.endsWith(path.sep)))));
    if (sourceFilter) {
        filtered = filtered.filter(ff => sourceFilter(ff));
    }
    log('debug', 'filtered extraneous files', { root: rootPath, candidates: filtered });
    const instructions = filtered.map(file => {
        // const destination = file.substr(firstType.indexOf(path.basename(root)) + root.length).replace(/^\\+/g, '');
        const destination = path.join(file.substr(idx));
        return {
            type: 'copy' as InstructionType,
            source: file,
            destination: destination
        }
    });
    return instructions;
}

/**
 * Registers the default profile features for AceVortex.
 *
 * @remarks
 * For reasons entirely unclear to me, this works correctly, adding the features at startup. 
 * Moving this logic into another module (i.e. switching to the static `ProfileClient` call) will fail to add features. 
 * I have no idea why.
 *
 * @param context - The extension context.
 *
 * @beta
 * 
 */
function addProfileFeatures(context: IExtensionContext) {
    context.registerProfileFeature(
        PROFILE_SETTINGS.AllowUnknown,
        'boolean',
        'settings',
        'Allow Unrecognised Mods',
        'Enables installing of unrecognised mods (i.e. non-pak files)',
        () => selectors.activeGameId(context.api.store.getState()) === GAME_ID);
}

module.exports = {
    default: main,
};