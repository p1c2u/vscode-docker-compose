'use strict';
import { WorkspaceFolder } from "vscode";
import { Container, ContainerState } from "../models/container";
import { Service } from "../models/service";
import { DockerComposeCommandExecutor } from "../executors/dockerComposeCommandExecutor";

export class Project {

    constructor(
        public readonly name: string,
        private readonly executor: DockerComposeCommandExecutor
    ) {
    }

    public getServices(): Service[] {
        let servicesString = this.executor.getConnfigServices();
        let linesString = servicesString.split(/[\r\n]+/g).filter((item) => item)
        let project = this;
        let executor = this.executor;
        return linesString.map(function (serviceString, index, array) {
            return new Service(project, serviceString, executor);
        });
    }

    public getContainers(): Container[] {
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

    public up(): void {
        this.executor.up();
    }

    public down(): void {
        this.executor.down();
    }

}