'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { RcsContentProvider } from './rcsOriginalProvider'
import { RcsScmProvider } from './rcsScmProvider'
import { RcsWatcher } from './model'

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
}

// this method is called when your extension is deactivated
export function deactivate() {
}