import { log } from "vortex-api";
import { IExtensionApi } from "vortex-api/lib/types/api";
import { Settings } from "../settings";
import { SaveGameManager, DefaultBackupPath } from "./saveManager";
import * as nfs from 'fs';


export function runSaveBackup(api: IExtensionApi) {
    try {
        var mgr = new SaveGameManager(DefaultBackupPath);
        var backup = mgr.backupCurrentSave(undefined, api.getState());
        if (backup) {
            api.sendNotification({type: 'success', title: 'Game save backed up!', message: `Backup file created: ${backup.fileName}`, displayMS: 4000, allowSuppress: true});
        } else {
            api.sendNotification({type: 'warning', title: 'Game save not backed up!', message: "Your save was not successfully backed up!"});
        }
    } catch (error) {
        api.sendNotification({type: 'error', title: 'Error backing up current save!', message: (error as Error).message});
    }
}

export function runCleanBackups(api: IExtensionApi) {
    var max = Settings.maxBackups(api.getState());
    var mgr = new SaveGameManager(DefaultBackupPath);
    if (max > 0) {
        var allBackups = mgr.getBackups(api.getState());
        if (allBackups && allBackups.length > max) {
            var removals = allBackups.sort((a, b) => b.created.getTime() - a.created.getTime()).slice(5);
            log('info', `preparing to remove ${removals.length} backups`, {removals: removals.map(r => r.fileName)});
            removals.forEach(sf => {
                log('debug', 'removing aged backup', {file: sf.fullPath});
                nfs.unlinkSync(sf.fullPath);
            });
        }
    }
}