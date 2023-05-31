'use strict';
import { ChildProcess } from "child_process";
import { Container } from "../containers/models";
import { Project } from "../projects/models";
import { ComposeExecutor } from "../executors/composeExecutor";

export class Service {

    constructor(
        public project: Project,
        public readonly name: string,
        private executor: ComposeExecutor
    ) {
    }

    async getContainers(): Promise<Container[]> {
        return await this.project.getContainers(false, this.name);
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
