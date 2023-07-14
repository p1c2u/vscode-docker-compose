import * as vscode from 'vscode';

export interface IDockerComposeConfig {
    enabled: boolean;
    projectName: string;
    autoRefreshInterval: number;
    showDockerCompose: boolean;
    enableTelemetry: boolean;
    shell: string;
    files: string[];
}

export const emptyConfig: IDockerComposeConfig = {
    enabled: true,
    projectName: vscode.workspace.rootPath,
    autoRefreshInterval: 10000,
    showDockerCompose: true,
    enableTelemetry: false,
    shell: "sh -c 'clear; (bash || ash || sh)'",
    files: ["docker-compose.yml"]
}
