import { IExtensionApi, IProfile } from "vortex-api/lib/types/api";
import { util } from "vortex-api";
import { GAME_ID } from ".";

export const groupBy = function<T> (arr: T[], criteria: string|((obj:T) => string)): {[key: string]: T[]} {
	return arr.reduce(function (obj, item) {

		// Check if the criteria is a function to run on the item or a property of it
		var key = typeof criteria === 'function' ? criteria(item) : item[criteria];

		// If the key doesn't exist yet, create it
		if (!obj.hasOwnProperty(key)) {
			obj[key] = [];
		}

		// Push the value to the object
		obj[key].push(item);

		// Return the object to the next item in the loop
		return obj;

	}, {});
};

export function isGameManaged(api: IExtensionApi): boolean {
    var profiles: {[profileId: string]: IProfile} = {};
    profiles = util.getSafe(api.getState().persistent, ['profiles'], {});
    const gameProfiles: string[] = Object.keys(profiles)
      .filter((id: string) => profiles[id].gameId === GAME_ID);
    return gameProfiles && gameProfiles.length > 0;
}