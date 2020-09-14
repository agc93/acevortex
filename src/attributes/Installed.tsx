import * as React from 'react';
import { TFunction } from 'i18next';
import { ComponentEx, tooltip, types, util, More } from 'vortex-api';
import { IExtensionApi, IMod } from 'vortex-api/lib/types/api';
import { I18N_NAMESPACE } from '..';
const { Overlay, Popover } = require('react-bootstrap');

interface IInstalledProps {
    mod: types.IMod;
    direction?: 'left'|'top'|'right'|'bottom';
    t: TFunction;
}

interface IComponentState {
    open: boolean;
}

class InstalledPaks extends ComponentEx<IInstalledProps, IComponentState> {
    private mRef: Element;

    constructor(props: IInstalledProps) {
        super(props);

        this.state = {
            open: false,
        };
    }

    public render() {
        const { mod, t } = this.props;
        const IconX: any = tooltip.Icon;
        var content: JSX.Element | JSX.Element[];
        var installedFiles = util.getSafe(mod.attributes, ['installedPaks'], []) as string[];
        var direction = this.props.direction ?? 'left';
        if (installedFiles.length == 0) {
            content = <div></div>
        } else {
            const popover = (
                <Popover id='popover-acev-paks'>
                    <div style={{ maxHeight: 700, overflowY: 'auto' }}>
                        <p>
                            <strong>Installed PAK files:</strong>
                        </p>
                        <ul>{installedFiles.map(p => <li>{p}</li>)}</ul>
                    </div>
                </Popover>
            );
            content = (
                <div>
                    <Overlay
                        rootClose
                        placement={direction}
                        onHide={this.hide}
                        show={this.state.open}
                        target={this.getRef}
                    >
                        {popover}
                    </Overlay>
                    <a ref={this.setRef} onClick={this.toggle}>
                        {t('{{count}} installed files', { count: installedFiles.length, ns: I18N_NAMESPACE })}
                    </a>
                </div>
            );
        }


        return (
            <div className='bs-attribute-icons'>
                {content}
            </div>
        );
    }

    private getRef = () => this.mRef;

    private setRef = (ref: Element) => {
        this.mRef = ref;
    }

    private hide = () => {
        this.setState({ open: false });
    }

    private toggle = () => {
        this.setState({ open: !this.state.open });
    }
}

export default InstalledPaks;

export function installedFilesRenderer(api: IExtensionApi, mod: IMod) {
    return <InstalledPaks mod={mod} t={api.translate} />;
}