import { IExtensionApi, ProgressDelegate, IInstallResult, IDialogResult, ICheckbox, IInstruction } from "vortex-api/lib/types/api";
import path = require("path");
import { log, util } from "vortex-api";
import { groupBy } from "./util";
import { MOD_FILE_EXT, GroupedPaths, unreal } from ".";
import { InstructionType } from "vortex-api/lib/extensions/mod_management/types/IInstallResult";
import { SlotReader } from "./slots";
import { getModName } from "vortex-ext-common/dist/util";
import { Features } from "./settings";

export async function advancedInstall(api: IExtensionApi, files: string[], destinationPath: string, gameId: string, progress: ProgressDelegate): Promise<IInstallResult> {
    //basically need to keep descending until we find a reliable indicator of mod root
    const allPaks = files.filter(file => path.extname(file).toLowerCase() === MOD_FILE_EXT);
    const uniquePakRoots = groupBy(allPaks, (pakPath) => {
        return path.dirname(pakPath);
    });
    let installInstructions: IInstruction[] = [];
    var keys = Object.keys(uniquePakRoots);
    /* if (allPaks.length > 100 || keys.length > 9 ) {
        var confirmResult: IDialogResult = await api.showDialog('info', 'Large mod detected!', {
            text: largeModWarningText
        }, [
            {label: 'Cancel'},
            {label: 'Continue'}
        ]);
        if (confirmResult.action == 'Cancel') {
            return Promise.reject();
        }
    } */
    log('debug', 'separated pak roots', {roots: keys});
    if (!uniquePakRoots || keys.length == 0) {
        log('warn', "Couldn't find reliable root indicator in file list!");
        return Promise.reject();
    } else if (keys.length == 1) {
        if (uniquePakRoots[keys[0]].length > 1) {
            installInstructions = await installMultipleModArchive(api, keys, uniquePakRoots, files);
        } else {
            // var unrealResult = await unreal.installContent(files, destinationPath, gameId, null);
            // installInstructions = unrealResult.instructions;
            installInstructions = buildFlatInstructions(api, files, keys[0]);
        }
    } else if (keys.length > 1) {
        installInstructions = await installFromMultiplePaths(api, uniquePakRoots, files);
    }
    let instructions = installInstructions;
    // let instructions = installInstructions.concat(getSlots(installInstructions, destinationPath) ?? []);
    if (Features.readmesEnabled(api.getState())) {
        instructions = instructions.concat(getReadme(files, destinationPath) ?? []);
    }
    instructions = instructions.concat(getPaks(installInstructions) ?? []);
    return Promise.resolve({instructions})
}

