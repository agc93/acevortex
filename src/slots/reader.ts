import * as nfs from 'fs';
import * as path from 'path';

export class SlotReader {
    private _logFn: (msg: string, obj?: any) => void;
    private _modFileExt: string;
    /**
     *
     */
    constructor(logFn?: (msg: string, obj?: any) => void, modFileExt = ".pak") {
        this._logFn = logFn ?? ((m, obj) => {});
        this._modFileExt = modFileExt;
    }

    private getFileOffset = (fileLength: number) => {
        var windowLength =  Math.max(Math.ceil(fileLength * 0.025), 8192);
        var startPoint = fileLength - windowLength;
        return Math.max(startPoint, 0);
    }

    private getEndOffset = (offset: number, fileLength: number) => {
        return Math.min(fileLength, offset + 4096);
    }

    getSkinIdentifier = (filePath: string): {aircraft: string, slot: string}[] | undefined => {
        var skins: {aircraft: string, slot: string}[] = [];
        if (nfs.existsSync(filePath) && path.extname(filePath).toLowerCase() == this._modFileExt) {
            const fileBuffer = nfs.readFileSync(filePath);
            var searchKey = 'Nimbus/Content/'
            var getAllIndexes = (arr: Buffer) => {
                var indexes = [], i = this.getFileOffset(fileBuffer.length);
                while ((i = arr.indexOf(Buffer.from(searchKey), i+1)) != -1){
                    indexes.push(i);
                }
                return indexes;
            }
            var indexes = getAllIndexes(fileBuffer);
            this._logFn(`identified ${indexes.length} object paths`);
            for (const key of indexes) {
                var rawString = fileBuffer.toString('utf8', key + 16, key + 64);
                var match = this.parseMatchString(rawString);
                if (match !== undefined && match.length > 0) {
                    skins.push(...match);
                }
            }
            if (skins.length == 0 && indexes.length == 1) {
                //we couldn't find anything. Maybe a weird relative-only packing?
                var key = indexes[0];
                var startPt = key + 16;
                var rawString = fileBuffer.toString('utf8', startPt, this.getEndOffset(startPt, fileBuffer.length));
                this._logFn(`falling back to relative packing detection at ${startPt}`, {length: rawString.length, file: fileBuffer.length});
                var matches = this.parseMatchString(rawString);
                if (matches !== undefined && matches.length > 0) {
                    skins.push(...matches);
                }
            }
            if (skins.length == 0) {
                //we couldn't find anything. Maybe an old file?
                for (const key of indexes) {
                    var rawString = fileBuffer.toString('utf8', key + 16, key + 64);
                    var match = this.parseMatchString(rawString, true);
                    if (match !== undefined && match.length > 0) {
                        skins.push(...match);
                    }
                }
            }
        }
        this._logFn('failed to find skin key in mod file');
        return skins;
    }

    private parseMatchString(rawString: string, useUbulk = false): {aircraft: string, slot: string}[] {
        var results = [];
        var pattern = useUbulk 
            ? new RegExp(/([a-zA-Z0-9]+?)_x?(\d*\w*)_([A-Z]{1})(?:[^\w])(?=ub)/g)
            : new RegExp(/([a-zA-Z0-9]+?)_x?(\d*\w*)_([A-Z]{1})(?:[^\w])(?=ue)/g);
        var matches;
        while ( (matches = pattern.exec(rawString)) !== null && rawString.includes('Aircraft')){
            this._logFn('identified aircraft skin', {matches});
            var [, aircraft, slot, skinType] = matches;
            if (skinType == 'D') {
                results.push({aircraft, slot});
            }
        }
        return results;
    }

}