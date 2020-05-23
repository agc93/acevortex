import { IProfile, ThunkStore, IState, IExtensionApi } from "vortex-api/lib/types/api";
import { selectors, log, actions } from "vortex-api";

export class ProfileClient {
    state: IState;
    store: ThunkStore<any>;
    /**
     *
     */
    constructor(store: ThunkStore<any>);
    constructor(context: IExtensionApi);
    constructor(ctx: IExtensionApi | ThunkStore<any>) {
        this.store = (ctx as IExtensionApi) 
            ? (ctx as IExtensionApi).store
            : ctx as ThunkStore<any>;
        this.state = this.store.getState();
    }

    setProfileSetting<TSetting>(profile: IProfile, key: string, value: TSetting) {
        var profileId = selectors.activeProfile(this.state)?.id
        if (profileId !== undefined && this.state.persistent.profiles[profileId].features !== undefined) {
            this.store.dispatch(actions.setFeature(profileId, key, value));
            // this.state.persistent.profiles[profileId].features[key] = value;
            var features = this.state.persistent.profiles[profileId]?.features;
            log('debug', `attempting to set ${key}/${value} in ${profile.name}`, features);
        }
    }

    getProfileSetting<TSetting>(profile: IProfile, key: string, defaultValue: TSetting);
    getProfileSetting<TSetting>(key: string, defaultValue: TSetting);
    getProfileSetting<TSetting>(profileOrKey: string | IProfile, defaultValueOrKey: string | TSetting, defaultValue?: TSetting) {
        if (typeof profileOrKey === 'string') { // have to get our own profile
            var key = profileOrKey as string;
            defaultValue = defaultValueOrKey as TSetting; // this can actually be undefined which is probably not good.
            var profileId = selectors.activeProfile(this.state)?.id
            if (profileId !== undefined) {
                var features = this.state.persistent.profiles[profileId]?.features;
                const skipTerms = features ? features[key] : defaultValue;
                return skipTerms;
            }
            return defaultValue; // this should only happen if we can't get the profile for some reason.
        } else {
            //we've got a profile already
            var profile = profileOrKey as IProfile;
            var key = defaultValueOrKey as string;
            var profileFeatures = profile.features;
            const skipTerms = profileFeatures ? profileFeatures[key] : defaultValue;
            return skipTerms;
        }
    }
}