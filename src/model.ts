import { workspace, FileSystemWatcher, Disposable } from 'vscode'
import { Uri } from 'vscode'
import * as path from 'path'
import { RcsState, getInfo } from './rcs'

interface RcsListener {
    (uri: Uri, newState: RcsState|undefined): any
}

export class RcsWatcher implements Disposable {
    private watcher: FileSystemWatcher;
    private listeners: RcsListener[] = [];
    constructor () {
        this.watcher = workspace.createFileSystemWatcher('**/*');
        let callback: RcsListener = (uri, newState) => {
            this.listeners.forEach(l => l(uri, newState));
        }

        this.watcher.onDidCreate(
            (uri) => {
                if (uri.path.endsWith(',v')) {
                    getInfo(uri.fsPath).then(
                        (info) => {
                            callback(Uri.file(info.workingFile), info.state);
                        }
                    );
                } else {
                    callback(uri, undefined);
                }
            }
        );

        this.watcher.onDidChange(
            (uri) => {
                if (uri.path.endsWith(',v')) {
                    getInfo(uri.fsPath).then(
                        (info) => {
                            callback(Uri.file(info.workingFile), info.state);
                        }
                    );
                }
            }
        );
    }

    inform(callback: RcsListener) {
        this.listeners.push(callback);
        workspace.findFiles('**/*', '**/RCS/*')
            .then(
                (URIs) => {
                    URIs.forEach(uri => {
                        getInfo(uri.fsPath)
                            .then((info) => {
                                callback(Uri.file(info.workingFile), info.state);
                            })
                            .catch(e => {
                                callback(uri, undefined);
                            })
                    });
                }
            )
    };

    dispose() {
        this.watcher.dispose();
    }
}