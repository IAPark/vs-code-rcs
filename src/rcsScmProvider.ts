import { Disposable, scm, SourceControl, QuickDiffProvider, Uri, SourceControlResourceGroup } from 'vscode'
import { RcsWatcher } from './model';
import { RcsState } from './rcs';
import { Resource } from './resource';

const username: () => Promise<string> = require('username')



export class RcsScmProvider implements QuickDiffProvider, Disposable {
    private disposables: Disposable[] = [];
    private _scm: SourceControl;

    private locked: SourceControlResourceGroup;
    private lockedOthers: SourceControlResourceGroup;
    private unchanged: SourceControlResourceGroup;

    private states: {
        [file: string]: RcsState
    } = {};

    constructor() {
        this._scm = scm.createSourceControl('rcs', 'RCS');
        this.disposables.push(this._scm);
        
        this.locked = this._scm.createResourceGroup('loc', 'Locked');
        this.locked.resourceStates = [];
        this.lockedOthers = this._scm.createResourceGroup('locOther', 'Locked by Others');
        this.lockedOthers.resourceStates = [];

        this.disposables.push(
            this.locked,
            this.lockedOthers
        )
        let watcher = new RcsWatcher();
        this.disposables.push(watcher);


        watcher.inform( 
            (uri, state) => {
                this.states[uri.fsPath] = state;
                console.log(uri);
                this.recalcResourceState();
            }
        );
        this._scm.quickDiffProvider = this;
    }

    recalcResourceState () {
        let fileToResourceState = (file: string) => new Resource(file);

        username().then((user) => {
            let lockedFiles = [];
            let lockedOthersFiles = [];
            for (let file in this.states) {
                let state = this.states[file];
                if (state && state.locked) {
                    if (state.locker == user) {
                        lockedFiles.push(file);
                    } else {
                        lockedOthersFiles.push(file);
                    }
                }
            }
            this._scm.count = lockedFiles.length;
            this.locked.resourceStates = lockedFiles.map(fileToResourceState);
            this.lockedOthers.resourceStates = lockedOthersFiles.map(fileToResourceState);
        });
    }

    provideOriginalResource(uri: Uri): Uri | undefined  {
        return uri.with({
            scheme: 'rcs'
        });
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}