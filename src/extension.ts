'use strict';
import * as vscode from 'vscode';
import { Project } from "./models/project";
import { AppInsightsClient } from "./telemetry/appInsightsClient";
import { NullClient } from "./telemetry/nullClient";
import { WorkspaceConfigurator } from "./configurators/workspaceConfigurator";
import { DockerComposeCommandExecutor } from "./executors/dockerComposeCommandExecutor";
import { DockerComposeExplorer } from "./explorers/dockerComposeExplorer";
import { ProjectsNode } from "./views/projectsNode";

export function activate(context: vscode.ExtensionContext) {
    const configuration = WorkspaceConfigurator.getConfiguration();

    const files = configuration.get<string[]>("files");
    const shell = configuration.get<string>("shell");
    const projectNames = configuration.get<string[]>("projectNames");
    const isTelemetryEnabled = configuration.get<boolean>("enableTelemetry");
    const telemetryClient = isTelemetryEnabled ? new AppInsightsClient("1234-1234-1234-1234") : new NullClient();

    const explorer = new DockerComposeExplorer(context, files, shell, projectNames);

    vscode.window.registerTreeDataProvider("dockerCompose", explorer);

    telemetryClient.sendEvent("loadExtension");

    let refreshExplorer = vscode.commands.registerCommand("docker-compose.refreshExplorer", () => {
        explorer.refresh();
        telemetryClient.sendEvent("refreshExplorer");
    });

    let shellService = vscode.commands.registerCommand("docker-compose.shellService", (node) => {
        explorer.shellService(node);
        telemetryClient.sendEvent("shellService");
    });

    let upProject = vscode.commands.registerCommand("docker-compose.upProject", (node) => {
        explorer.upProject(node);
        telemetryClient.sendEvent("upProject");
    });

    let downProject = vscode.commands.registerCommand("docker-compose.downProject", (node) => {
        explorer.downProject(node);
        telemetryClient.sendEvent("downProject");
    });

    let upService = vscode.commands.registerCommand("docker-compose.upService", (node) => {
        explorer.upService(node);
        telemetryClient.sendEvent("upService");
    });

    let downService = vscode.commands.registerCommand("docker-compose.downService", (node) => {
        explorer.downService(node);
        telemetryClient.sendEvent("downService");
    });

    let startService = vscode.commands.registerCommand("docker-compose.startService", (node) => {
        explorer.startService(node);
        telemetryClient.sendEvent("startService");
    });

    let stopService = vscode.commands.registerCommand("docker-compose.stopService", (node) => {
        explorer.stopService(node);
        telemetryClient.sendEvent("stopService");
    });

    let restartService = vscode.commands.registerCommand("docker-compose.restartService", (node) => {
        explorer.restartService(node);
        telemetryClient.sendEvent("restartService");
    });

    let buildService = vscode.commands.registerCommand("docker-compose.buildService", (node) => {
        explorer.buildService(node);
        telemetryClient.sendEvent("buildService");
    });

    let killService = vscode.commands.registerCommand("docker-compose.killService", (node) => {
        explorer.killService(node);
        telemetryClient.sendEvent("killService");
    });

    let attachContainer = vscode.commands.registerCommand("docker-compose.attachContainer", (node) => {
        explorer.attachContainer(node);
        telemetryClient.sendEvent("attachContainer");
    });

    let startContainer = vscode.commands.registerCommand("docker-compose.startContainer", (node) => {
        explorer.startContainer(node);
        telemetryClient.sendEvent("startContainer");
    });

    let killContainer = vscode.commands.registerCommand("docker-compose.killContainer", (node) => {
        explorer.killContainer(node);
        telemetryClient.sendEvent("killContainer");
    });

    context.subscriptions.push(upProject);
    context.subscriptions.push(downProject);
    context.subscriptions.push(shellService);
    context.subscriptions.push(upService);
    context.subscriptions.push(downService);
    context.subscriptions.push(startService);
    context.subscriptions.push(stopService);
    context.subscriptions.push(restartService);
    context.subscriptions.push(buildService);
    context.subscriptions.push(killService);
    context.subscriptions.push(attachContainer);
    context.subscriptions.push(startContainer);
    context.subscriptions.push(killContainer);
}

export function deactivate() {
}