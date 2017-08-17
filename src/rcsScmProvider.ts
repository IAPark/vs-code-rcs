import { Disposable, scm, SourceControl, QuickDiffProvider, Uri, SourceControlResourceGroup } from 'vscode'
import { RcsWatcher, RcsEventType } from './model';
import { RcsState } from './rcs';
import { Resource } from './resource';

const username: () => Promise<string> = require('username')



export class RcsScmProvider implements QuickDiffProvider, Disposable {
    private disposables: Disposable[] = [];
    private _scm: SourceControl;

    private locked: SourceControlResourceGroup;
    private lockedOthers: SourceControlResourceGroup;
    private unchanged: SourceControlResourceGroup;
    private untracked: SourceControlResourceGroup;

    private states: {
        [file: string]: RcsState
    } = {};

    constructor() {
        this._scm = scm.createSourceControl('rcs', 'RCS');
        this.disposables.push(this._scm);
        
        this.locked = this._scm.createResourceGroup('loc', 'Locked');
        this.lockedOthers = this._scm.createResourceGroup('locOther', 'Locked by Others');
        this.untracked = this._scm.createResourceGroup('untrac', 'Untracked');
        
        this.untracked.hideWhenEmpty = true;
        this.lockedOthers.hideWhenEmpty = true;


        this.disposables.push(
            this.locked,
            this.lockedOthers,
            this.untracked
        )
        let watcher = new RcsWatcher();
        this.disposables.push(watcher);


        watcher.inform( 
            (uri, state, type) => {
                if (type === RcsEventType.fileRemove) {
                    delete this.states[uri.fsPath];
                } else {
                    this.states[uri.fsPath] = state;
                }
                this.recalcResourceState();
            }
        );
        this._scm.quickDiffProvider = this;
    }

    get acceptInputCommand() {
        return 'rcs.checkin';
    }

    recalcResourceState () {
        let fileToResourceState = (file: string) => new Resource(file);

        username().then((user) => {
            let lockedFiles = [];
            let lockedOthersFiles = [];
            let untrackedFiles = [];
            for (let file in this.states) {
                let state = this.states[file];
                if (state && state.locked) {
                    if (state.locker == user) {
                        lockedFiles.push(file);
                    } else {
                        lockedOthersFiles.push(file);
                    }
                } else if (!state) {
                    untrackedFiles.push(file);
                }
            }
            this._scm.count = lockedFiles.length;
            this.locked.resourceStates = lockedFiles.map(fileToResourceState);
            this.lockedOthers.resourceStates = lockedOthersFiles.map(fileToResourceState);
            this.untracked.resourceStates = untrackedFiles.map(fileToResourceState);

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