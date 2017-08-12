import { Disposable, scm, SourceControl, QuickDiffProvider, Uri } from 'vscode'


export class RcsScmProvider implements QuickDiffProvider, Disposable {
    private disposables: Disposable[] = [];
    private _scm: SourceControl;

    constructor() {
        this._scm = scm.createSourceControl('rcs', 'RCS');
        this.disposables.push(this._scm);

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