import { IExtensionApi } from "vortex-api/lib/types/api";
import { fs, log } from "vortex-api";
import { MOD_FILE_EXT } from "..";
import nfs = require('fs');
import path = require("path");

export class SlotReader {
    private getFileOffset = (fileLength: number) => {
        var windowLength =  Math.max(Math.ceil(fileLength * 0.025), 8192);
        var startPoint = fileLength - windowLength;
        return Math.max(startPoint, 0);
    }

    getSkinIdentifier = (filePath: string): {aircraft: string, slot: string} | undefined => {
        if (nfs.existsSync(filePath) && path.extname(filePath).toLowerCase() == MOD_FILE_EXT) {
            const fileBuffer = fs.readFileSync(filePath);
            var searchKey = 'Nimbus/Content/'
            // log('debug', 'read pak file into buffer', {length: fileBuffer.length, path: filePath});
            var key = fileBuffer.indexOf(Buffer.from(searchKey), this.getFileOffset(fileBuffer.length));
            if (key && key != -1) /* I don't honestly know what this returns when its not found */ {
                var rawString = fileBuffer.toString('utf8', key + 16, key + 64);
                // log('debug', 'found key in pak file', {key, rawString}); //TODO: remove
                // var pattern = new RegExp(/([a-z0-9]+?)_(v?\d+a?\w{1}?)_(\w).*/);
                var pattern = new RegExp(/([a-zA-Z0-9]+?)_x?(\d*\w*)_([A-Z]{1}|[A-Za-z]{4})(?:[^\w])(?!ue)/);
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