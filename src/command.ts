import { commands } from 'vscode';
import { Resource } from './resource';


commands.registerCommand('extension.openResource', (resource: Resource) => {
    console.log(resource);
})