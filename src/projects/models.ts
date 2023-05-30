'use strict';
import { ChildProcess } from "child_process";
import * as vscode from 'vscode';
import { ContainerState } from "../containers/enums";
import { Container } from "../containers/models";
import { Service } from "../services/models";
import { DockerExecutor } from "../executors/dockerExecutor";
import { DockerComposeExecutor } from "../executors/dockerComposeExecutor";

export class Project {

    private _services: Service[] | undefined;
    private _containers: Container[] | undefined;

    constructor(
        public readonly name: string,
        private readonly dockerExecutor: DockerExecutor,
        private readonly dockerComposeExecutor: DockerComposeExecutor,
    ) {
        this._services = undefined;
        this._containers = undefined;
    }

    public getServices(force: boolean = false): Service[] {
        if (this._services === undefined || force) {
            this.refreshServices();
        }
        return this._services;
    }

    public refreshServices(): void {
        this._services = this._getServices();
    }

    private _getServices(): Service[] {
        let servicesString = this.dockerComposeExecutor.getConnfigServices();
        let linesString = servicesString.split(/[\r\n]+/g).filter((item) => item)
        let project = this;
        let executor = this.dockerComposeExecutor;
        return linesString.map(function (serviceString, index, array) {
            return new Service(project, serviceString, executor);
        });
    }

    public getContainers(force: boolean = false): Container[] {
        if (this._containers === undefined || force) {
            this.refreshContainers();
        }
        return this._containers;
    }

    public refreshContainers(): void {
        this._containers = this._getContainers();
    }

    private _getContainers(): Container[] {
        let resultString = this.dockerComposeExecutor.getPs();
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
            const state = items[2].startsWith('Up') ? ContainerState.Up : ContainerState.Exit;
            const healthy = items[2].includes('(healthy)') ? true : items[2].includes('(unhealthy)') ? false : null;
            const ports = items.length == 4 ? items[3].split(', ') : [];
            return new Container(executor, name, command, state, ports, healthy);
        });
    }

    public getContainerServiceName(name: string) {
        let resultString = this.dockerExecutor.getPs(this.name, name);
        let linesString = resultString.split(/[\r\n]+/g).filter((item) => item);
        return linesString[0];
    }

    public getServiceContainers(serviceName: string): Container[] {
        const containers = this.getContainers();

        let projectPattern = this.name + '_'
        let servicePattern = projectPattern + serviceName + '_';
        return containers.filter((container) => {
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

    public filterServiceContainers(serviceName: string, containers: Container[]): Container[] {
        let pattern = this.name + '_' + serviceName + '_';
        return containers.filter((container) => {
            return container.name.includes(pattern);
        });
    }

    public start(): ChildProcess {
        return this.dockerComposeExecutor.start();
    }

    public stop(): ChildProcess {
        return this.dockerComposeExecutor.stop();
    }

    public up(): ChildProcess {
        return this.dockerComposeExecutor.up();
    }

    public down(): ChildProcess {
        return this.dockerComposeExecutor.down();
    }

}


export class Workspace {

    private _services: Service[] | undefined;
    private _containers: Container[] | undefined;

    constructor(
        public readonly workspaceFolders: readonly vscode.WorkspaceFolder[],
        public readonly projectNames: string[],
        public readonly files: string[] = [],
        public readonly shell: string = "/bin/sh"
    ) {
        this._services = undefined;
        this._containers = undefined;
    }

    public validate() {
        let dockerComposeExecutor = new DockerComposeExecutor(null, this.files, this.shell);
        dockerComposeExecutor.getVersion()
    }

    public getProjects(): Project[] {
        return this.workspaceFolders.map((folder) => {
            // project name from mapping or use workspace dir name
            let name = this.projectNames[folder.index] || folder.name.replace(/[^-_a-z0-9]/gi, '');
            let projectDockerExecutor = new DockerExecutor(this.shell, folder.uri.fsPath);
            let projectDockerComposeExecutor = new DockerComposeExecutor(name, this.files, this.shell, folder.uri.fsPath);
            return new Project(name, projectDockerExecutor, projectDockerComposeExecutor);
        });
    }

}
