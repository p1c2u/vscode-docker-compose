import { ExtensionContext, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { ResourceType } from "../enums";
import { DockerComposeExecutorError, DockerComposeCommandNotFound, ComposeFileNotFound } from "../executors/exceptions";
import { ExplorerNode } from '../explorers/views';

export class MessageNode extends ExplorerNode {

    constructor(
        public readonly context: ExtensionContext,
        private readonly message: string
    ) {
        super(context);
    }

    getChildren(): ComposeNode[] | Promise<ComposeNode[]> {
        return [];
    }

    getTreeItem(): TreeItem | Promise<TreeItem> {
        const item = new TreeItem(this.message, TreeItemCollapsibleState.None);
        item.contextValue = ResourceType.Message;
        return item;
    }

    handleError(err: Error): ComposeNode[] | Promise<ComposeNode[]> {
        return [];
    }
        
}

export abstract class ComposeNode extends ExplorerNode {

    protected children: ComposeNode[] | undefined;

    handleError(err: Error): MessageNode[] {
        if (err instanceof ComposeFileNotFound) {
            return [new MessageNode(this.context, 'No docker compose file(s)')];
        } else if (err instanceof DockerComposeCommandNotFound) {
            return [new MessageNode(this.context, 'docker-compose command not found')];
        } else if (err instanceof DockerComposeExecutorError) {
            return [new MessageNode(this.context, 'Failed to execute script docker-compose')];
        } else {
            return [new MessageNode(this.context, 'unexpected error')];
        }
    }

}