async function installFromMultiplePaths(api: IExtensionApi, pakRoots: GroupedPaths, files: string[]): Promise<IInstruction[]> {
    var keys = Object.keys(pakRoots);
    var result: IDialogResult = await api.showDialog(
        'question',
        'Multiple mod files detected',
        {
            text: `The mod package you are installing appears to contain multiple nested mod packages! We found ${keys.length} mod locations in the archive.\n\nYou can either cancel now and verify the mod is packaged correctly, or attempt to install all of them together. This will probably cause conflicts!\n\nAlternatively, you can select only the paths you want to install from below and choose Install Selected to install paks from only those folders.`,
            checkboxes: keys.map(k => {
                return {
                    id: k,
                    text: `${path.basename(k)} (${pakRoots[k].length} files)`
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
        instructions = keys.flatMap(k => buildFlatInstructions(api, files, k));
        return Promise.resolve(instructions);
    } else if (result.action == 'Install Selected') {
        var selections: string[] = Object.keys(result.input).filter(s => result.input[s]);
        // var selectedRoots = selections.map(sv => parseInt(sv.split('-')[1])).map(si => uniquePakRoots[si]);
        return await installMultipleModArchive(api, selections, pakRoots, files);
    }
}

async function installMultipleModArchive(api: IExtensionApi, selections: string[], pakRoots: GroupedPaths, files: string[]): Promise<IInstruction[]> {
    var selectedRoots = selections.map(sk => pakRoots[sk]);
    if (selectedRoots.some(sr => sr.length > 1)) {

        var pakResult: IDialogResult = await api.showDialog(
            'question',
            'Multiple mod files detected',
            {
                text: `The mod package or paths you are installing contain multiple mod files!\n\nYou can individually disable any mod files below to skip installing them or choose Install Selected to continue with all the selected files.`,
                checkboxes: selectedRoots.flatMap(sr => sr).map(k => {
                    return {
                        id: k,
                        text: `${k}`,
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
            instructions = selections.flatMap(k => buildFlatInstructions(api, files, k, (file) => modSelections.map(s => path.basename(s)).some(bn => bn == path.basename(file))));
            return Promise.resolve(instructions);
        }
    } else {
        var instructions = selections.flatMap(k => buildInstructions(files, pakRoots[k][0]));
        return Promise.resolve(instructions);
    }
}

function buildFlatInstructions(api: IExtensionApi, files: string[], rootPath: string, sourceFilter?: (sourceFile: string) => boolean) {
    log('debug', 'building installer instructions', {rootPath, files});
    let filtered = files.filter(f => (!f.endsWith(path.sep)) && path.dirname(f) == rootPath);
    if (sourceFilter) {
        filtered = filtered.filter(ff => sourceFilter(ff));
    }
    log('debug', 'filtered extraneous files', { root: rootPath, candidates: filtered });
    const instructions = filtered.map(file => {
        // const destination = file.substr(firstType.indexOf(path.basename(root)) + root.length).replace(/^\\+/g, '');
        var destination = rootPath == '.' ? file : path.join(file.substr(file.indexOf(rootPath) + rootPath.length + 1));
        if (path.extname(destination).toLowerCase() == MOD_FILE_EXT && !destination.endsWith('_P.pak')) {
            if (Features.isRenamingEnabled(api.getState())) {
                log('debug', 'detected non-suffixed PAK file!', {destination});
                destination = destination.replace('.pak', '_P.pak');
            }
        }
        return {
            type: 'copy' as InstructionType,
            source: file,
            destination: destination
        }
    });
    return instructions;
}

function buildInstructions(files: string[], modFile: string, sourceFilter?: (sourceFile: string) => boolean) {
    const idx = modFile.indexOf(path.basename(modFile));
    const rootPath = path.dirname(modFile);
    let filtered = files.filter(file =>
        ((file.indexOf(rootPath) !== -1)
            && (!file.endsWith(path.sep))));
    filtered = filtered.filter(f => path.relative(rootPath, f) == '');
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

function getPaks(instructions: IInstruction[]): IInstruction[] {
    var paks = instructions
        .filter(i => path.extname(i.source).toLowerCase() == MOD_FILE_EXT)
        .map(pf => pf.source);
    if (paks) {
        return [
            {
                type: 'attribute',
                key: 'installedPaks',
                value: paks as any
            }
        ]
    };
}

function getReadme(files: string[], destinationPath: string) : IInstruction[] {
    try {
        if (files.filter(f => path.extname(f) == '.txt').length == 1) {
            //we've got just one txt file, assume it's a README
            var textFile = files.find(f => path.extname(f) == '.txt');
            log('debug', 'found txt file in archive, installing as README', {filePath: textFile});
            var modName = getModName(destinationPath);
            return [
                {
                    type: 'copy',
                    source: textFile,
                    destination: path.join('README', util.deriveInstallName(modName, {}) + '.txt')
                }
            ]
        }
    } catch {
        //ignored
        return [];
    }
}

const largeModWarningText: string = "The mod you're trying to install includes a large number of available files and no installer files!\n\nVortex will prompt you for which files you want to install but be aware that this mod archive might contain a lot of files and folders to choose from. You may want to check the mod's description in case there are any special installation instructions you should know about.\n\nThere's unfortunately nothing Vortex can do about this as this can only be resolved by the mod author.";