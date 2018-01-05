import { Disposable, workspace, TextDocumentChangeEvent, window, commands } from 'vscode';
import { getInfo, lock, getHead } from './rcs';
const username: () => Promise<string> = require('username')

export class SaveHandler implements Disposable {
    disposables: Disposable[] = [];

    constructor() {
        let disposable = workspace.onDidChangeTextDocument(this.handleModified.bind(this))
        this.disposables.push(disposable);
    }

    async handleModified(e: TextDocumentChangeEvent) { 
        if (!e.document.isDirty) return; // if the document isn't dirty the change was made in the file system
        let info = await getInfo(e.document.uri.fsPath);

        if (!info.state.locked && info.state.locker != await username()) {
            commands.executeCommand<void>('undo');
            
            window.showWarningMessage('Document not locked by you',  'Lock')
                .then(option => {
                    if (option == 'Lock') {

                        lock(e.document.uri.fsPath);
                    }
                })
        }
    }

    dispose() {
       this.disposables.forEach(d=>d.dispose());
    }
}