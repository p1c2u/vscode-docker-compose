'use strict';
import * as vscode from 'vscode';
import { AppInsightsClient } from "./telemetry/appInsightsClient";
import { NullClient } from "./telemetry/nullClient";
import { WorkspaceConfigurator } from "./configurators/workspaceConfigurator";
import { DockerComposeCommandExecutor } from "./executors/dockerComposeCommandExecutor";
import { DockerComposeProvider } from "./providers/dockerComposeProvider";
import { DockerComposeTreeDataProvider } from "./providers/dockerComposeTreeDataProvider";

export function activate(context: vscode.ExtensionContext) {
    const configuration = WorkspaceConfigurator.getConfiguration();

    const files = configuration.get<string[]>("files");
    const shell = configuration.get<string>("shell");
    const isTelemetryEnabled = configuration.get<boolean>("enableTelemetry");
    const telemetryClient = isTelemetryEnabled ? new AppInsightsClient("1234-1234-1234-1234") : new NullClient();

    const dockerComposeCommandExecutor = new DockerComposeCommandExecutor(files, shell, vscode.workspace.rootPath);
    const dockerComposeProvider = new DockerComposeProvider(dockerComposeCommandExecutor);
    const dockerComposeTreeDataProvider = new DockerComposeTreeDataProvider(context, dockerComposeProvider);

    vscode.window.registerTreeDataProvider("dockerCompose", dockerComposeTreeDataProvider);

    telemetryClient.sendEvent("loadExtension");

    let refreshDockerComposeTree = vscode.commands.registerCommand("docker-compose.refreshDockerComposeTree", () => {
        dockerComposeTreeDataProvider.refreshDockerComposeTree();
        telemetryClient.sendEvent("refreshDockerComposeTree");
    });

    let attachService = vscode.commands.registerCommand("docker-compose.attachService", (treeItem) => {
        dockerComposeTreeDataProvider.attachService(treeItem.label);
        telemetryClient.sendEvent("attachService");
    });

    let shellService = vscode.commands.registerCommand("docker-compose.shellService", (treeItem) => {
        dockerComposeTreeDataProvider.shellService(treeItem.label);
        telemetryClient.sendEvent("shellService");
    });

    let upService = vscode.commands.registerCommand("docker-compose.upService", (treeItem) => {
        dockerComposeTreeDataProvider.upService(treeItem.label);
        telemetryClient.sendEvent("upService");
    });

    let startService = vscode.commands.registerCommand("docker-compose.startService", (treeItem) => {
        dockerComposeTreeDataProvider.startService(treeItem.label);
        telemetryClient.sendEvent("startService");
    });

    let stopService = vscode.commands.registerCommand("docker-compose.stopService", (treeItem) => {
        dockerComposeTreeDataProvider.stopService(treeItem.label);
        telemetryClient.sendEvent("stopService");
    });

    let restartService = vscode.commands.registerCommand("docker-compose.restartService", (treeItem) => {
        dockerComposeTreeDataProvider.restartService(treeItem.label);
        telemetryClient.sendEvent("restartService");
    });

    let buildService = vscode.commands.registerCommand("docker-compose.buildService", (treeItem) => {
        dockerComposeTreeDataProvider.buildService(treeItem.label);
        telemetryClient.sendEvent("buildService");
    });

    let killService = vscode.commands.registerCommand("docker-compose.killService", (treeItem) => {
        dockerComposeTreeDataProvider.killService(treeItem.label);
        telemetryClient.sendEvent("killService");
    });

    let downContainers = vscode.commands.registerCommand("docker-compose.downContainers", () => {
        dockerComposeTreeDataProvider.downContainers();
        telemetryClient.sendEvent("downContainers");
    });

    context.subscriptions.push(refreshDockerComposeTree);
    context.subscriptions.push(attachService);
    context.subscriptions.push(shellService);
    context.subscriptions.push(upService);
    context.subscriptions.push(startService);
    context.subscriptions.push(stopService);
    context.subscriptions.push(restartService);
    context.subscriptions.push(buildService);
    context.subscriptions.push(killService);
    context.subscriptions.push(downContainers);
}

export function deactivate() {
}