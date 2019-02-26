import { TreeItem, TreeItemCollapsibleState, ExtensionContext } from "vscode";
import { ResourceType } from "../enums";
import { ContainerState } from "../containers/enums";
import { Container } from "../containers/models";
import { ComposeNode } from "../compose/views";

export class ContainerNode extends ComposeNode {

    // iconPath = {
	// 	light: path.join(__filename, '..', '..', '..', 'resources', 'light'),
	// 	dark: path.join(__filename, '..', '..', '..', 'resources', 'dark')
	// };

    constructor(
        context: ExtensionContext,
        public readonly container: Container
	) {
		super(context);
    }

    async getChildren(): Promise<ComposeNode[]> {
        return [];
    }

    async getTreeItem(): Promise<TreeItem> {
        const item = new TreeItem(this.container.name, TreeItemCollapsibleState.None);

        item.contextValue = ResourceType.ExitedContainer;
        var iconPath = this.context.asAbsolutePath('resources/service-exit.png');

        if (this.container.state == ContainerState.Up) {
            item.contextValue = ResourceType.RunningContainer;

            var iconPath = this.context.asAbsolutePath('resources/service-up-unhealthy.png');
            if (this.container.healthy)
                var iconPath = this.context.asAbsolutePath('resources/service-up-healthy.png');
        }

        item.iconPath = {
            dark: iconPath,
            light: iconPath
        };

        return item;
    }
}
