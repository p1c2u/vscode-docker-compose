import { window, ExtensionContext, TreeItem, TreeItemCollapsibleState, ThemeIcon, MarkdownString, ThemeColor } from 'vscode';
import { ResourceType } from "../enums";
import { ComposeExecutorError, ComposeCommandNotFound, ComposeFileNotFound, DockerExecutorError } from "../executors/exceptions";
import { ExplorerNode } from '../explorers/views';

export class MessageNode extends ExplorerNode {

    constructor(
        public readonly context: ExtensionContext,
        private readonly message: string,
        private readonly iconId: string | undefined = null,
        private readonly iconColorId: string | undefined = null,
        private readonly tooltip: string | MarkdownString | undefined = null
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
            if (this.iconColorId !== undefined)
                item.iconPath = new ThemeIcon(this.iconId, new ThemeColor(this.iconColorId));
            else
                item.iconPath = new ThemeIcon(this.iconId);
        if (this.tooltip !== undefined)
            item.tooltip = this.tooltip
        return item;
    }

    handleError(err: Error): ComposeNode[] | Promise<ComposeNode[]> {
        return [];
    }
        
}

export abstract class ComposeNode extends ExplorerNode {

    protected children: ComposeNode[] | undefined;

    handleError(err: Error): MessageNode[] {
        let message = 'unexpected error';
        if (err instanceof DockerExecutorError) {
            message = 'Failed to execute docker command';
        } else if (err instanceof ComposeFileNotFound) {
            message = 'No docker compose file(s)';
        } else if (err instanceof ComposeCommandNotFound) {
            message = 'Command docker compose not found';
        } else if (err instanceof ComposeExecutorError) {
            message = 'Failed to execute docker compose command';
        } else {
            window.showErrorMessage("Docker-Compose Extension Error: " + err.message);
        }
        return [new MessageNode(this.context, message, 'error', 'problemsErrorIcon.foreground', err.message)];
    }

}
