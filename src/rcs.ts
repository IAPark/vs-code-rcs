import { exec } from 'child_process';
import * as path from 'path'

export async function checkin(path: string, message) {
    let result = await execute("ci -u -m'"+message+"' "+path);
    let lines = result.split('\n');
    if (lines[2] != 'done') {
        throw result;
    }
    return;
}

export async function lock(path: string) {
    let result = await execute("co -l "+path);
    let lines = result.split('\n');
    if (lines[2] != 'done') {
        throw result;
    }
    return;
}

export function getHead(path: string) {
    return execute('co -p -q ' + path);
}

export interface RcsState {
    locked: boolean;
    locker: string|undefined;
    revision: string;
}


export interface RcsInfo {
    workingFile: string,
    rcsFile: string,
    state: RcsState
}

export async function getInfo(file: string): Promise<RcsInfo> {
    let log = await rlog(file);
    let base = path.dirname(path.dirname(log.rcsFile));
    
    if (!path.isAbsolute(log.workingFile)) {
        log.workingFile = path.join(base, log.workingFile);
    }
    return {
        workingFile: log.workingFile,
        rcsFile: log.rcsFile,
        state: logToState(log)
    }
}

const keywords: string[] = ['Author', 'Date', 'Header', 'Id', 'Locker',
                            'Locker', 'Log', 'Name', 'RCSfile', 'Revision',
                            'Source', 'State']
export function getKeywords(text: string) {
    let potential = text.split('$');
    let matches = {};
    potential.forEach(s => {
        let token = keywords.find(keyword => s.startsWith(keyword));
        if (token != undefined) {
            matches[token] = s.slice(token.length);
        }
    });
    return matches;
}

export function setKeywords(text: string, replacement: {[keyword: string]: string}) {
    let potential = text.split('$');
    let result = potential.map(s => {
        let token = Object.keys(replacement).find(keyword => s.startsWith(keyword));
        if (token != undefined) {
            return token + replacement[token];
        } else {
            return s;
        }
    });
    return result.join('$');
}

interface rLog {
    rcsFile: string,
    workingFile: string,
    head: string,
    locker: string|undefined;
}

function logToState (log: rLog): RcsState{
    return {
        locked: log.locker !== undefined,
        locker: log.locker?log.locker:undefined,
        revision: log.head
    }
}

async function rlog(file: string): Promise<rLog> {
    let rlogOutput = await execute('rlog '+file);
    let lines = rlogOutput.split('\n');
    if (lines.length <= 1) {
        throw "can't get info";
    }

    let rcsFile     = lines[1].substr('RCS file: '.length);
    let workingFile = lines[2].substr('Working file: '.length);
    let head        = lines[3].substr('head: '.length);
    let locker      = lines[6].substr(1).split(':')[0];

    if (locker === 'ccess list') {
        locker = undefined;
    }

    return {rcsFile, workingFile, head, locker};
}

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