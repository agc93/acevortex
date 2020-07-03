import { createAction } from 'redux-act';
// import { safeCreateAction } from 'vortex-api/lib/actions/safeCreateAction';
import { util, actions } from "vortex-api";
import { IReducerSpec } from 'vortex-api/lib/types/api';
// import { ILinkHandling } from './settings';

/*
 * enable the more advanced installer
 */
export const enableAdvancedInstaller =
    createAction('AC7_ENABLE_INSTALLER', (enable: boolean) => enable);

/**
 * reducer for extension settings
 */
export const settingsReducer: IReducerSpec = {
    reducers: {
        [enableAdvancedInstaller as any]: (state, payload: boolean) => {
            return util.setSafe(state, ['installer'], payload)
        }
    },
    defaults: {
        installer: true
    }
};