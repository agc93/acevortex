
import { UserPaths } from "../util";
import * as nfs from "fs";
import * as path from "path";
import { log, util } from "vortex-api";
import { IExtensionApi, IState } from "vortex-api/lib/types/api";

const DefaultSaveFileName = "ACE7Save.sav";

export const DefaultBackupPath: () => string = () => path.join(UserPaths.userDataPath(), 'BackupSaves');

export class SaveGameManager {
    private _saveGameDir: string;
    private _backupPath: string;
    /**
     *
     */
    constructor(backupPath: () => string) {
        this._saveGameDir = UserPaths.saveGamesPath();
        this._backupPath = backupPath();
        if (!nfs.existsSync(this._backupPath)) {
            nfs.mkdirSync(this._backupPath, {recursive: true});
        }
    }

    getCurrentSave(): SaveFile|null {
        var currentPath = path.join(this._saveGameDir, DefaultSaveFileName);
        var fi = nfs.lstatSync(currentPath);
        if (nfs.existsSync(currentPath) && fi.isFile()) {
            var save = new SaveFile(currentPath, fi);
            return save;
        } else {
            return null;
        }
    }

    backupCurrentSave(nameFunc?: () => string, state?: IState): SaveFile|null {
        if (state && util.getSafe(state.session, ['base', 'toolsRunning'], 0) > 0) {
            log('warn', 'Tools are running, aborting backup');
            throw new Error('It looks like the game or other tools are currently running. Aborting save backup!');
        }
        var current = this.getCurrentSave();
        var now = new Date();
        nameFunc = nameFunc ?? (() => `${now.toISOString().slice(0,10)}-${now.getTime()}.sav`);
        var target = path.join(this._backupPath, nameFunc());
        if (current) {
            log('debug', 'detected current save, proceeding to back up save', {target, current: current.fullPath});
            nfs.copyFileSync(current.fullPath, target);
            if (nfs.existsSync(target)) {
                return new SaveFile(target, nfs.lstatSync(target));
            }
        } else {
            log('warn', 'could not detect current save game. aborting.');
        }
    }

    getBackups(state?: IState): SaveFile[] {
        if (state && util.getSafe(state.session, ['base', 'toolsRunning'], 0) > 0) {
            log('warn', 'Tools are running, aborting backup list');
            throw new Error('It looks like the game or other tools are currently running. Aborting save backup!');
        }
        var files = nfs.readdirSync(this._backupPath, {withFileTypes: true}).filter(fe => fe.isFile()).filter(f => path.extname(f.name) == ".sav");
        return files.map(f => path.join(this._backupPath, f.name)).map(sf => new SaveFile(sf, nfs.lstatSync(sf)));
    }
}

export class SaveFile {
    /**
     *
     */
    constructor(filePath: string, file?: nfs.Stats) {
        this.fileName = path.basename(filePath);
        this.fullPath = filePath;
        this.isDefault = this.fileName == DefaultSaveFileName;
        if (file) {
            this.modified = file.mtime;
            this.created = file.birthtime;
        }
    }
    fileName: string;
    fullPath: string;
    modified: Date;
    created: Date;
    isDefault: boolean;
}