import { workspace, FileSystemWatcher, Disposable } from 'vscode'
import { Uri } from 'vscode'
import * as path from 'path'
import { RcsState, getInfo } from './rcs'

export enum RcsEventType {
    rcsChange,
    fileChange,
    fileRemove,
    initial
}

interface RcsListener {
    (uri: Uri, newState: RcsState|undefined, type: RcsEventType): any
}

export class RcsWatcher implements Disposable {
    private watcher: FileSystemWatcher;
    private listeners: RcsListener[] = [];
    constructor () {
        this.watcher = workspace.createFileSystemWatcher('**/*');
        let callback: RcsListener = (uri, newState, type) => {
            this.listeners.forEach(l => l(uri, newState, type));
        }

        this.watcher.onDidCreate(
            (uri) => {
                if (uri.path.endsWith(',v')) {
                    getInfo(uri.fsPath).then(
                        (info) => {
                            callback(Uri.file(info.workingFile), info.state, RcsEventType.rcsChange);
                        }
                    );
                } else {
                    callback(uri, undefined, RcsEventType.fileChange);
                }
            }
        );

        this.watcher.onDidDelete(
            (uri) => {
                if (uri.path.endsWith(',v')) {
                    if (path.dirname(uri.path) == 'RCS') {
                        let rcsFile = path.basename(uri.path);
                        let file = rcsFile.substr(0, rcsFile.length-2);
                        let filePath  = path.join(uri.fsPath, '../'+file);
                        callback(Uri.file(filePath), undefined, RcsEventType.rcsChange);
                    }
                } else {
                    callback(uri, undefined, RcsEventType.fileRemove);
                }
            }
        );

        this.watcher.onDidChange(
            (uri) => {
                if (uri.path.endsWith(',v')) {
                    getInfo(uri.fsPath).then(
                        (info) => {
                            callback(Uri.file(info.workingFile), info.state, RcsEventType.rcsChange);
                        }
                    );
                }
            }
        );
    }

    inform(callback: RcsListener) {
        this.listeners.push(callback);
        this.getCurrentState(callback);
    };

    getCurrentState(callback: RcsListener) {
        workspace.findFiles('**/*', '**/RCS/*')
            .then(
                (URIs) => {
                    URIs.forEach(uri => {
                        getInfo(uri.fsPath)
                            .then((info) => {
                                callback(Uri.file(info.workingFile), info.state, RcsEventType.initial);
                            })
                            .catch(e => {
                                callback(uri, undefined, RcsEventType.initial);
                            })
                    });
                }
            );
    }
    
    
    
    onRcsChange (callback: (uri: Uri)=>any) {
        this.inform((uri, state, type) => {
            if (type == RcsEventType.rcsChange) {
                callback(uri);
            }
        }) 
    }

    dispose() {
        this.watcher.dispose();
    }
}