import * as React from 'react';
import { TFunction } from 'i18next';
import { ComponentEx, tooltip, types, util, More } from 'vortex-api';
import { IExtensionApi, IMod } from 'vortex-api/lib/types/api';
import { I18N_NAMESPACE } from '..';
import DetailOverlay from "./DetailOverlay";

interface IInstalledProps {
    mod: types.IMod;
    direction?: 'left'|'top'|'right'|'bottom';
    t: TFunction;
}

interface IComponentState {
    open: boolean;
}

class InstalledPaks extends ComponentEx<IInstalledProps, IComponentState> {

    public render() {
        const { mod, t } = this.props;
        const IconX: any = tooltip.Icon;
        var content: JSX.Element | JSX.Element[];
        var installedFiles = util.getSafe(mod.attributes, ['installedPaks'], []) as string[];
        var direction = this.props.direction ?? 'left';
        return <DetailOverlay 
            items={installedFiles} 
            direction={this.props.direction} 
            t={t}
            title="Installed PAK Files">
                <a>{t('{{count}} installed files', { count: installedFiles.length, ns: I18N_NAMESPACE })}</a>
            </DetailOverlay>
    }
}

export default InstalledPaks;

export function installedFilesRenderer(api: IExtensionApi, mod: IMod) {
    return <InstalledPaks mod={mod} t={api.translate} />;
}