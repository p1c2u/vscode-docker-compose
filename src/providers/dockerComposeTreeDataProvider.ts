import * as path from "path";
import * as vscode from "vscode";
import { CommandExecutor } from "../executors/commandExecutor";
import { DockerComposeCommandExecutor } from "../executors/dockerComposeCommandExecutor";
import { DockerComposeContainer, ContainerState } from "../models/dockerComposeContainer";
import { DockerComposeService } from "../models/dockerComposeService";
import { DockerComposeTreeItem } from "../models/dockerComposeTreeItem";
import { WorkspaceConfigurator } from "../configurators/workspaceConfigurator";
import { DockerComposeProvider } from "./dockerComposeProvider";

export class AutoRefreshTree<T> {
    public readonly onTreeDataChangedEmitter: vscode.EventEmitter<T | undefined> = new vscode.EventEmitter<T | undefined>();
    public readonly onDidChangeTreeData: vscode.Event<T | undefined> = this.onTreeDataChangedEmitter.event;

    private autoRefreshEnabled: boolean;
    private debounceTimer: NodeJS.Timer;

    constructor(protected context: vscode.ExtensionContext) {
        this.autoRefreshEnabled = true;
    }

    protected setAutoRefresh(getItemStringsCallback: () => DockerComposeTreeItem[]): void {
        const interval = WorkspaceConfigurator.getConfiguration().get<number>("autoRefreshInterval");
        if (interval > 0) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setInterval(() => {
                if (this.autoRefreshEnabled)
                    this.onTreeDataChangedEmitter.fire();
            }, interval);
        }
    }

    protected disableAutoRefresh() {
        this.autoRefreshEnabled = false;
    }

    protected enableAutoRefresh() {
        this.autoRefreshEnabled = true;
    }

}

export class DockerComposeTreeDataProvider extends AutoRefreshTree<DockerComposeTreeItem> implements vscode.TreeDataProvider<DockerComposeTreeItem> {

    private cachedServices = [];
    private provider: DockerComposeProvider;

    constructor(context: vscode.ExtensionContext, provider: DockerComposeProvider) {
        super(context);
        this.provider = provider;
    }

    public refreshDockerComposeTree(): void {
        this.enableAutoRefresh();
        this.onTreeDataChangedEmitter.fire();
    }

    public getTreeItem(element: DockerComposeTreeItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: DockerComposeTreeItem): Thenable<DockerComposeTreeItem[]> {
        if (!vscode.workspace.rootPath) {
			vscode.window.showInformationMessage('No compose in empty workspace');
			return Promise.resolve([]);
        }

        try {
            this.cachedServices = this.getServices();
        } catch (error) {
            vscode.window.showErrorMessage(`[Failed to list Docker Compose services] ${error.stderr}`);
            this.disableAutoRefresh();
        } finally {
            var provider = this;
            this.setAutoRefresh(function () { return provider.getServices(); });
        }

        return Promise.resolve(this.cachedServices);
    }

    public upService(serviceName: string): void {
        this.provider.upService(serviceName);
    }

    public startService(serviceName: string): void {
        this.provider.startService(serviceName);
    }

    public stopService(serviceName: string): void {
        this.provider.stopService(serviceName);
    }

    public buildService(serviceName: string): void {
        this.provider.buildService(serviceName);
    }

    public killService(serviceName: string): void {
        this.provider.killService(serviceName);
    }

    public downContainers(): void {
        this.provider.downContainers();
    }

    public restartService(serviceName: string): void {
        this.provider.restartService(serviceName);
    }

    private getContainers(): DockerComposeTreeItem[] {
        const services = [];

        let containers = this.provider.getContainers();
        containers.forEach((container) => {
            const imageState = container.state === "Up" ? "service-up.png" : "service-exit.png";
            const command = {
                command: "docker-compose.getService",
                title: container.name,
                arguments: [container.name],
            };
            const image = this.context.asAbsolutePath(path.join("resources", imageState));
            let treeItem = new DockerComposeTreeItem(container.name, image);
            services.push(treeItem);
        });
        return services;
    }

    private getServices(): DockerComposeTreeItem[] {
        let services = this.provider.getServices();

        return services.map((service, index, array) => {
            let state = ContainerState.Exit;
            let container = this.provider.getContainer(service.name);
            if (container != null) {
                if (container.state == ContainerState.Up) {
                    state = container.state;
                }
            }
            const imageState = state == ContainerState.Up ? "service-up.png": "service-exit.png";
            const image = this.context.asAbsolutePath(path.join("resources", imageState));
            return new DockerComposeTreeItem(service.name, image);
        });
    }
}
