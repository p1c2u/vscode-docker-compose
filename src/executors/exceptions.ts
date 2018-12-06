export class DockerComposeExecutorError extends Error {
    constructor(public message: string, protected output: string) {
        super()
    }
}

export class DockerComposeCommandNotFound extends DockerComposeExecutorError {

}

export class ComposeFileNotFound extends DockerComposeExecutorError {

}