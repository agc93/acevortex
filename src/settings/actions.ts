import { createAction } from 'redux-act';
import { util } from "vortex-api";
import { IReducerSpec, IState } from 'vortex-api/lib/types/api';

/*
 * enable the more advanced installer
 */
export const enableAdvancedInstaller =
    createAction('AC7_ENABLE_INSTALLER', (enable: boolean) => enable);

export const enableInstallReadmes =
    createAction('AC7_INSTALL_READMES', (enable: boolean) => enable);

export const enableFileNameFix =
    createAction('AC7_INSTALL_RENAMER', (enable: boolean) => enable);

/**
 * reducer for extension settings
 */
export const settingsReducer: IReducerSpec = {
    reducers: {
        [enableAdvancedInstaller as any]: (state, payload: boolean) => {
            return util.setSafe(state, ['installer'], payload);
        },
        [enableInstallReadmes as any]: (state, payload: boolean) => {
            return util.setSafe(state, ['installReadme'], payload);
        },
        [enableFileNameFix as any]: (state, payload: boolean) => {
            return util.setSafe(state, ['renameFiles'], payload);
        }
    },
    defaults: {
        installer: true,
        installReadme: true,
        renameFiles: true
    }
};

export const Features = {
    isInstallerEnabled: (state: IState): boolean => {
        return util.getSafe(state.settings, ['acevortex', 'installer'], true);
    },    
    readmesEnabled: (state: IState): boolean => {
        return util.getSafe(state.settings, ['acevortex', 'installReadme'], true);
    },
    isRenamingEnabled: (state: IState): boolean => {
        return util.getSafe(state.settings, ['acevortex', 'renameFiles'], true);
    }
}