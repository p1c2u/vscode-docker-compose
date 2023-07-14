'use strict';
import { ChildProcess } from "child_process";
import * as vscode from 'vscode';
import { Container } from "../containers/models";
import { Service } from "../services/models";
import { DockerExecutor } from "../executors/dockerExecutor";
import { ComposeExecutor } from "../executors/composeExecutor";
import { ps } from "docker-compose/dist/v2";

export class Project {

    private _id: number;

    private _files: string[];
    private _shell: string;

    private _services: Service[] | undefined;
    private _containers: Container[] | undefined;
    private dockerExecutor: DockerExecutor;
    private composeExecutor: ComposeExecutor;

    constructor(
        public readonly name: string,
        public readonly cwd: string = null,
        files: string[] = [],
        shell = "/bin/sh"
    ) {
        this._id = Math.random();
        this._files = files;
        this._shell = shell;

        this._services = undefined;
        this._containers = undefined;

        this.dockerExecutor = new DockerExecutor(this._shell, this.cwd);
        this.composeExecutor = new ComposeExecutor(this._files, this._shell, this.cwd);
    }

    async getServices(force = false): Promise<Service[]> {
        if (this._services === undefined || force) {
            await this.refreshServices();
        }
        return this._services;
    }

    async refreshServices(): Promise<void> {
        this._services = await this._getServices();
    }

    async _getServices(): Promise<Service[]> {
        const servicesString = this.composeExecutor.getConnfigServices();
        const linesString = servicesString.split(/[\r\n]+/g).filter(item => item);
        return linesString.map(serviceString =>  {
            return new Service(this, serviceString, this.dockerExecutor, this.composeExecutor);
        });
    }

    async getContainers(force = false): Promise<Container[]> {
        if (this._containers === undefined || force) {
            await this.refreshContainers();
        }
        return this._containers;
    }

    async refreshContainers(): Promise<void> {
        this._containers = await this._getContainers();
    }

    async _getContainers2(): Promise<Container[]> {
        const config = ["docker-compose.yml", "docker-compose.yaml"];
        const result = await ps({cwd: this.cwd, log: true, config: config, commandOptions: ["--all"]});
        return result.data.services.map((service) => {
            const ports = service.ports.map((port) => port.exposed.port.toString());
            return new Container(
                this.dockerExecutor,
                service.name,
                service.command,
                service.state,
                ports
            );
        });
    }

    async _getContainers(): Promise<Container[]> {
        const result = this.composeExecutor.getPs2();
        return result.map((container) => {
            return new Container(
                this.dockerExecutor,
                container.Name,
                container.Command,
                container.Status,
                []
            );
        });
    }

    public filterServiceContainers(serviceName: string, containers: Container[]): Container[] {
        const pattern = this.name + '_' + serviceName + '_';
        return containers.filter((container) => {
            return container.name.includes(pattern);
        });
    }

    public start(): ChildProcess {
        return this.composeExecutor.start();
    }

    public stop(): ChildProcess {
        return this.composeExecutor.stop();
    }

    public up(): ChildProcess {
        return this.composeExecutor.up();
    }

    public down(): ChildProcess {
        return this.composeExecutor.down();
    }

}


export class Workspace {

    private _projects: Project[] | undefined;

    constructor(
        public readonly workspaceFolders: readonly vscode.WorkspaceFolder[],
        public readonly projectNames: string[],
        public readonly files: string[] = [],
        public readonly shell: string = "/bin/sh"
    ) {
        this._projects = undefined;
    }

    public validate() {
        const dockerExecutor = new DockerExecutor(this.shell);
        dockerExecutor.getVersion();
        const composeExecutor = new ComposeExecutor(this.files, this.shell);
        composeExecutor.getVersion();
    }

    public getProjects(force = false): Project[] {
        if (this._projects === undefined || force)
            this.refreshProjects();
        return this._projects;
    }

    public refreshProjects(): void {
        this._projects = this._getProjects();
    }

    private _getProjects(): Project[] {
        return this.workspaceFolders.map((folder) => {
            // project name from mapping or use workspace dir name
            const name = this.projectNames[folder.index] || folder.name.replace(/[^-_a-z0-9]/gi, '');
            return new Project(name, folder.uri.fsPath, this.files, this.shell);
        });
    }

}
