import * as path from 'path';
import { Command, TreeItem, TreeItemCollapsibleState } from "vscode";

export class DockerComposeTreeItem extends TreeItem {

    // iconPath = {
	// 	light: path.join(__filename, '..', '..', '..', 'resources', 'light'),
	// 	dark: path.join(__filename, '..', '..', '..', 'resources', 'dark')
	// };

    contextValue = 'dependency';

    command = {
        command: "docker-compose.getService",
        title: this.label,
        arguments: [this.label],
    }

    constructor(
        public readonly label: string,
        public readonly iconPath: string,
		public readonly collapsibleState?: TreeItemCollapsibleState,
	) {
		super(label, collapsibleState);
	}

}