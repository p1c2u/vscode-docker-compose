'use strict';
import { Container } from "../containers/models";
import { Project } from "../projects/models";
import { DockerComposeCommandExecutor } from "../executors/dockerComposeCommandExecutor";

export class Service {

    constructor(
        public project: Project,
        public readonly name: string,
        private executor: DockerComposeCommandExecutor
    ) {
    }

    public getContainers(): Container[] {
        let containers = this.project.getContainers();

        let pattern = this.project.name + '_' + this.name + '_';
        return containers.filter((container) => {
            return container.name.includes(pattern);
        });
    }

    public shell(): void {
        this.executor.shell(this.name);
    }

    public up(): void {
        this.executor.up(this.name);
    }

    public down(): void {
        this.executor.down(this.name);
    }

    public start(): void {
        this.executor.start(this.name);
    }

    public stop(): void {
        this.executor.stop(this.name);
    }

    public restart(): void {
        this.executor.restart(this.name);
    }

    public build(): void {
        this.executor.build(this.name);
    }

    public kill(): void {
        this.executor.kill(this.name);
    }

}
