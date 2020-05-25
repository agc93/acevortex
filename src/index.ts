import path = require('path');
import { fs, log, util, selectors } from "vortex-api";
import { IExtensionContext, IDiscoveryResult, IState, ISupportedResult, ProgressDelegate, IInstallResult, IExtensionApi, IGameStoreEntry } from 'vortex-api/lib/types/api';
import { InstructionType, IInstruction } from 'vortex-api/lib/extensions/mod_management/types/IInstallResult';
import { UnrealGameHelper, ProfileClient } from "vortex-ext-common";

// import { ProfileClient } from "./profileClient";

export const GAME_ID = 'acecombat7skiesunknown'
export const STEAMAPP_ID = 502500;
const MOD_FILE_EXT = ".pak";
const unreal: UnrealGameHelper = new UnrealGameHelper(GAME_ID);

export const PROFILE_SETTINGS = {
    AllowUnknown: 'bs_allow_unknown'
};

let GAME_PATH = '';
const relModPath = path.join('Game', 'Content', 'Paks', '~mods');


export function findGame() {
    return util.GameStoreHelper.findByAppId(STEAMAPP_ID.toString())
      .then((game: IGameStoreEntry) => game.gamePath);
}

//This is the main function Vortex will run when detecting the game extension. 
function main(context : IExtensionContext) {
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
        unreal.installContent
    );

    addProfileFeatures(context);
    return true
}

/**
 * Preps the Ace Combat installation for mod deployment.
 * @remarks
 * Other than creating the "~mods" folder, this is a basic sanity check only.
 *
 * @param discovery - The details for the discovered game.
 */
function prepareForModding(discovery : IDiscoveryResult) {
    GAME_PATH = discovery.path;
    return fs.ensureDirWritableAsync(path.join(discovery.path, relModPath),
        () => Promise.resolve());
}

/**
 * Checks if the given mod files can be installed with this extension.
 * @remarks
 * This will currently accept any `pak` file as long as its for the right game
 *
 * @param files - The list of mod files to test against
 * @param gameId - The current game ID to test against. Short-circuits if not fellsealarbitersmark.
 */
function testSupportedContent(files: string[], gameId: string): Promise<ISupportedResult> {
    log('debug', `files: ${files.length} [${files[0]}]`);
    // We only support .pak mods for now.
    // We're also not excluding FOMODs (as some do) since I don't think they exist at current
    let supported = (gameId === GAME_ID) &&
        (files.find(file => path.extname(file).toLowerCase() === MOD_FILE_EXT) !== undefined);
    return Promise.resolve({
        supported,
        requiredFiles: [],
    });
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
    log('debug', `running acevortex installer. [${gameId}]`, {files, destinationPath});
    //basically need to keep descending until we find a reliable indicator of mod root
    const modFile = files.find(file => path.extname(file).toLowerCase() === MOD_FILE_EXT);
    if (modFile) {
        // we found a pak file, so disregard anything outside of that
        const idx = modFile.indexOf(path.basename(modFile));
        const rootPath = path.dirname(modFile);
        const filtered = files.filter(file => 
            ((file.indexOf(rootPath) !== -1) 
            && (!file.endsWith(path.sep))));
        
        // const filtered = files.filter(file => (((root == "." ? true : (file.indexOf(root) !== -1)) && (!file.endsWith(path.sep)))));
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
        return Promise.resolve({ instructions });
    } else {
        log('warn', "Couldn't find reliable root indicator in file list. Falling back to basic installation!");
        var allowInstall = new ProfileClient(api.store).getProfileSetting(PROFILE_SETTINGS.AllowUnknown, false);
        if (allowInstall) {
            log('warn', 'Allowing installation of unrecognised mod because of allow_unknown');
            var instructions = files.map((file: string): IInstruction => {
                return {
                    type: 'copy',
                    source: file,
                    destination: file,
                };
            });
            return Promise.resolve({instructions});
        } else {
            return Promise.reject();
        }
    }
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