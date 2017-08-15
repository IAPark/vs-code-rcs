import { SourceControlResourceState, Uri } from 'vscode';

export class Resource implements SourceControlResourceState {
    filename: string;
    constructor(filename: string) {
        this.filename = filename;
    }

    get resourceUri() {
        return Uri.file(this.filename);
    }

    get command() {
        return {
			command: 'rcs.openResource',
			title: "Open",
			arguments: [this]
		};
    }

    get headUri() {
        return this.resourceUri.with({scheme: 'rcs'});
    }
}