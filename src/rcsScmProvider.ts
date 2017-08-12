import { Disposable, scm, SourceControl, QuickDiffProvider, Uri, SourceControlResourceGroup } from 'vscode'
import {  } from 'vscode'


export class RcsScmProvider implements QuickDiffProvider, Disposable {
    private disposables: Disposable[] = [];
    private _scm: SourceControl;

    private locked;
    private lockedOthers;
    private unchanged;
    constructor() {
        this._scm = scm.createSourceControl('rcs', 'RCS');
        this.disposables.push(this._scm);
        
        this.locked = this._scm.createResourceGroup('loc', 'Locked');
		this.lockedOthers = this._scm.createResourceGroup('locOther', 'Locked by Others');
        this.disposables.push(
            this.locked,
            this.lockedOthers
        )
        this._scm.quickDiffProvider = this;
    }

    provideOriginalResource(uri: Uri): Uri | undefined  {
        return uri.with({
            scheme: 'rcs',
            path: `${uri.path}`,
            query: JSON.stringify({
                path: uri.fsPath,
            })
        });
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}