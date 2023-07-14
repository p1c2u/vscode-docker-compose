import { ChildProcess } from "child_process";
import * as vscode from 'vscode';
import { TreeItem, TreeDataProvider, EventEmitter, Event, workspace, window, ExtensionContext, Uri, TextDocument, Position } from "vscode";
import { Workspace } from "../projects/models";
import { ContainerNode } from "../containers/views";
import { ExplorerNode } from "../explorers/views";
import { ProjectNode, ProjectsNode } from "../projects/views";
import { ServiceNode } from "../services/views";

export class AutoRefreshTreeDataProvider<T> {

    private autoRefreshEnabled: boolean;
    private debounceTimer: NodeJS.Timer;

    constructor(protected context: ExtensionContext) {
        this.autoRefreshEnabled = true;
    }

    protected _onDidChangeAutoRefresh = new EventEmitter<void>();
    public get onDidChangeAutoRefresh(): Event<void> {
        return this._onDidChangeAutoRefresh.event;
    }

    protected _onDidChangeTreeData = new EventEmitter<any>();
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
        this._onDidChangeTreeData.fire(root);
    }

    public disableAutoRefresh() {
        this.autoRefreshEnabled = false;
    }

    public enableAutoRefresh() {
        this.autoRefreshEnabled = true;
    }

}

export class DockerComposeProjectsProvider implements TreeDataProvider<ExplorerNode> {

    private _root?: ExplorerNode;
    private _loading: Promise<void> | undefined;

    constructor(
        protected context: ExtensionContext,
        private workspace: Workspace,
    ) {
    }

    private _initRoot(): ExplorerNode {
        return new ProjectsNode(this.context, this.workspace, vscode.TreeItemCollapsibleState.None);
    }

    protected _onDidChangeTreeData = new EventEmitter<any>();
    public get onDidChangeTreeData(): Event<any> {
        return this._onDidChangeTreeData.event;
    }

    async refresh(root?: ExplorerNode): Promise<void> {
        this._onDidChangeTreeData.fire(root);
    }

    protected getRefreshCallable(node: ExplorerNode) {
        return this.refresh.bind(node);
    }

    public getRoot(): ExplorerNode {
        if (this._root === undefined)
            this._root = this._initRoot();
        return this._root;
    }

    async getChildren(node?:ExplorerNode): Promise<ExplorerNode[]> {
        if (this._loading !== undefined) {
            await this._loading;
            this._loading = undefined;
        }
    
        if (node === undefined) node = this.getRoot();

        try {
            return await node.getChildren();
        } catch (err) {
            return node.handleError(err);
        }
    }

    async getTreeItem(node: ExplorerNode): Promise<TreeItem> {
        return node.getTreeItem();
    }

    protected _onDidChangeSelect = new EventEmitter<any>();
    public get onDidChangeSelect(): Event<void> {
        return this._onDidChangeSelect.event;
    }

    public async startProject(node: ProjectNode): Promise<ChildProcess> {
        return node.project.start();
    }

    public async stopProject(node: ProjectNode): Promise<ChildProcess> {
        return node.project.stop();
    }

    public async upProject(node: ProjectNode): Promise<ChildProcess> {
        const child_process = node.project.up();
        child_process.on('close', this.getRefreshCallable(node));
        return child_process;
    }

    public async downProject(node: ProjectNode): Promise<ChildProcess> {
        const child_process = node.project.down();
        child_process.on('close', this.getRefreshCallable(node));
        return child_process;
    }

}

export class DockerComposeServicesProvider extends AutoRefreshTreeDataProvider<any> implements TreeDataProvider<ExplorerNode> {
    
        private _root?: ExplorerNode;
        private _loading: Promise<void> | undefined;

        constructor(
            context: ExtensionContext,
            private workspace: Workspace,
        ) {
            super(context);
        }

        private _initRoot(): ExplorerNode {
            return new ProjectsNode(this.context, this.workspace);
        }

        protected getRefreshCallable(node: ExplorerNode) {
            return this.refresh.bind(node);
        }

        public getRoot(): ExplorerNode {
            if (this._root === undefined)
                this._root = this._initRoot();
            return this._root;
        }

        async setRoot(node: ProjectNode): Promise<void> {
            this._root = new ProjectNode(node.context, node.project, vscode.TreeItemCollapsibleState.Expanded);
        }

        async getChildren(node?:ExplorerNode): Promise<ExplorerNode[]> {
            if (this._loading !== undefined) {
                await this._loading;
                this._loading = undefined;
            }
        
            if (node === undefined) node = this.getRoot();

            try {
                return await node.getChildren();
            } catch (err) {
                return node.handleError(err);
            }
        }
    
        async getTreeItem(node: ExplorerNode): Promise<TreeItem> {
            return node.getTreeItem();
        }

        public async selectProject(node: ProjectNode): Promise<void> {
            await this.setRoot(node);
            await this.refresh();
        }
    
        public async startProject(node: ProjectNode): Promise<ChildProcess> {
            return node.project.start();
        }
    
        public async stopProject(node: ProjectNode): Promise<ChildProcess> {
            return node.project.stop();
        }
    
        public async upProject(node: ProjectNode): Promise<ChildProcess> {
            const child_process = node.project.up();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async downProject(node: ProjectNode): Promise<ChildProcess> {
            const child_process = node.project.down();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async shellService(node: ServiceNode): Promise<void> {
            node.service.shell();
        }
    
        public async upService(node: ServiceNode): Promise<ChildProcess> {
            const child_process = node.service.up();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async downService(node: ServiceNode): Promise<ChildProcess> {
            const child_process = node.service.down();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async buildService(node: ServiceNode): Promise<ChildProcess> {
            const child_process = node.service.build();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async startService(node: ServiceNode): Promise<ChildProcess> {
            const child_process = node.service.start();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async stopService(node: ServiceNode): Promise<ChildProcess> {
            const child_process = node.service.stop();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async restartService(node: ServiceNode): Promise<ChildProcess> {
            const child_process = node.service.restart();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async killService(node: ServiceNode): Promise<ChildProcess> {
            const child_process = node.service.kill();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async attachContainer(node: ContainerNode): Promise<void> {
            node.container.attach();
        }
    
        public async logsContainer(node:ContainerNode): Promise<void> {
            const setting: Uri = Uri.parse("untitled:" + node.container.name + ".logs");
            const content = node.container.logs();
            vscode.workspace.openTextDocument(setting).then((doc: TextDocument) => {
                window.showTextDocument(doc, 1, false).then(editor => {
                    editor.edit(edit => {
                        edit.insert(new Position(0, 0), content);
                    });
                });
            });
        }

        public async startContainer(node: ContainerNode): Promise<ChildProcess> {
            const child_process = node.container.start();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async stopContainer(node: ContainerNode): Promise<ChildProcess> {
            const child_process = node.container.stop();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async killContainer(node: ContainerNode): Promise<ChildProcess> {
            const child_process = node.container.kill();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
    }
    