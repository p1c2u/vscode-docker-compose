export class DockerComposeExecutorError extends Error {
    constructor(protected output: string) {
        super()
    }
}

export class ComposeFileNotFound extends DockerComposeExecutorError {

}