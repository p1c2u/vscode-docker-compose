import { TreeItem, TreeItemCollapsibleState, Uri, ExtensionContext, window } from 'vscode';
import { ResourceType } from "../enums";
import { Project } from "../projects/models";
import { ServiceNode } from "../services/views";
import { ComposeNode } from '../compose/views';

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
        private readonly projects: Project[]
    ) {
        super(context);
    }

    async getChildren(): Promise<ComposeNode[]> {
        this.resetChildren();

        this.children = this.projects
            .map(project => new ProjectNode(this.context, project));
        return this.children;
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem(`Projects`, TreeItemCollapsibleState.Expanded);
        item.contextValue = ResourceType.Projects;
        return item;
    }
}
