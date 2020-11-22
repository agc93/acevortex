import * as React from 'react';
import { connect } from 'react-redux';
import * as Redux from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { withTranslation } from 'react-i18next';
import { Toggle, ComponentEx, More, util, tooltip } from 'vortex-api';
import { enableAdvancedInstaller, enableInstallReadmes, Features, enableFileNameFix, Settings, enableSaveBackups, setMaximumBackupSaves } from './actions';
import { IState } from 'vortex-api/lib/types/api';
import { FormControl, HelpBlock, FormGroup, ControlLabel } from 'react-bootstrap';
import { setMaxDownloads } from 'vortex-api/lib/actions';
import { DefaultBackupPath } from '../saves/saveManager';

interface IBaseProps {
    t: any
}

interface IConnectedProps {
    enableBackups: boolean;
    maxBackupSaves: number;
}

interface IActionProps {
    onEnableBackups: (enable: boolean) => void;
    onSetMaxSaves: (maxSaves: number) => void;
}

type IProps = IConnectedProps & IActionProps & IBaseProps;

class SaveSettings extends ComponentEx<IProps, {}> {

    public render(): JSX.Element {
        const { t, enableBackups, onEnableBackups, maxBackupSaves, onSetMaxSaves } = this.props;
        return (
            <form>
                <FormGroup>
                    <ControlLabel>{t('Automatic Save Backups')}</ControlLabel>
                    <HelpBlock>
                        {t('Use the options below to enable and control the automatic backup of your AC7 save file. This is a preview feature and you should still manually back up your save for now!')}
                    </HelpBlock>
                    <Toggle
                        checked={enableBackups}
                        onToggle={onEnableBackups}
                    >
                        {t("Enable Automatic Save Backups")}
                        <More id='ac7-backups' name={t("Enable Automatic Save Backups")}>
                            {t("Vortex can automatically back up your AC7 save file to another directory on your PC when deploying mods or launching the game. This can be useful if you're using complex mods or are worried about corrupting your save file. Only enable this if you know what you're doing!")}
                        </More>
                    </Toggle>
                    <div style={{ display: 'flex' }}>
                        <span className='av-range-label'>Maximum backups to keep: <strong>{maxBackupSaves}</strong></span>
                        <FormControl
                            type='range'
                            value={maxBackupSaves}
                            min={0}
                            max={10}
                            onChange={this.onSetMaxSaves}
                            disabled={!enableBackups}
                            />
                    </div>
                    <div>
                        <tooltip.Button
                            tooltip={t('Open directory used for backups')}
                            id='ac7-open-backups'
                            onClick={this.openBackupPath}
                            style={{ marginLeft: 5 }}
                        >
                            {t('Open Save Backups Path')}
                        </tooltip.Button>
                    </div>
                </FormGroup>
            </form>
        );
    }

    private onSetMaxSaves = (evt) => {
        const { onSetMaxSaves } = this.props;
        onSetMaxSaves(evt.currentTarget.value);
    }

    private openBackupPath = () => {
        util.opn(DefaultBackupPath());
    }
}


function mapStateToProps(state: IState): IConnectedProps {
    return {
        enableBackups: Features.saveBackupsEnabled(state),
        maxBackupSaves: Settings.maxBackups(state)
    };
}

function mapDispatchToProps(dispatch: ThunkDispatch<any, null, Redux.Action>): IActionProps {
    return {
        onEnableBackups: (enable: boolean) => dispatch(enableSaveBackups(enable)),
        onSetMaxSaves: (max: number) => dispatch(setMaximumBackupSaves(max))
    }
}

export default
    withTranslation(['acevortex', 'game-acecombat7skiesunknown'])(connect(mapStateToProps, mapDispatchToProps)(SaveSettings));
