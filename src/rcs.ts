import { exec } from 'child_process';
import * as path from 'path'
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