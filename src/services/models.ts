'use strict';
import { ChildProcess } from "child_process";
import { Container } from "../containers/models";
import { Project } from "../projects/models";
import { ComposeExecutor } from "../executors/composeExecutor";
import { DockerExecutor } from "../executors/dockerExecutor";

export class Service {

    private _containers: Container[] | undefined;

    constructor(
        public project: Project,
        public readonly name: string,
        private dockerExecutor: DockerExecutor,
        private composeExecutor: ComposeExecutor
    ) {
        this._containers = undefined;
    }

    async getContainers(force: boolean = false): Promise<Container[]> {
        if (this._containers === undefined || force) {
            await this.refreshContainers();
        }
        return this._containers;
    }

    async _getContainers(force: boolean = false): Promise<Container[]> {
        let containers = await this.project.getContainers(force);
        let projectPattern = this.project.name + '-'
        let servicePattern = projectPattern + this.name + '-';
        return containers.filter((container) => {
            // standard container name
            if (container.name.startsWith(projectPattern)) {
                return container.name.includes(servicePattern);
            // custom container name
            } else {
                let name = this.getContainerServiceName(container.name);
                return name == this.name;
            }
        });
    }

    public getContainerServiceName(name: string) {
        let options = {projectName: this.project.name, containerName: name, ProjectDir: this.project.cwd};
        let resultString = this.dockerExecutor.getPs(options);
        let linesString = resultString.split(/[\r\n]+/g).filter((item) => item);
        return linesString[0];
    }

    async refreshContainers(): Promise<void> {
        this._containers = await this._getContainers(true);
    }

    public shell(): void {
        this.composeExecutor.shell(this.name);
    }

    public up(): ChildProcess {
        return this.composeExecutor.up(this.name);
    }

    public down(): ChildProcess {
        return this.composeExecutor.down(this.name);
    }

    public start(): ChildProcess {
        return this.composeExecutor.start(this.name);
    }

    public stop(): ChildProcess {
        return this.composeExecutor.stop(this.name);
    }

    public restart(): ChildProcess {
        return this.composeExecutor.restart(this.name);
    }

    public build(): ChildProcess {
        return this.composeExecutor.build(this.name);
    }

    public kill(): ChildProcess {
        return this.composeExecutor.kill(this.name);
    }

}
