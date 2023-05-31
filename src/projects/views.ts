import { TreeItem, TreeItemCollapsibleState, ExtensionContext, ThemeIcon } from 'vscode';
import { ResourceType } from "../enums";
import { Project, Workspace } from "../projects/models";
import { ServiceNode } from "../services/views";
import { ComposeNode } from '../compose/views';
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

        let services = await this.project.getServices(true);

        this.children = services
            .map(service => new ServiceNode(this.context, service));
        return this.children;
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem(this.project.name, TreeItemCollapsibleState.Expanded);
        item.contextValue = ResourceType.Project;
        item.iconPath = new ThemeIcon("multiple-windows");
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
            return this.handleError(err);
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
