'use strict';
import { WorkspaceFolder } from "vscode";
import { ContainerState } from "../containers/enums";
import { Container } from "../containers/models";
import { Service } from "../services/models";
import { DockerComposeCommandExecutor } from "../executors/dockerComposeCommandExecutor";

export class Project {

    private _services: Service[] | undefined;
    private _containers: Container[] | undefined;

    constructor(
        public readonly name: string,
        private readonly executor: DockerComposeCommandExecutor
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
        let servicesString = this.executor.getConnfigServices();
        let linesString = servicesString.split(/[\r\n]+/g).filter((item) => item)
        let project = this;
        let executor = this.executor;
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
        let resultString = this.executor.getPs();
        let linesString = resultString.split(/[\r\n]+/g).filter((item) => item);
        let containersString  = linesString.slice(2);
        let executor = this.executor;
        return containersString.map(function (containerString, index, array) {
            const items = containerString.split(/\s{2,}/g).filter((item) => item);
            const name = items[0];
            const command = items[1];
            const state = items[2].startsWith('Up') ? ContainerState.Up : ContainerState.Exit;
            const ports = items.length == 4 ? items[3].split(', ') : [];
            return new Container(name, command, state, ports, executor); 
        });
    }

    public filterServiceContainers(serviceName: string, containers: Container[]): Container[] {
        let pattern = this.name + '_' + serviceName + '_';
        return containers.filter((container) => {
            return container.name.includes(pattern);
        });
    }

    public up(): void {
        this.executor.up();
    }

    public down(): void {
        this.executor.down();
    }

}
