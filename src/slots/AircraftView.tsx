import { IMod, IExtensionApi, IState, IProfile, IProfileMod } from "vortex-api/lib/types/api";
import { ComponentEx, util, MainPage, FlexLayout, selectors, Icon, log } from "vortex-api";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Panel, ListGroup, ListGroupItem, Button, Image } from "react-bootstrap";
import { getModName } from "vortex-ext-common";
import React, { Component } from 'react';

import { GAME_ID } from "..";
import LoadingSpinner from "./LoadingSpinner";
import { getSlotName, getSkinName as getAllSkins } from "../attributes";

type SkinSet = {[aircraft: string]: {[slot: string]: IMod[]}};
type AircraftSet = {[aircraft: string]: IMod[]};

interface IConnectedProps {
    installed: { [modId: string]: IMod};
    profile: IProfile;
    profileMods: { [modId: string]: IProfileMod };
}

interface IBaseProps {
    api: IExtensionApi;
}

interface IAircraftViewState {
    isLoading: boolean;
    selectedAircraft: string;
    selectedSlot: string;
}

type IProps = IConnectedProps & IBaseProps;

class AircraftView extends ComponentEx<IProps, {}> {
    mainPage: React.Component<{}, any, any> = null;
    header: React.Component<{}, any, any> = null;
    
    state: IAircraftViewState = {
        isLoading: false,
        selectedAircraft: undefined,
        selectedSlot: undefined
    };

    private getEnabledSkinMods = (): IMod[] => {
        const {profileMods, installed} = this.props;
        var enabledMods = Object.keys(profileMods).filter(pm => profileMods[pm].enabled).map(epm => installed[epm])
        var skinMods = Object.values(enabledMods)
            .filter(m => m !== undefined && m !== null && m)
            .filter(m => m.state == 'installed')
            .filter(m => m.installationPath)
            .filter(m => util.getSafe(m.attributes, ['skinSlots'], []).length > 0);
        return skinMods;
    }

    public render() {
        const { isLoading, selectedAircraft } = this.state;
        const { installed } = this.props;
        var skinMods = this.getEnabledSkinMods();
        var groupedSkins = this.buildSkinSet(skinMods);
        return (
            <MainPage>
                {/* <MainPage.Header>
                    {installed && 
                    <FlexLayout type="column">
                        <>This will only show skins that you have installed with Vortex and will not include manually installed skins or skins included with the game/DLC</>
                    </FlexLayout>
                    }
                </MainPage.Header> */}
                <MainPage.Body>
                    {isLoading
                        ? <LoadingSpinner />
                        : <Panel id="skins-browse">
                            <Panel.Heading>
                                <FlexLayout type="row" className="av-actions-bar">
                                    <>This will only show enabled skins that you have installed with Vortex and will not include manually installed skins or skins included with the game/DLC</>
                                </FlexLayout>
                            </Panel.Heading>
                            <Panel.Body>
                                <FlexLayout type="row">
                                    <FlexLayout.Fixed className="av-aircraftlist">
                                        <FlexLayout type="column">
                                            {skinMods && skinMods.length > 0
                                                ? <ListGroup>
                                                    {Object.keys(groupedSkins).map(this.renderAircraftEntry)}
                                                </ListGroup>
                                                : "No installed skin mods found!"
                                            }
                                        </FlexLayout>
                                    </FlexLayout.Fixed>
                                    <FlexLayout.Flex fill={true} className="av-slotlist">
                                        {selectedAircraft &&
                                        <ListGroup>
                                            {this.renderSlots(groupedSkins[selectedAircraft])}
                                        </ListGroup>
                                        }
                                    </FlexLayout.Flex>
                                </FlexLayout>
                            </Panel.Body>
                        </Panel>}
                </MainPage.Body>
            </MainPage>
        )
    }

    private renderSlots = (slots: {[slot:string]: IMod[]}) => {
        var content: JSX.Element[] = [];
        for (const slot of Object.keys(slots)) {
            var slotMods = slots[slot];
            if (slotMods.length == 1) {
                content.push(this.renderSlotDetail(slot, slotMods[0]));
            } else {
                content.push(this.renderConflictDetail(slot, slotMods));
            }
        }
        return content;
    }

    private renderConflictDetail = (slot: string, mods: IMod[]) => {
        return (
            <ListGroupItem
                bsStyle='warning'
                key={slot + "-conflict"}
                data-slot={slot}
                className="av-slot-item"
            >
                <div className='av-item-header'>
                    <div>
                        <span className='av-mod-name'>{getSlotName(slot)}: {mods.length} conflicting mods</span>
                    </div>
                    <div>
                        <span className='av-slot-name' style={{color: 'red'}}>{getSlotName(slot)}</span>
                    </div>
                </div>
                {mods.map(m => {
                        return (
                            <div className='av-item-footer'>
                                <div className='av-item-footer-text'><span style={{fontStyle: 'italic'}}>{getModName(m)}</span>: Replaces {getAllSkins(m)}</div>
                            </div>
                        )})}
            </ListGroupItem>
        )
    }

