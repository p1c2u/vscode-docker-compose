"use strict";
import { TreeItem, TreeDataProvider, EventEmitter, Event, workspace, ExtensionContext } from "vscode";
import { AutoRefreshTree } from "../explorers/autoRefreshTree";
import { Project } from "../models/project";
import { ContainerNode } from "../views/containerNode";
import { ProjectNode } from "../views/projectNode";
import { ProjectsNode } from "../views/projectsNode";
import { ServiceNode } from "../views/serviceNode";
import { ExplorerNode } from "../views/explorerNode";
import { DockerComposeCommandExecutor } from "../executors/dockerComposeCommandExecutor";

export class DockerComposeExplorer extends AutoRefreshTree<any> implements TreeDataProvider<ExplorerNode> {
    
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