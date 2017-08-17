'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { RcsContentProvider } from './rcsOriginalProvider'
import { RcsScmProvider } from './rcsScmProvider'
import { RcsWatcher } from './model'
import { Resource } from './resource';
import { checkin, lock  } from './rcs';

function createResourceUri(relativePath: string): vscode.Uri {
  const absolutePath = path.join(vscode.workspace.rootPath, relativePath);
  return vscode.Uri.file(absolutePath);
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "rcs" is now active!');
    let scm = new RcsScmProvider();
    let rcsDocProvider = new RcsContentProvider();

    context.subscriptions.push(scm);
    context.subscriptions.push(rcsDocProvider);

    let command = vscode.commands.registerCommand('rcs.openResource', (resource: Resource) => {
        let left = resource.resourceUri;
        let right = resource.headUri;

        const opts: vscode.TextDocumentShowOptions = {
          preserveFocus: true,
          preview: true,
          viewColumn: vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn || vscode.ViewColumn.One
        };
        return vscode.commands.executeCommand<void>('vscode.diff', right, left, 'RCS Diff: '+left.path, opts)
    })

    let lockCommand = vscode.commands.registerCommand('rcs.lock', (uri: vscode.Uri) => {
      lock(uri.fsPath);
    });

    let checkinCommand = vscode.commands.registerCommand('rcs.checkin', (...resourceStates: vscode.SourceControlResourceState[]) => {
      console.log(resourceStates.map(s=>s.resourceUri));
    });
    vscode.scm.inputBox.value

    context.subscriptions.push(lockCommand);

}

// this method is called when your extension is deactivated
export function deactivate() {
}