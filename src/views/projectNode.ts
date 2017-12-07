'use strict';
import { TreeItem, TreeItemCollapsibleState, ExtensionContext } from 'vscode';
import { ResourceType } from "../enums";
import { Project } from "../models/project";
import { ExplorerNode } from '../views/explorerNode';
import { ServiceNode } from "../views/serviceNode";

export class ProjectNode extends ExplorerNode {

    constructor(
        context: ExtensionContext,
        public readonly project: Project
    ) {
        super(context);
    }

    async getChildren(): Promise<ExplorerNode[]> {
        this.resetChildren();

        this.project.refreshContainers();
        const services = this.project.getServices();

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