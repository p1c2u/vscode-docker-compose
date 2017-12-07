"use strict";
import { TreeItem, TreeDataProvider, EventEmitter, Event, workspace, ExtensionContext } from "vscode";
import { Project } from "../models/project";
import { ContainerNode } from "../views/containerNode";
import { ProjectNode } from "../views/projectNode";
import { ProjectsNode } from "../views/projectsNode";
import { ServiceNode } from "../views/serviceNode";
import { ExplorerNode } from "../views/explorerNode";
import { DockerComposeCommandExecutor } from "../executors/dockerComposeCommandExecutor";

export class DockerComposeExplorer implements TreeDataProvider<ExplorerNode> {
    
        private _root?: ExplorerNode;
        private _loading: Promise<void> | undefined;
    
        private _onDidChangeAutoRefresh = new EventEmitter<void>();
        public get onDidChangeAutoRefresh(): Event<void> {
            return this._onDidChangeAutoRefresh.event;
        }
    
        private _onDidChangeTreeData = new EventEmitter<ExplorerNode>();
        public get onDidChangeTreeData(): Event<ExplorerNode> {
            return this._onDidChangeTreeData.event;
        }
    
        constructor(
            private context: ExtensionContext,
            private files: string[],
            private shell: string,
            private projectNames: string[]
        ) {
            let projects = workspace.workspaceFolders.map((folder) => {
                let name = projectNames[folder.index] || folder.name.replace(/[^\w\s]/gi, '');
                let executor = new DockerComposeCommandExecutor(files, shell, folder.uri.path);
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

        async refresh(root?: ExplorerNode) {
            this._onDidChangeTreeData.fire();
        }

        public upProject(node: ProjectNode): void {
            node.project.up();
        }
    
        public downProject(node: ProjectNode): void {
            node.project.down();
        }
    
        public shellService(node: ServiceNode): void {
            node.service.shell();
        }
    
        public upService(node: ServiceNode): void {
            node.service.up();
        }
    
        public downService(node: ServiceNode): void {
            node.service.down();
        }
    
        public buildService(node: ServiceNode): void {
            node.service.build();
        }
    
        public startService(node: ServiceNode): void {
            node.service.start();
        }
    
        public stopService(node: ServiceNode): void {
            node.service.stop();
        }
    
        public restartService(node: ServiceNode): void {
            node.service.restart();
        }
    
        public killService(node: ServiceNode): void {
            node.service.kill();
        }
    
        public attachContainer(node: ContainerNode): void {
            node.container.attach();
        }
    
        public startContainer(node: ContainerNode): void {
            node.container.start();
        }
    
        public killContainer(node: ContainerNode): void {
            node.container.kill();
        }
    
    }