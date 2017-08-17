import { Disposable, workspace, TextDocumentWillSaveEvent } from 'vscode';
import { getInfo, lock, getHead } from './rcs';
const username: () => Promise<string> = require('username')

export class SaveHandler implements Disposable {

    constructor() {
        workspace.onWillSaveTextDocument(e => {
            getInfo(e.document.uri.fsPath)
                .then( info => {

                })
        })
    }

    async handleSave(e: TextDocumentWillSaveEvent) {
        let info = await getInfo(e.document.uri.fsPath);
        if (!info.state.locked) {
            await lock(e.document.uri.fsPath);
        } else if (info.state.locker != await username()) {
            return [];
        }

        let head = await getHead(e.document.uri.fsPath);
        

    }

    dispose() {
       
    }
}