    private renderSlotDetail = (slot: string, mod: IMod) => {
        var homeLink = util.getSafe(mod.attributes, ['homepage'], undefined);
        var isNexus = util.getSafe(mod.attributes, ['source'], undefined) === 'nexus';
        const url = util.getSafe(mod, ['attributes', 'pictureUrl'], undefined);
        return (
            <ListGroupItem
                key={`${mod.id}-${slot}`}
                data-slot={slot}
                className={"av-slot-item"}
            // active={aircraft == selectedAircraft}
            // onClick={(e: React.MouseEvent<any, MouseEvent>) => this.selectAircraftEntry(e, aircraft)}
            >
                <FlexLayout type="row">
                    <FlexLayout.Flex fill={true} className='av-slot-details'>
                        <div className='av-item-header'>
                            <div>
                                <span className='av-mod-name'>{getModName(mod)}</span> by {util.getSafe(mod.attributes, ['author'], 'unknown')}
                            </div>
                            <div>
                                <span className='av-slot-name'>{getSlotName(slot)}</span>
                            </div>
                        </div>
                        <div className='av-item-footer'>
                            <div className='av-item-footer-text'>{util.getSafe(mod.attributes, ['shortDescription'], '')}</div>
                        </div>
                        <div className='av-item-actions'>
                            <Button onClick={(e => this.highlightMod(mod.id))}>View in Mods List</Button>
                            {homeLink && isNexus &&
                                <Button onClick={(e => util.opn(homeLink))}>{"View on Nexus Mods"}</Button>
                            }
                        </div>
                    </FlexLayout.Flex>
                    <FlexLayout.Fixed className='av-slot-image'>
                        {this.renderImage(url)}
                    </FlexLayout.Fixed>
                </FlexLayout>
            </ListGroupItem>
        )
    }

    private renderImage = (imageUrl: string) => {
        return (
            <div className='av-skin-preview'>
                {/* <span className='image-frame'></span> */}
                {(imageUrl !== undefined)
                    ? <Image src={imageUrl} responsive />
                    : <Icon name='placeholder-image' />
                }
            </div>
            
        )
    }

    private highlightMod = (modId: string) => {
        // log('debug', 'highlighting mod', {modId});
        // const modId = evt.currentTarget.getAttribute('data-modid');
        const api = (this.props as IProps).api;
        api.events.emit('show-main-page', 'Mods');
        // give it time to transition to the mods page but also this is a workaround
        // for the fact that the mods page might not be mounted yet
        setTimeout(() => {
          api.events.emit('mods-scroll-to', modId);
          api.highlightControl(
            `.${util.sanitizeCSSId(modId)} > .cell-name`, 4000);
        }, 500);
      }

    private getAircraftName = (aircraft: string) => {
        return aircraft.toUpperCase();
    }

    renderAircraftEntry = (aircraft: string) => {
        const { selectedAircraft } = this.state;
        return (
            <ListGroupItem
                key={aircraft}
                data-aircraft={aircraft}
                className={"av-aircraft-item"}
                active={aircraft == selectedAircraft}
                onClick={(e: React.MouseEvent<any, MouseEvent>) => this.selectAircraftEntry(e, aircraft)}
            >
                <div className='av-item-header'>
                    <div>
                        <span className='sv-item-title'>{this.getAircraftName(aircraft)}</span>
                    </div>
                </div>
                <div className='av-item-footer'>
                    {/* <div className='av-item-footer-text'>{bookmark.level_author_name ?? 'Unknown'}</div> */}
                </div>
            </ListGroupItem>
        )
    }

    private selectAircraftEntry = (evt: React.MouseEvent<any>, aircraft: string) => {
        // var { selected } = this.state;
        // var { bookmarks, userName } = this.props;
        const modIdStr = aircraft ?? evt.currentTarget.getAttribute('data-aircraft');
        // traceLog('new bookmark selected', { mod: modIdStr });
        // var bm = bookmarks[userName].find(m => m.hash == modIdStr);
        this.setState({ selectedAircraft: modIdStr } as IAircraftViewState);
    }

    buildSkinSet = (mods: IMod[]): SkinSet => {
        var slots: SkinSet = {};
        var allSlots = mods.reduce(function (slots, mod) {
            var skins = util.getSafe<string[]>(mod.attributes, ['skinSlots'], []);
            if (skins) {
                skins.forEach(sk => {
                    // If the key doesn't exist yet, create it
                    var aircraft = sk.split('|')[0];
                    var slot = sk.split('|')[1];
                    if (!slots.hasOwnProperty(aircraft)) {
                        slots[aircraft] = {};
                    }
                    if (!slots[aircraft].hasOwnProperty(slot)) {
                        slots[aircraft][slot] = [];
                    }
                    slots[aircraft][slot].push(mod);
                });
            }
            // Return the object to the next item in the loop
            return slots;
        }, slots);
        var ordered: SkinSet = {};
        Object.keys(allSlots).sort().forEach(function(key) {
            ordered[key] = allSlots[key];
          });
        return ordered;
        // return removeNonConflicts(allSlots);
    }


}

function mapStateToProps(state: IState): IConnectedProps {
    return {
        installed: state.persistent.mods[GAME_ID],
        profile: selectors.activeProfile(state),
        profileMods: util.getSafe(selectors.activeProfile(state), ['modState'], {})
    }
}

export default withTranslation(['acevortex', 'game-acecombat7skiesunknown', 'common'])(connect(mapStateToProps)(AircraftView));