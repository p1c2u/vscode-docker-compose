'use strict';
import * as vscode from 'vscode';
import { AppInsightsClient } from "./telemetry/appInsightsClient";
import { NullClient } from "./telemetry/nullClient";
import { WorkspaceConfigurator } from "./configurators/workspaceConfigurator";
import { DockerComposeProjectsProvider, DockerComposeServicesProvider } from "./explorers/providers";
import { ContainerNode } from "./containers/views";
import { ProjectNode } from "./projects/views";
import { ServiceNode } from "./services/views";
import { Workspace } from './projects/models';

export function activate(context: vscode.ExtensionContext) {
    const configuration = WorkspaceConfigurator.getConfiguration();

    const interval = configuration.get<number>("autoRefreshInterval");
    const files = configuration.get<string[]>("files");
    const shell = configuration.get<string>("shell");
    const projectNames = configuration.get<string[]>("projectNames");
    const isTelemetryEnabled = configuration.get<boolean>("enableTelemetry");
    const telemetryClient = isTelemetryEnabled ? new AppInsightsClient("1234-1234-1234-1234") : new NullClient();

    const workspace = new Workspace(
        vscode.workspace && vscode.workspace.workspaceFolders,
        projectNames,
        files,
        shell
    );

    const projectsProvider = new DockerComposeProjectsProvider(context, workspace);
    const servicesProvider = new DockerComposeServicesProvider(context, workspace);
    
    servicesProvider.setAutoRefresh(interval);

    vscode.window.registerTreeDataProvider("dockerComposeServices", servicesProvider);

    vscode.window.createTreeView('dockerComposeProjects', { treeDataProvider: projectsProvider, canSelectMany: true});

    telemetryClient.sendEvent("loadExtension");

    const refreshExplorer = vscode.commands.registerCommand("docker-compose.explorer.refresh", () => {
        servicesProvider.refresh();
        telemetryClient.sendEvent("refreshExplorer");
    });

    const shellService = vscode.commands.registerCommand("docker-compose.service.shell", (node: ServiceNode) => {
        servicesProvider.shellService(node);
        telemetryClient.sendEvent("shellService");
    });

    const selectProject = vscode.commands.registerCommand("docker-compose.project.select", (node: ProjectNode) => {
        // projectsProvider.selectProject(node);
        servicesProvider.selectProject(node);
        telemetryClient.sendEvent("selectProject");
    });

    const startProject = vscode.commands.registerCommand("docker-compose.project.start", (node: ProjectNode) => {
        servicesProvider.startProject(node);
        telemetryClient.sendEvent("startProject");
    });

    const stopProject = vscode.commands.registerCommand("docker-compose.project.stop", (node: ProjectNode) => {
        servicesProvider.stopProject(node);
        telemetryClient.sendEvent("stopProject");
    });

    const upProject = vscode.commands.registerCommand("docker-compose.project.up", (node: ProjectNode) => {
        servicesProvider.upProject(node);
        telemetryClient.sendEvent("upProject");
    });

    const downProject = vscode.commands.registerCommand("docker-compose.project.down", (node: ProjectNode) => {
        servicesProvider.downProject(node);
        telemetryClient.sendEvent("downProject");
    });

    const upService = vscode.commands.registerCommand("docker-compose.service.up", (node: ServiceNode) => {
        servicesProvider.upService(node);
        telemetryClient.sendEvent("upService");
    });

    const downService = vscode.commands.registerCommand("docker-compose.service.down", (node: ServiceNode) => {
        servicesProvider.downService(node);
        telemetryClient.sendEvent("downService");
    });

    const startService = vscode.commands.registerCommand("docker-compose.service.start", (node: ServiceNode) => {
        servicesProvider.startService(node);
        telemetryClient.sendEvent("startService");
    });

    const stopService = vscode.commands.registerCommand("docker-compose.service.stop", (node: ServiceNode) => {
        servicesProvider.stopService(node);
        telemetryClient.sendEvent("stopService");
    });

    const restartService = vscode.commands.registerCommand("docker-compose.service.restart", (node: ServiceNode) => {
        servicesProvider.restartService(node);
        telemetryClient.sendEvent("restartService");
    });

    const buildService = vscode.commands.registerCommand("docker-compose.service.build", (node: ServiceNode) => {
        servicesProvider.buildService(node);
        telemetryClient.sendEvent("buildService");
    });

    const killService = vscode.commands.registerCommand("docker-compose.service.kill", (node: ServiceNode) => {
        servicesProvider.killService(node);
        telemetryClient.sendEvent("killService");
    });

    const attachContainer = vscode.commands.registerCommand("docker-compose.container.attach", (node: ContainerNode) => {
        servicesProvider.attachContainer(node);
        telemetryClient.sendEvent("attachContainer");
    });

    const logsContainer = vscode.commands.registerCommand("docker-compose.container.logs", (node: ContainerNode) => {
        servicesProvider.logsContainer(node);
        telemetryClient.sendEvent("logsContainer");
    });

    const startContainer = vscode.commands.registerCommand("docker-compose.container.start", (node: ContainerNode) => {
        servicesProvider.startContainer(node);
        telemetryClient.sendEvent("startContainer");
    });

    const stopContainer = vscode.commands.registerCommand("docker-compose.container.stop", (node: ContainerNode) => {
        servicesProvider.stopContainer(node);
        telemetryClient.sendEvent("stopContainer");
    });

    const killContainer = vscode.commands.registerCommand("docker-compose.container.kill", (node: ContainerNode) => {
        servicesProvider.killContainer(node);
        telemetryClient.sendEvent("killContainer");
    });

    context.subscriptions.push(selectProject);
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
