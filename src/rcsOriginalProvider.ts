import { TextDocumentContentProvider, Uri, Disposable, workspace, EventEmitter, Event } from 'vscode';

import { getHead } from './rcs';
import { RcsWatcher } from './model';



export class RcsContentProvider implements TextDocumentContentProvider {
    private disposables: Disposable[] = [];
    private onDidChangeEmitter = new EventEmitter<Uri>();
    get onDidChange(): Event<Uri> { return this.onDidChangeEmitter.event; }

    private watcher: RcsWatcher = new RcsWatcher();

    constructor() {
        this.disposables.push(
            workspace.registerTextDocumentContentProvider('rcs', this),
            this.watcher
        );
        this.watcher.onRcsChange( (uri) =>
            this.onDidChangeEmitter.fire(uri.with({
            scheme: 'rcs'})));
    }

    public async provideTextDocumentContent(uri: Uri) {
        try {
            let text = await getHead(uri.fsPath);
            return text;
        } catch(e) {
            return '';
        }
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}

