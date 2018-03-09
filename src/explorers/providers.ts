import { TreeItem, TreeDataProvider, EventEmitter, Event, workspace, ExtensionContext } from "vscode";
import { Project } from "../projects/models";
import { ContainerNode } from "../containers/views";
import { ExplorerNode } from "../explorers/views";
import { ProjectNode, ProjectsNode } from "../projects/views";
import { ServiceNode } from "../services/views";
import { DockerComposeCommandExecutor } from "../executors/dockerComposeCommandExecutor";

export class AutoRefreshTreeDataProvider<T> {

    private autoRefreshEnabled: boolean;
    private debounceTimer: NodeJS.Timer;

    constructor(protected context: ExtensionContext) {
        this.autoRefreshEnabled = true;
    }

    private _onDidChangeAutoRefresh = new EventEmitter<void>();
    public get onDidChangeAutoRefresh(): Event<void> {
        return this._onDidChangeAutoRefresh.event;
    }

    private _onDidChangeTreeData = new EventEmitter<any>();
    public get onDidChangeTreeData(): Event<any> {
        return this._onDidChangeTreeData.event;
    }

    public setAutoRefresh(interval: number): void {
        if (interval > 0) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setInterval(() => {
                if (this.autoRefreshEnabled)
                    this.refresh();
            }, interval);
        }
    }

    async refresh(root?: T): Promise<void> {
        this._onDidChangeTreeData.fire();
    }

    public disableAutoRefresh() {
        this.autoRefreshEnabled = false;
    }

    public enableAutoRefresh() {
        this.autoRefreshEnabled = true;
    }

}

export class DockerComposeProvider extends AutoRefreshTreeDataProvider<any> implements TreeDataProvider<ExplorerNode> {
    
        private _root?: ExplorerNode;
        private _loading: Promise<void> | undefined;

        constructor(
            context: ExtensionContext,
            private files: string[],
            private shell: string,
            private projectNames: string[]
        ) {
            super(context);
            let projects = workspace.workspaceFolders.map((folder) => {
                let name = projectNames[folder.index] || folder.name.replace(/[^\w\s]/gi, '');
                let executor = new DockerComposeCommandExecutor(name, files, shell, folder.uri.path);
                return new Project(name, executor);
            });
            this._root = new ProjectsNode(this.context, projects);
        }

        async getChildren(node?: ExplorerNode): Promise<ExplorerNode[]> {
            if (this._loading !== undefined) {
                await this._loading;
                this._loading = undefined;
            }
        
            if (node === undefined) return this._root.getChildren();
            return node.getChildren();
        }
    
        async getTreeItem(node: ExplorerNode): Promise<TreeItem> {
            return node.getTreeItem();
        }

        public async upProject(node: ProjectNode): Promise<void> {
            node.project.up();
        }
    
        public async downProject(node: ProjectNode): Promise<void> {
            node.project.down();
        }
    
        public async shellService(node: ServiceNode): Promise<void> {
            node.service.shell();
        }
    
        public async upService(node: ServiceNode): Promise<void> {
            node.service.up();
        }
    
        public async downService(node: ServiceNode): Promise<void> {
            node.service.down();
        }
    
        public async buildService(node: ServiceNode): Promise<void> {
            node.service.build();
        }
    
        public async startService(node: ServiceNode): Promise<void> {
            node.service.start();
        }
    
        public async stopService(node: ServiceNode): Promise<void> {
            node.service.stop();
        }
    
        public async restartService(node: ServiceNode): Promise<void> {
            node.service.restart();
        }
    
        public async killService(node: ServiceNode): Promise<void> {
            node.service.kill();
        }
    
        public async attachContainer(node: ContainerNode): Promise<void> {
            node.container.attach();
        }
    
        public async startContainer(node: ContainerNode): Promise<void> {
            node.container.start();
        }
    
        public async killContainer(node: ContainerNode): Promise<void> {
            node.container.kill();
        }
    
    }
    