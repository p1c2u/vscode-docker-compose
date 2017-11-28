export enum ContainerState {
    Up = "Up",
    Exit = "Exit",
}


export class DockerComposeContainer {
    constructor(
        public readonly name: string,
        public readonly command: string,
        public readonly state: string,
        public readonly ports: string[]
    ) {
    }
}