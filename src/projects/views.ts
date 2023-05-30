import { TreeItem, TreeItemCollapsibleState, Uri, ExtensionContext, window } from 'vscode';
import { ResourceType } from "../enums";
import { Project, Workspace } from "../projects/models";
import { ServiceNode } from "../services/views";
import { ComposeNode, MessageNode } from '../compose/views';
import { DockerComposeCommandNotFound } from '../executors/exceptions';
import { ExplorerNode } from '../explorers/views';

export class ProjectNode extends ComposeNode {

    constructor(
        context: ExtensionContext,
        public readonly project: Project
    ) {
        super(context);
    }

    async getChildren(): Promise<ComposeNode[]> {
        this.resetChildren();

        let services;

        this.project.refreshContainers();

        services = this.project.getServices();

        this.children = services
            .map(service => new ServiceNode(this.context, service));
        return this.children;
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem(this.project.name, TreeItemCollapsibleState.Expanded);
        item.contextValue = ResourceType.Project;
        return item;
    }

}

export class ProjectsNode extends ComposeNode {

    constructor(
        context: ExtensionContext,
        private readonly workspace: Workspace
    ) {
        super(context);
    }

    async getChildren(): Promise<ExplorerNode[]> {
        this.resetChildren();

        try {
            this.workspace.validate()
        } catch (err) {
            if (err instanceof DockerComposeCommandNotFound) {
                window.showErrorMessage("Docker Compose executable not found.");
                return [
                    new MessageNode(this.context, 'Docker Compose not found.', "error")
                ];
            }
        }
        this.children = this.workspace.getProjects()
            .map(project => new ProjectNode(this.context, project));
        return this.children;
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem(`Projects`, TreeItemCollapsibleState.Expanded);
        item.contextValue = ResourceType.Projects;
        return item;
    }
}
