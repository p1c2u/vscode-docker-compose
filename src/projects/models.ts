'use strict';
import { ChildProcess } from "child_process";
import * as vscode from 'vscode';
import { Container } from "../containers/models";
import { Service } from "../services/models";
import { DockerExecutor } from "../executors/dockerExecutor";
import { ComposeExecutor } from "../executors/composeExecutor";
import { ps } from "docker-compose/dist/v2";

export class Project {

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
        shell: string = "/bin/sh"
    ) {
        this._files = files;
        this._shell = shell;

        this._services = undefined;
        this._containers = undefined;

        this.dockerExecutor = new DockerExecutor(this._shell, this.cwd);
        this.composeExecutor = new ComposeExecutor(name, this._files, this._shell, this.cwd);
    }

    async getServices(force: boolean = false): Promise<Service[]> {
        if (this._services === undefined || force) {
            await this.refreshServices();
        }
        return this._services;
    }

    async refreshServices(): Promise<void> {
        this._services = await this._getServices();
    }

    async _getServices(): Promise<Service[]> {
        let servicesString = this.composeExecutor.getConnfigServices();
        let linesString = servicesString.split(/[\r\n]+/g).filter((item) => item)
        let project = this;
        let executor = this.composeExecutor;
        return linesString.map(function (serviceString, index, array) {
            return new Service(project, serviceString, executor);
        });
    }

    async getContainers(force: boolean = false, serviceName?: string): Promise<Container[]> {
        if (this._containers === undefined || force) {
            await this.refreshContainers();
        }
        if (serviceName !== undefined) {
            let projectPattern = this.name + '-'
            let servicePattern = projectPattern + serviceName + '-';
            return this._containers.filter((container) => {
                // standard container name
                if (container.name.startsWith(projectPattern)) {
                    return container.name.includes(servicePattern);
                // custom container name
                } else {
                    let name = this.getContainerServiceName(container.name);
                    return name == serviceName;
                }
            });
        }
        return this._containers;
    }

    async refreshContainers(): Promise<void> {
        this._containers = await this._getContainers();
    }

    async _getContainers1(): Promise<Container[]> {
        let resultString = this.composeExecutor.getPs();
        let linesString = resultString.split(/[\r\n]+/g).filter((item) => item);
        // find separator line
        let sepLineIdx = null;
        for (let [idx, lineString] of linesString.entries()) {
            if (lineString.startsWith("---")) {
                sepLineIdx = idx;
                break;
            }
        }
        // process containers lines
        if (sepLineIdx === null)
            return [];
        let containersString = linesString.slice(sepLineIdx+1);
        let executor = this.dockerExecutor;
        return containersString.map(function (containerString, index, array) {
            const items = containerString.split(/\s{2,}/g).filter((item) => item);
            const name = items[0];
            const command = items[1];
            const state = items[2];
            const ports = items.length == 4 ? items[3].split(', ') : [];
            return new Container(executor, name, command, state, ports);
        });
    }

    public getContainerServiceName(name: string) {
        let resultString = this.dockerExecutor.getPs(this.name, name, this.cwd);
        let linesString = resultString.split(/[\r\n]+/g).filter((item) => item);
        return linesString[0];
    }

    async _getContainers(): Promise<Container[]> {
        let config = ["docker-compose.yml", "docker-compose.yaml"]
        let result = await ps({cwd: this.cwd, log: true, config: config, commandOptions: ["--all"]});
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

    public filterServiceContainers(serviceName: string, containers: Container[]): Container[] {
        let pattern = this.name + '_' + serviceName + '_';
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

    constructor(
        public readonly workspaceFolders: readonly vscode.WorkspaceFolder[],
        public readonly projectNames: string[],
        public readonly files: string[] = [],
        public readonly shell: string = "/bin/sh"
    ) {
    }

    public validate() {
        let dockerExecutor = new DockerExecutor(this.shell);
        dockerExecutor.getVersion()
        let composeExecutor = new ComposeExecutor(null, this.files, this.shell);
        composeExecutor.getVersion()
    }

    public getProjects(): Project[] {
        return this.workspaceFolders.map((folder) => {
            // project name from mapping or use workspace dir name
            let name = this.projectNames[folder.index] || folder.name.replace(/[^-_a-z0-9]/gi, '');
            return new Project(name, folder.uri.fsPath, this.files, this.shell);
        });
    }

}
