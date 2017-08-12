import { TextDocumentContentProvider, Uri, Disposable, workspace } from 'vscode';

import { exec } from 'child_process';

function execute(command: string): Promise<string> {

    return new Promise( (resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            if (stderr.length > 0) {
                reject(stderr);
            }
            resolve(stdout);
        });
    })

}


export class RcsContentProvider implements TextDocumentContentProvider {
    private disposables: Disposable[] = [];
    constructor() {
        this.disposables.push(
			workspace.registerTextDocumentContentProvider('rcs', this)
		);
    }

    public async provideTextDocumentContent(uri: Uri) {
        let text = await execute('co -p -q ' + uri.fsPath);
        console.log(text);
        return text;
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}

