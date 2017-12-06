"use strict";
import { exec, execSync } from "child_process";
import * as vscode from "vscode";

export class CommandExecutor {

    private terminals: { [id: string]: vscode.Terminal } = {};
    private _cwd: string;

    constructor(cwd: string = null) {
        this._cwd = cwd;

        if ('onDidCloseTerminal' in <any>vscode.window) {
            (<any>vscode.window).onDidCloseTerminal((terminal) => {
                this.onDidCloseTerminal(terminal);
            });
        }
    }

    public runInTerminal(command: string, addNewLine: boolean = true, terminal: string = "Docker Compose"): void {
        if (this.terminals[terminal] === undefined ) {
            this.terminals[terminal] = vscode.window.createTerminal(terminal);
            this.terminals[terminal].sendText(command, addNewLine);
        }
        this.terminals[terminal].show();
    }

    public exec(command: string) {
        return exec(command, {cwd: this._cwd,  encoding: "utf8" });
    }

    public execSync(command: string) {
        return execSync(command, {cwd: this._cwd,  encoding: "utf8" });
    }

    public onDidCloseTerminal(closedTerminal: vscode.Terminal): void {
        delete this.terminals[closedTerminal.name];
    }
}