import { ChildProcess } from "child_process";
import * as vscode from 'vscode';
import { TreeItem, TreeDataProvider, EventEmitter, Event, workspace, window, ExtensionContext, Uri, TextDocument, Position } from "vscode";
import { Project, Workspace } from "../projects/models";
import { ContainerNode } from "../containers/views";
import { ExplorerNode } from "../explorers/views";
import { ProjectNode, ProjectsNode } from "../projects/views";
import { ServiceNode } from "../services/views";
import { DockerExecutor } from "../executors/dockerExecutor";
import { DockerComposeExecutor } from "../executors/dockerComposeExecutor";
import { DockerComposeCommandNotFound } from "../executors/exceptions";
import { MessageNode } from "../compose/views";

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
        }

        private _initRoot(): ExplorerNode {
            let workspace = new Workspace(
                vscode.workspace && vscode.workspace.workspaceFolders,
                this.projectNames,
                this.files,
                this.shell
            );
            return new ProjectsNode(this.context, workspace);
        }

        protected getRefreshCallable(node: ExplorerNode) {
            let that = this;
            async function refresh() {
                await that.refresh(node);
            }
            return refresh;
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

        public async startProject(node: ProjectNode): Promise<ChildProcess> {
            return node.project.start();
        }
    
        public async stopProject(node: ProjectNode): Promise<ChildProcess> {
            return node.project.stop();
        }
    
        public async upProject(node: ProjectNode): Promise<ChildProcess> {
            let child_process = node.project.up();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async downProject(node: ProjectNode): Promise<ChildProcess> {
            let child_process = node.project.down();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async shellService(node: ServiceNode): Promise<void> {
            node.service.shell();
        }
    
        public async upService(node: ServiceNode): Promise<ChildProcess> {
            let child_process = node.service.up();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async downService(node: ServiceNode): Promise<ChildProcess> {
            let child_process = node.service.down();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async buildService(node: ServiceNode): Promise<ChildProcess> {
            let child_process = node.service.build();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async startService(node: ServiceNode): Promise<ChildProcess> {
            let child_process = node.service.start();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async stopService(node: ServiceNode): Promise<ChildProcess> {
            let child_process = node.service.stop();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async restartService(node: ServiceNode): Promise<ChildProcess> {
            let child_process = node.service.restart();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async killService(node: ServiceNode): Promise<ChildProcess> {
            let child_process = node.service.kill();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async attachContainer(node: ContainerNode): Promise<void> {
            node.container.attach();
        }
    
        public async logsContainer(node:ContainerNode): Promise<void> {
            var setting: Uri = Uri.parse("untitled:" + node.container.name + ".logs");
            var content = node.container.logs();
            vscode.workspace.openTextDocument(setting).then((doc: TextDocument) => {
                window.showTextDocument(doc, 1, false).then(editor => {
                    editor.edit(edit => {
                        edit.insert(new Position(0, 0), content);
                    });
                });
            });
        }

        public async startContainer(node: ContainerNode): Promise<ChildProcess> {
            let child_process = node.container.start();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async stopContainer(node: ContainerNode): Promise<ChildProcess> {
            let child_process = node.container.stop();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
        public async killContainer(node: ContainerNode): Promise<ChildProcess> {
            let child_process = node.container.kill();
            child_process.on('close', this.getRefreshCallable(node));
            return child_process;
        }
    
    }
    