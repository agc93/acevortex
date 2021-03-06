import * as React from 'react';
import { connect } from 'react-redux';
import * as Redux from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { withTranslation } from 'react-i18next';
import { Toggle, ComponentEx, More, util } from 'vortex-api';
import { enableAdvancedInstaller, enableInstallReadmes, Features, enableFileNameFix } from './actions';
import { IState } from 'vortex-api/lib/types/api';
const { HelpBlock, FormGroup, ControlLabel } = require('react-bootstrap');

interface IBaseProps {
    t: any
}

interface IConnectedProps {
    enableAdvanced: boolean;
    enableReadmes: boolean;
    enableRenaming: boolean;
}

interface IActionProps {
    onEnableAdvanced: (enable: boolean) => void;
    onEnableReadmes: (enable: boolean) => void;
    onEnableRenaming: (enable: boolean) => void;
}

type IProps = IConnectedProps & IActionProps & IBaseProps;

class GeneralSettings extends ComponentEx<IProps, {}> {

    public render(): JSX.Element {
        const { t, enableAdvanced, onEnableAdvanced, enableReadmes, onEnableReadmes, enableRenaming, onEnableRenaming } = this.props;
        return (
            <form>
                <FormGroup>
                    <ControlLabel>{t('Enable Advanced Installer for AC7')}</ControlLabel>
                    <HelpBlock>
                        {t('Use the option below to disable the interactive installer for AC7 mods and fall back to using a basic installer. Only turn this off if you are having problems with the default installer!')}
                    </HelpBlock>
                    <Toggle
                        checked={enableAdvanced}
                        onToggle={onEnableAdvanced}
                    >
                        {t("Enable Interactive Installer")}
                        <More id='ac7-advanced' name='Advanced Interactive Installer'>
                            {t("When installing archives with more than one mod file, AceVortex will attempt to walk you through installing only the files you need. You can use this option to turn off this behaviour and simply install the first directory containing mod files it finds in the archive. Only change this if you know what you're doing!")}
                        </More>
                    </Toggle>
                    <Toggle
                        checked={enableReadmes}
                        onToggle={onEnableReadmes}
                    >
                        {t("Enable Installing README files")}
                        <More id='ac7-readmes' name='Install README Files'>
                            {t("When installing mods, we will try and detect and install README files as well as the actual .pak mod files. This can be useful if you are having trouble with a specific mod, but could also cause other issues. Turn this off to prevent installing README files with mods.")}
                        </More>
                    </Toggle>
                    <Toggle
                        checked={enableRenaming}
                        onToggle={onEnableRenaming}
                    >
                        {t("Enable fixing file names")}
                        <More id='ac7-renamer' name='Fix PAK file names'>
                            {t("Ace Combat 7 requires any mod files that modify post-launch content (planes, slots, etc) to have a file name ending in `_P.pak`. Some mods haven't updated for this, so we can automatically rename them when you install.\nTurn this off to force mod files to keep their old (potentially incompatible) names.")}
                        </More>
                    </Toggle>
                </FormGroup>
            </form>
        );
    }
}


function mapStateToProps(state: IState): IConnectedProps {
    return {
        enableAdvanced: Features.isInstallerEnabled(state),
        enableReadmes: Features.readmesEnabled(state),
        enableRenaming: Features.isRenamingEnabled(state)
    };
}

function mapDispatchToProps(dispatch: ThunkDispatch<any, null, Redux.Action>): IActionProps {
    return {
        onEnableAdvanced: (enable: boolean) => dispatch(enableAdvancedInstaller(enable)),
        onEnableReadmes: (enable: boolean) => dispatch(enableInstallReadmes(enable)),
        onEnableRenaming: (enable: boolean) => dispatch(enableFileNameFix(enable))
    }
}

export default
    withTranslation(['common', 'game-acecombat7skiesunknown'])(connect(mapStateToProps, mapDispatchToProps)(GeneralSettings));
