import { Command, Disposable, ExtensionContext, TreeItem, TreeItemCollapsibleState } from 'vscode';

export abstract class ExplorerNode extends Disposable {

    protected children: ExplorerNode[] | undefined;
    protected disposable: Disposable | undefined;

    constructor(
        public readonly context: ExtensionContext
    ) {
        super(() => this.dispose());
    }

    dispose() {
        if (this.disposable !== undefined) {
            this.disposable.dispose();
            this.disposable = undefined;
        }

        this.resetChildren();
    }

    abstract getChildren(): ExplorerNode[] | Promise<ExplorerNode[]>;
    abstract getTreeItem(): TreeItem | Promise<TreeItem>;

    getCommand(): Command | undefined {
        return undefined;
    }

    resetChildren() {
        if (this.children !== undefined) {
            this.children.forEach(c => c.dispose());
            this.children = undefined;
        }
    }
}
