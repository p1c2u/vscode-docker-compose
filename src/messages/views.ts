import { TreeItem, TreeItemCollapsibleState, ExtensionContext, window } from 'vscode';
import { ResourceType } from "../enums";
import { Project } from "../projects/models";
import { ExplorerNode } from '../explorers/views';

export class MessageNode extends ExplorerNode {

    constructor(
        public readonly context: ExtensionContext,
        private readonly message: string
    ) {
        super(context);
    }

    getChildren(): ExplorerNode[] | Promise<ExplorerNode[]> {
        return [];
    }

    getTreeItem(): TreeItem | Promise<TreeItem> {
        const item = new TreeItem(this.message, TreeItemCollapsibleState.None);
        item.contextValue = ResourceType.Message;
        return item;
    }
}
