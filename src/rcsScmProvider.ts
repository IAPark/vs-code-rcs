import { Disposable, scm, SourceControl, QuickDiffProvider, Uri, SourceControlResourceGroup } from 'vscode'
import { RcsWatcher, RcsEventType } from './model';
import { RcsState } from './rcs';
import { Resource } from './resource';

const username: () => Promise<string> = require('username')



export class RcsScmProvider implements QuickDiffProvider, Disposable {
    private disposables: Disposable[] = [];
    private _scm: SourceControl;
    private watcher: RcsWatcher;

    private staged: SourceControlResourceGroup;
    private locked: SourceControlResourceGroup;
    private lockedOthers: SourceControlResourceGroup;
    private unchanged: SourceControlResourceGroup;
    private untracked: SourceControlResourceGroup;

    public stagedFiles: string[] = [];
    private states: {
        [file: string]: RcsState
    } = {};

    constructor() {
        this._scm = scm.createSourceControl('rcs', 'RCS');
        this._scm.acceptInputCommand = this.acceptInputCommand;
        this.disposables.push(this._scm);
        
        this.staged = this._scm.createResourceGroup('staged', 'Staged');

        this.locked = this._scm.createResourceGroup('loc', 'Locked');
        this.lockedOthers = this._scm.createResourceGroup('locOther', 'Locked by Others');
        this.untracked = this._scm.createResourceGroup('untrac', 'Untracked');
        
        this.staged.hideWhenEmpty = true;

        this.untracked.hideWhenEmpty = true;
        this.lockedOthers.hideWhenEmpty = true;


        this.disposables.push(
            this.staged,
            this.locked,
            this.lockedOthers,
            this.untracked
        )
        this.watcher = new RcsWatcher();
        this.disposables.push(this.watcher);
        this.callback = this.callback.bind(this);
        this.watcher.inform(this.callback);
        this._scm.quickDiffProvider = this;
    }

    get acceptInputCommand() {
        return { command: 'rcs.checkin', title: 'Checkin' };
    }

    callback(uri, state, type) {
        if (type === RcsEventType.fileRemove) {
            delete this.states[uri.fsPath];
        } else {
            this.states[uri.fsPath] = state;
        }
        this.recalcResourceState();
    }

    refresh() {
        this.states = {};
        this.watcher.getCurrentState(this.callback)
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
            this.staged.resourceStates = this.stagedFiles.map(fileToResourceState);
            this.locked.resourceStates = lockedFiles.filter(file => this.stagedFiles.indexOf(file) === -1)
                                                        .map(fileToResourceState);
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