'use strict';
import * as path from 'path';
import { Command, TreeItem, TreeItemCollapsibleState, ExtensionContext } from "vscode";
import { ResourceType } from "../enums";
import { Service } from "../models/service";
import { ContainerNode } from "../views/containerNode";
import { ExplorerNode } from "../views/explorerNode";

export class ServiceNode extends ExplorerNode {

    // iconPath = {
	// 	light: path.join(__filename, '..', '..', '..', 'resources', 'light'),
	// 	dark: path.join(__filename, '..', '..', '..', 'resources', 'dark')
	// };

    constructor(
        context: ExtensionContext,
        public readonly service: Service
	) {
		super(context);
    }

    async getChildren(): Promise<ExplorerNode[]> {
        this.resetChildren();

        const containers = this.service.getContainers();

        let context = this.context;
        this.children = containers
            .map((container) => new ContainerNode(context, container));
        return this.children;
    }

    async getTreeItem(): Promise<TreeItem> {
        const item = new TreeItem(this.service.name, TreeItemCollapsibleState.Expanded);
        // item.iconPath = this.iconPath;
        item.contextValue = ResourceType.Service;
        return item;
    }
}