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

    public start(): void {
        let command = `docker start ${this.name}`
        this.executor.exec(command);
    }

    public kill(): void {
        let command = `docker kill ${this.name}`
        this.executor.exec(command);
    }

}
