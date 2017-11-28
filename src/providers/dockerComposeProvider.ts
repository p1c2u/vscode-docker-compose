import * as path from "path";
import * as vscode from "vscode";
import { WorkspaceConfigurator } from "../configurators/workspaceConfigurator";
import { DockerComposeCommandExecutor } from "../executors/dockerComposeCommandExecutor";
import { DockerComposeContainer } from "../models/dockerComposeContainer";
import { DockerComposeService } from "../models/dockerComposeService";

export class DockerComposeProvider {

    private _commandExecutor: DockerComposeCommandExecutor;
    private _projectName: string;

    constructor(executor: DockerComposeCommandExecutor) {
        this._commandExecutor = executor;

        const configuration = WorkspaceConfigurator.getConfiguration();
        const projectNameUnsafe: string = configuration.get<string>("projectName") || path.basename(vscode.workspace.rootPath);
        this._projectName = projectNameUnsafe.replace(/[^\w\s]/gi, '');
    }

    public getServices(): DockerComposeService[] {
        let servicesString = this._commandExecutor.getConnfigServices();
        let linesString = servicesString.split(/[\r\n]+/g).filter((item) => item)
        return linesString.map(function (serviceString, index, array) {
            return new DockerComposeService(serviceString);
        });
    }

    public getContainers(): DockerComposeContainer[] {
        let resultString = this._commandExecutor.getPs();
        let linesString = resultString.split(/[\r\n]+/g).filter((item) => item);
        let containersString  = linesString.slice(2);
        return containersString.map(function (containerString, index, array) {
            const items = containerString.split(/\s{2,}/g).filter((item) => item);
            const name = items[0];
            const command = items[1];
            const state = items[2];
            const ports = items.length == 4 ? items[3].split(', ') : [];
            return new DockerComposeContainer(name, command, state, ports); 
        });
    }

    public getContainer(serviceName: string): DockerComposeContainer {
        let pattern = this._projectName + '_' + serviceName + '_';
        let containers = this.getContainers();
        let result = containers.filter((container) => {
            return container.name.includes(pattern);
        })
        return result[0];
    }

    public upService(serviceName: string): void {
        this._commandExecutor.up(serviceName);
    }

    public startService(serviceName: string): void {
        this._commandExecutor.start(serviceName);
    }

    public stopService(serviceName: string): void {
        this._commandExecutor.stop(serviceName);
    }

    public restartService(serviceName: string): void {
        this._commandExecutor.restart(serviceName);
    }

    public buildService(serviceName: string): void {
        this._commandExecutor.build(serviceName);
    }

    public killService(serviceName: string): void {
        this._commandExecutor.kill(serviceName);
    }

    public downContainers(): void {
        this._commandExecutor.down();
    }

}