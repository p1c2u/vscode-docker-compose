'use strict';
import * as vscode from 'vscode';
import { AppInsightsClient } from "./telemetry/appInsightsClient";
import { NullClient } from "./telemetry/nullClient";
import { WorkspaceConfigurator } from "./configurators/workspaceConfigurator";
import { DockerComposeProvider } from "./explorers/providers";
import { ContainerNode } from "./containers/views";
import { ProjectNode } from "./projects/views";
import { ServiceNode } from "./services/views";

export function activate(context: vscode.ExtensionContext) {
    const configuration = WorkspaceConfigurator.getConfiguration();

    const interval = WorkspaceConfigurator.getConfiguration().get<number>("autoRefreshInterval");
    const files = configuration.get<string[]>("files");
    const shell = configuration.get<string>("shell");
    const projectNames = configuration.get<string[]>("projectNames");
    const isTelemetryEnabled = configuration.get<boolean>("enableTelemetry");
    const telemetryClient = isTelemetryEnabled ? new AppInsightsClient("1234-1234-1234-1234") : new NullClient();

    const provider = new DockerComposeProvider(context, files, shell, projectNames);
    provider.setAutoRefresh(interval);

    vscode.window.registerTreeDataProvider("dockerComposeServices", provider);

    telemetryClient.sendEvent("loadExtension");

    let refreshExplorer = vscode.commands.registerCommand("docker-compose.explorer.refresh", () => {
        provider.refresh();
        telemetryClient.sendEvent("refreshExplorer");
    });

    let shellService = vscode.commands.registerCommand("docker-compose.service.shell", (node: ServiceNode) => {
        provider.shellService(node);
        telemetryClient.sendEvent("shellService");
    });

    let startProject = vscode.commands.registerCommand("docker-compose.project.start", (node: ProjectNode) => {
        provider.startProject(node);
        telemetryClient.sendEvent("startProject");
    });

    let stopProject = vscode.commands.registerCommand("docker-compose.project.stop", (node: ProjectNode) => {
        provider.stopProject(node);
        telemetryClient.sendEvent("stopProject");
    });

    let upProject = vscode.commands.registerCommand("docker-compose.project.up", (node: ProjectNode) => {
        provider.upProject(node);
        telemetryClient.sendEvent("upProject");
    });

    let downProject = vscode.commands.registerCommand("docker-compose.project.down", (node: ProjectNode) => {
        provider.downProject(node);
        telemetryClient.sendEvent("downProject");
    });

    let upService = vscode.commands.registerCommand("docker-compose.service.up", (node: ServiceNode) => {
        provider.upService(node);
        telemetryClient.sendEvent("upService");
    });

    let downService = vscode.commands.registerCommand("docker-compose.service.down", (node: ServiceNode) => {
        provider.downService(node);
        telemetryClient.sendEvent("downService");
    });

    let startService = vscode.commands.registerCommand("docker-compose.service.start", (node: ServiceNode) => {
        provider.startService(node);
        telemetryClient.sendEvent("startService");
    });

    let stopService = vscode.commands.registerCommand("docker-compose.service.stop", (node: ServiceNode) => {
        provider.stopService(node);
        telemetryClient.sendEvent("stopService");
    });

    let restartService = vscode.commands.registerCommand("docker-compose.service.restart", (node: ServiceNode) => {
        provider.restartService(node);
        telemetryClient.sendEvent("restartService");
    });

    let buildService = vscode.commands.registerCommand("docker-compose.service.build", (node: ServiceNode) => {
        provider.buildService(node);
        telemetryClient.sendEvent("buildService");
    });

    let killService = vscode.commands.registerCommand("docker-compose.service.kill", (node: ServiceNode) => {
        provider.killService(node);
        telemetryClient.sendEvent("killService");
    });

    let attachContainer = vscode.commands.registerCommand("docker-compose.container.attach", (node: ContainerNode) => {
        provider.attachContainer(node);
        telemetryClient.sendEvent("attachContainer");
    });

    let logsContainer = vscode.commands.registerCommand("docker-compose.container.logs", (node: ContainerNode) => {
        provider.logsContainer(node);
        telemetryClient.sendEvent("logsContainer");
    });

    let startContainer = vscode.commands.registerCommand("docker-compose.container.start", (node: ContainerNode) => {
        provider.startContainer(node);
        telemetryClient.sendEvent("startContainer");
    });

    let stopContainer = vscode.commands.registerCommand("docker-compose.container.stop", (node: ContainerNode) => {
        provider.stopContainer(node);
        telemetryClient.sendEvent("stopContainer");
    });

    let killContainer = vscode.commands.registerCommand("docker-compose.container.kill", (node: ContainerNode) => {
        provider.killContainer(node);
        telemetryClient.sendEvent("killContainer");
    });

    context.subscriptions.push(upProject);
    context.subscriptions.push(downProject);
    context.subscriptions.push(startProject);
    context.subscriptions.push(stopProject);
    context.subscriptions.push(shellService);
    context.subscriptions.push(upService);
    context.subscriptions.push(downService);
    context.subscriptions.push(startService);
    context.subscriptions.push(stopService);
    context.subscriptions.push(restartService);
    context.subscriptions.push(buildService);
    context.subscriptions.push(killService);
    context.subscriptions.push(attachContainer);
    context.subscriptions.push(logsContainer);
    context.subscriptions.push(startContainer);
    context.subscriptions.push(stopContainer);
    context.subscriptions.push(killContainer);
}

export function deactivate() {
}