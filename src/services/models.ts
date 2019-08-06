'use strict';
import { ChildProcess } from "child_process";
import { Container } from "../containers/models";
import { Project } from "../projects/models";
import { DockerComposeExecutor } from "../executors/dockerComposeExecutor";

export class Service {

    constructor(
        public project: Project,
        public readonly name: string,
        private executor: DockerComposeExecutor
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

    public up(): ChildProcess {
        return this.executor.up(this.name);
    }

    public down(): ChildProcess {
        return this.executor.down(this.name);
    }

    public start(): ChildProcess {
        return this.executor.start(this.name);
    }

    public stop(): ChildProcess {
        return this.executor.stop(this.name);
    }

    public restart(): ChildProcess {
        return this.executor.restart(this.name);
    }

    public build(): ChildProcess {
        return this.executor.build(this.name);
    }

    public kill(): ChildProcess {
        return this.executor.kill(this.name);
    }

}
