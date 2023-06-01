import { TreeItem, TreeItemCollapsibleState, ExtensionContext } from "vscode";
import { ResourceType } from "../enums";
import { Service } from "../services/models";
import { ContainerNode } from "../containers/views";
import { ComposeNode } from "../compose/views";

export class ServiceNode extends ComposeNode {

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

    async getChildren(): Promise<ComposeNode[]> {
        this.resetChildren();

        const containers = await this.service.getContainers(true);

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
