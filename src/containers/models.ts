import { ChildProcess } from "child_process";
import { ContainerHealth, ContainerState } from "../containers/enums";
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
        if (this.status.startsWith('Up'))
            return this.status.includes('(Paused)') ? ContainerState.Paused : ContainerState.Running;
        if (this.status.startsWith('Created'))
            return ContainerState.Created;
        if (this.status.startsWith('Exited'))
            return ContainerState.Exited;
        if (this.status.startsWith('Dead'))
            return ContainerState.Dead;
        if (this.status.startsWith('Restarting'))
            return ContainerState.Restarting;
        if (this.status.startsWith('Removal'))
            return ContainerState.Removing;
        return ContainerState.Unknown;
    }

    get up(): boolean {
        return this.status.startsWith('Up')
    }

    get health(): ContainerHealth | null {
        return this.status.includes('(healthy)') ? ContainerHealth.Healthy : this.status.includes('(unhealthy)') ? ContainerHealth.Unhealthy : null;
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

    public pause(): ChildProcess {
        return this.executor.pause(this.name);
    }

    public unpause(): ChildProcess {
        return this.executor.unpause(this.name);
    }

    public stop(): ChildProcess {
        return this.executor.stop(this.name);
    }

    public kill(): ChildProcess {
        return this.executor.kill(this.name);
    }

}
