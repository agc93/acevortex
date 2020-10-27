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
            var getAllIndexes = (arr: Buffer) => {
                var indexes = [], i = this.getFileOffset(fileBuffer.length);
                while ((i = arr.indexOf(Buffer.from(searchKey), i+1)) != -1){
                    indexes.push(i);
                }
                return indexes;
            }
            var indexes = getAllIndexes(fileBuffer);
            log('debug', `identified ${indexes.length} object paths`);
            for (const key of indexes) {
                var rawString = fileBuffer.toString('utf8', key + 16, key + 64);
                // var pattern = new RegExp(/([a-z0-9]+?)_(v?\d+a?\w{1}?)_(\w).*/);
                var pattern = new RegExp(/\/([a-zA-Z0-9]+?)_x?(\d*\w*)_([A-Z]{1})(?:[^\w])(?!ue)/);
                // var pattern = new RegExp(/\/([a-zA-Z0-9]{2,}?)_x?(\d*\w*)_([A-Z]{1}|[A-Za-z]{4})(?:[^\w])(?!ue)/); //this will not match weapons
                if (pattern.test(rawString) && rawString.includes('Aircraft')) {
                    var matches = pattern.exec(rawString);
                    log('debug', 'identified aircraft skin', {matches});
                    var [, aircraft, slot, skinType] = matches;
                    if (skinType.includes('MREC')) {
                        continue;
                    }
                    return {aircraft, slot};
                }
            }
        }
        log('debug', 'failed to find skin key in mod file');
        return undefined;
    }

}