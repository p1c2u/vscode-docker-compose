import { ChildProcess } from "child_process";
import { ContainerState } from "../containers/enums";
import { DockerExecutor } from "../executors/dockerExecutor";

export class Container {

    constructor(
        private readonly executor: DockerExecutor,
        public readonly name: string,
        public readonly command: string,
        public readonly status: string,
        public readonly ports: string[]
    ) {
    }

    get state(): ContainerState {
        return this.status.startsWith('Up') ? ContainerState.Up : ContainerState.Exit;
    }

    get healthy(): boolean | null {
        return this.status.includes('(healthy)') ? true : this.status.includes('(unhealthy)') ? false : null;
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
