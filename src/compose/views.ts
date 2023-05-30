import { window, ExtensionContext, TreeItem, TreeItemCollapsibleState, ThemeIcon } from 'vscode';
import { ResourceType } from "../enums";
import { DockerComposeExecutorError, DockerComposeCommandNotFound, ComposeFileNotFound } from "../executors/exceptions";
import { ExplorerNode } from '../explorers/views';

export class MessageNode extends ExplorerNode {

    constructor(
        public readonly context: ExtensionContext,
        private readonly message: string,
        private readonly iconId: string | undefined = null
    ) {
        super(context);
    }

    getChildren(): ComposeNode[] | Promise<ComposeNode[]> {
        return [];
    }

    getTreeItem(): TreeItem | Promise<TreeItem> {
        const item = new TreeItem(this.message, TreeItemCollapsibleState.None);
        item.contextValue = ResourceType.Message;
        if (this.iconId !== undefined)
            item.iconPath = new ThemeIcon(this.iconId);
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
            window.showErrorMessage("Docker Compose Error: " + err.message);
            return [new MessageNode(this.context, 'unexpected error')];
        }
    }

}
