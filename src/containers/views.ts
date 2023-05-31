import { TreeItem, TreeItemCollapsibleState, ExtensionContext, MarkdownString, ThemeIcon, ThemeColor, Color } from "vscode";
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

        item.tooltip = new MarkdownString(`### ${this.container.name}`);
        item.tooltip.supportHtml = true;
        item.tooltip.isTrusted = true;

        // custom iconPath
        // var iconPath = this.context.asAbsolutePath('resources/service-exit.png');
        // if (this.container.state == ContainerState.Up) {
        //     item.contextValue = ResourceType.RunningContainer;

        //     var iconPath = this.context.asAbsolutePath('resources/service-up-unhealthy.png');
        //     if (this.container.healthy)
        //         var iconPath = this.context.asAbsolutePath('resources/service-up-healthy.png');
        // }
        // item.iconPath = {
        //     dark: iconPath,
        //     light: iconPath
        // };

        let iconId: string;
        let iconColorId: string;
        let tooltipColor: string;
        if (this.container.state == ContainerState.Up) {
            item.contextValue = ResourceType.RunningContainer;

            if (this.container.healthy) {
                iconId = "vm-running";
                iconColorId = "debugIcon.startForeground";
                tooltipColor = "#99ff99";
            } else {
                iconId = "vm-active";
                iconColorId = "problemsWarningIcon.foreground";
                tooltipColor = "#ffc600";
            }
        } else {
            item.contextValue = ResourceType.ExitedContainer;
    
            iconId = "vm";
            iconColorId = "problemsErrorIcon.foreground";
            tooltipColor = "#ff9999";
        }
        let iconColor = new ThemeColor(iconColorId);
        item.iconPath = new ThemeIcon(iconId, iconColor);
        item.tooltip.appendMarkdown(`\n<span style="color:${tooltipColor};">${this.container.status}</span>`);

        return item;
    }
}
