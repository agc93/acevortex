import { getUserConfigPath } from "./util";
import { fs } from "vortex-api";
import ini = require('@nodecraft/ini');

/**
 * Apply the texture fix options.
 * 
 * @remarks
 * - This function DOES NOT catch errors!
 * 
 * @param configFile (optional) path to the configuration file to fix
 */
export function applyTextureFix(configFile?: string): Promise<boolean> {
    var configPath = configFile ?? getUserConfigPath('Engine.ini');
    let changed = false;
    return fs.readFileAsync(configPath, {encoding: 'utf8'})
        .then((content: string) => {
            var config = ini.parse(content, {inlineArrays: true});
            if (config["SystemSettings"] && config["SystemSettings"]["r.Streaming.FullyLoadUsedTextures"]) {
                return Promise.resolve()
            } else {
                return fs.copyAsync(configPath, configPath + '.orig')
                    .then(() => {
                        config["SystemSettings"] = {
                            "r.Streaming.FullyLoadUsedTextures": "True",
                            "r.Streaming.UseAllMips": "True"
                        };
                        changed = true;
                        return fs.writeFileAsync(configPath + '.temp', ini.stringify(config, {inlineArrays: true}))
                            .then(() => fs.unlinkAsync(configPath))
                            .then(() => fs.renameAsync(configPath + '.temp', configPath));
                });
            }
        })
        .then(() => Promise.resolve(changed));    
}

export function applyGraphicsTweak(configFile?: string): Promise<boolean> {
    var configPath = configFile ?? getUserConfigPath('Engine.ini');
    let changed = false;
    return fs.readFileAsync(configPath, {encoding: 'utf8'})
        .then((content: string) => {
            var config = ini.parse(content, {inlineArrays: true});
            if (config["SystemSettings"] && config["SystemSettings"]["r.ViewDistanceScale"]) {
                return Promise.resolve()
            } else {
                return fs.copyAsync(configPath, configPath + '.orig')
                    .then(() => {
                        config["SystemSettings"] = {
                            "r.MaxAnisotropy": "16",
                            "r.Streaming.UseAllMips": "1",
                            "r.Streaming.FullyLoadUsedTextures": "1",
                            "r.Streaming.HLODStrategy": "2",
                            "r.Streaming.FramesForFullUpdate": "0",
                            "r.Streaming.UseFixedPoolSize": "0",
                            "r.Streaming.PoolSize": "0",
                            "r.MipMapLODBias": "-1",
                            "r.DisableLODFade": "True",
                            "r.SceneColorFringe.Max": "0",
                            "r.SceneColorFringeQuality": "0",
                            "r.ViewDistanceScale": "6",
                            "r.SkeletalMeshLODBias": "-2",
                            "r.StaticMeshLODDistanceScale":"0.1"
                        };
                        changed = true;
                        return fs.writeFileAsync(configPath + '.temp', ini.stringify(config, {inlineArrays: true}))
                            .then(() => fs.unlinkAsync(configPath))
                            .then(() => fs.renameAsync(configPath + '.temp', configPath));
                });
            }
        })
        .then(() => Promise.resolve(changed));    
}