import { IExtensionApi } from "vortex-api/lib/types/api";
import { fs, log } from "vortex-api";
import { MOD_FILE_EXT } from "..";
import nfs = require('fs');
import path = require("path");

export class SlotReader {

    getSkinIdentifier = (filePath: string): {aircraft: string, slot: string} | undefined => {
        if (nfs.existsSync(filePath) && path.extname(filePath) == MOD_FILE_EXT) {
            const fileBuffer = fs.readFileSync(filePath);
            var searchKey = '/Game/'
            // log('debug', 'read pak file into buffer', {length: fileBuffer.length, path: filePath});
            var key = fileBuffer.indexOf(Buffer.from(searchKey));
            if (key && key != -1) /* I don't honestly know what this returns when its not found */ {
                var rawString = fileBuffer.toString('utf8', key + 6, key + 26);
                // log('debug', 'found key in pak file', {key, rawString}); //TODO: remove
                var pattern = new RegExp(/([a-z0-9]+?)_(v?\d+a?\w{1}?)_(\w).*/);
                if (pattern.test(rawString)) {
                    var matches = pattern.exec(rawString);
                    // log('debug', 'key string matched pattern', {matches});
                    var [, aircraft, slot, skinType] = matches;
                    return {aircraft, slot};
                }
            } else {
                log('debug', 'failed to find skin key in mod file');
            }
        }
        return undefined;
    }

}