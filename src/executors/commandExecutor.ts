"use strict";
import { exec, execSync } from "child_process";
import * as vscode from "vscode";

export class CommandExecutor {

    private _cwd: string;

    constructor(cwd: string = null) {
        this._cwd = cwd;
    }

    public static runInTerminal(command: string, addNewLine: boolean = true, terminal: string = "Docker Compose"): void {
        if (this.terminals[terminal] === undefined ) {
            this.terminals[terminal] = vscode.window.createTerminal(terminal);
        }
        this.terminals[terminal].show();
        this.terminals[terminal].sendText(command, addNewLine);
    }

    public static exec(command: string) {
        return exec(command);
    }

    public execSync(command: string) {
        return execSync(command, {cwd: this._cwd,  encoding: "utf8" });
    }

    public static onDidCloseTerminal(closedTerminal: vscode.Terminal): void {
        delete this.terminals[closedTerminal.name];
    }

    private static terminals: { [id: string]: vscode.Terminal } = {};
}