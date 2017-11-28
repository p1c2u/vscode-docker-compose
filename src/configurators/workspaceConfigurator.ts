"use strict";
import * as vscode from "vscode";

export class WorkspaceConfigurator {

    public static getConfiguration(): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration("docker-compose");
    }

}