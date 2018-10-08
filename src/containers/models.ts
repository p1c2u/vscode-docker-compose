import { ChildProcess } from "child_process";
import { ContainerState } from "../containers/enums";
import { DockerComposeCommandExecutor } from "../executors/dockerComposeCommandExecutor";

export class Container {

    constructor(
        public readonly name: string,
        public readonly command: string,
        public readonly state: ContainerState,
        public readonly ports: string[],
        private readonly executor: DockerComposeCommandExecutor
    ) {
    }

    public attach(): void {
        let command = `docker attach ${this.name}`
        this.executor.runInTerminal(command, true, this.name);
    }

    public logs(): string {
        let command = `docker logs ${this.name}`
        return this.executor.execSync(command);
    }

    public start(): ChildProcess {
        let command = `docker start ${this.name}`
        return this.executor.exec(command);
    }

    public stop(): ChildProcess {
        let command = `docker stop ${this.name}`
        return this.executor.exec(command);
    }

    public kill(): ChildProcess {
        let command = `docker kill ${this.name}`
        return this.executor.exec(command);
    }

}
