import * as React from 'react';
import { connect } from 'react-redux';
import * as Redux from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { withTranslation } from 'react-i18next';
import { Toggle, ComponentEx, More, util, tooltip, actions as act } from 'vortex-api';
import { IState, DialogType, IDialogContent, DialogActions, IErrorOptions } from 'vortex-api/lib/types/api';
const { HelpBlock, FormGroup, ControlLabel } = require('react-bootstrap');
import { getUserConfigPath } from "../util";
import { applyTextureFix } from '../tweaks';

interface IBaseProps {
    t: any
}

interface IConnectedProps {
}

interface IActionProps {
    onDialog: (type: DialogType, title: string,
               content: IDialogContent, actions: DialogActions) => void;
    onShowError: (message: string, details: string | Error, options?: IErrorOptions) => void;
    onShowInfo: (message: string) => void;
  }

type IProps = IConnectedProps & IActionProps & IBaseProps;

class GeneralSettings extends ComponentEx<IProps, {}> {

    public render(): JSX.Element {
        const { t } = this.props;
        return (
            <form>
                <FormGroup>
                    <ControlLabel>{t('AC7 Configuration Tweaks')}</ControlLabel>
                    <HelpBlock>
                        {t('The tweaks below can fix some uncommon problems in AC7 mods. Use them at your own risk and you should be aware of what they do first!')}
                    </HelpBlock>
                    <div style={{ marginTop: 15 }}>
                        {t('Texture Loading Tweaks')}
                        <More id='more-ac7-texture-tweak' name={t('Texture Loading Tweaks')}>
                            {t('There are some oddities with how AC7 loads model textures that might lead to very blurry textures in custom skins. If this happens, it *might* help to enable some tweaks to the engine configuration file.')}
                        </More>
                        <tooltip.Button
                            tooltip={t('Patch')}
                            id='ac7-texture-fix'
                            onClick={this.textureFix}
                            style={{ marginLeft: 5 }}
                        >
                            {t('Attempt Patch')}
                        </tooltip.Button>
                    </div>
                </FormGroup>
            </form>
        );
    }

    private textureFix = () => {
        const { onDialog, onShowError } = this.props;
        var config = getUserConfigPath();
        onDialog('info', 'Applying Engine Configuration', {
            htmlText: '<p>If you are seeing very blurry text in installed custom skins, it <em>might</em> help to changes some settings in your engine configuration.</p><br/>'
                        + '<p>This tweak will change the <code>r.Streaming.FullyLoadUsedTextures</code> and <code>r.Streaming.UseAllMips</code> keys to true in your <code>Engine.ini</code> file.</p><br/>'
                        + `<p>This process will attempt to find and modify the configuration file at <code>${config}</code></p>`
            }, [
            { label: 'Cancel' },
            {
              label: 'Continue', action: () => {
                applyTextureFix(config)
                  .then((changed: boolean) => {
                    if (changed) {
                      onDialog('success', 'Success', {
                        text: 'Fix was applied.',
                      }, [ { label: 'Close' } ]);
                    } else {
                      onDialog('info', 'Nothing Changed', {
                        text: 'No change was necessary.',
                      }, [ { label: 'Close' } ]);
                    }
                  })
                  .catch(err => {
                    if (err.code === 'ENOENT') {
                      onShowError(
                        'Failed to apply configuration tweak',
                        'Could not locate or open your engine configuration file',
                        { allowReport: false },
                      );
                    } else {
                      onShowError('Failed to apply configuration tweak. ', err,
                                  { allowReport: false });
                    }
                  });
              },
            },
        ]);
      }
}


function mapStateToProps(state: IState): IConnectedProps {
  return {}
}

function mapDispatchToProps(dispatch: ThunkDispatch<any, null, Redux.Action>): IActionProps {
    return {
      onDialog: (type: DialogType, title: string,
                 content: IDialogContent, actions: DialogActions) => {
        dispatch(act.showDialog(type, title, content, actions));
      },
      onShowError: (message: string, details: string | Error, options: IErrorOptions) => {
        util.showError(dispatch, message, details, options);
      },
      onShowInfo: (message: string) => dispatch(act.addNotification({
        type: 'info',
        message,
      })),
    };
  }

export default
    withTranslation(['common', 'game-acecombat7skiesunknown'])(connect(mapStateToProps, mapDispatchToProps)(GeneralSettings));
