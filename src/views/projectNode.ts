'use strict';
import { TreeItem, TreeItemCollapsibleState, ExtensionContext, window } from 'vscode';
import { ResourceType } from "../enums";
import { Project } from "../models/project";
import { ExplorerNode } from '../views/explorerNode';
import { MessageNode } from '../views/messageNode';
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

        let services;

        try {
            this.project.refreshContainers();
        } catch (error) {
            return [new MessageNode(this.context, 'Failed to retrieve project containers')];
        }

        try {
            services = this.project.getServices();
        } catch (error) {
            return [new MessageNode(this.context, 'Failed to list project services')];
        }

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