'use strict';
import { TreeItem, TreeItemCollapsibleState, Uri, ExtensionContext } from 'vscode';
import { ResourceType } from "../enums";
import { Project } from "../models/project";
import { ExplorerNode } from './explorerNode';
import { ProjectNode } from '../views/projectNode';

export class ProjectsNode extends ExplorerNode {

    constructor(
        context: ExtensionContext,
        private readonly projects: Project[]
    ) {
        super(context);
    }

    async getChildren(): Promise<ExplorerNode[]> {
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