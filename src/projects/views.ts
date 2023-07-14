import { TreeItem, TreeItemCollapsibleState, ExtensionContext, ThemeIcon } from 'vscode';
import { ResourceType } from "../enums";
import { Project, Workspace } from "../projects/models";
import { ServiceNode } from "../services/views";
import { ComposeNode } from '../compose/views';
import { ExplorerNode } from '../explorers/views';

export class ProjectNode extends ComposeNode {

    constructor(
        context: ExtensionContext,
        public readonly project: Project,
        private readonly collapsbleState: TreeItemCollapsibleState = TreeItemCollapsibleState.Expanded
    ) {
        super(context);
    }

    async getChildren(): Promise<ComposeNode[]> {
        if (this.collapsbleState === TreeItemCollapsibleState.None)
            return [];

        this.resetChildren();

        const services = await this.project.getServices(false);

        this.children = services
            .map(service => new ServiceNode(this.context, service));
        return this.children;
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem(this.project.name, this.collapsbleState);
        item.contextValue = ResourceType.Project;
        item.iconPath = new ThemeIcon("multiple-windows");
        item.tooltip = this.project.cwd;
        item.command = { 
            title: 'Select Node',
            command: 'docker-compose.project.select',
            arguments: [this]
        };
        return item;
    }

}

export class ProjectsNode extends ComposeNode {

    constructor(
        context: ExtensionContext,
        private readonly workspace: Workspace,
        private readonly projectNodeCollapsbleState: TreeItemCollapsibleState = TreeItemCollapsibleState.Expanded
    ) {
        super(context);
    }

    async getChildren(): Promise<ExplorerNode[]> {
        this.resetChildren();

        try {
            this.workspace.validate();
        } catch (err) {
            return this.handleError(err);
        }
        this.children = this.workspace.getProjects(true)
            .map(project => new ProjectNode(this.context, project, this.projectNodeCollapsbleState));
        return this.children;
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem(`Projects`, TreeItemCollapsibleState.Expanded);
        item.contextValue = ResourceType.Projects;
        return item;
    }
}
