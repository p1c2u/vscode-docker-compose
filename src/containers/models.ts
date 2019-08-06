import { ChildProcess } from "child_process";
import { ContainerState } from "../containers/enums";
import { DockerExecutor } from "../executors/dockerExecutor";

export class Container {

    constructor(
        private readonly executor: DockerExecutor,
        public readonly name: string,
        public readonly command: string,
        public readonly state: ContainerState,
        public readonly ports: string[],
        public readonly healthy: boolean = false
    ) {
    }

    public attach(): void {
        this.executor.attach(this.name);
    }

    public logs(): string {
        return this.executor.logs(this.name);
    }

    public start(): ChildProcess {
        return this.executor.start(this.name);
    }

    public stop(): ChildProcess {
        return this.executor.stop(this.name);
    }

    public kill(): ChildProcess {
        return this.executor.kill(this.name);
    }

}
