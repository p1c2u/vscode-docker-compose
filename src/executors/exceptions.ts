export class ExecutorError extends Error {
    constructor(public message: string, protected output: string) {
        super()
    }
}

export class DockerExecutorError extends ExecutorError {

}

export class DockerUnhandledError extends DockerExecutorError {

}

export class ComposeExecutorError extends ExecutorError {

}

export class ComposeCommandNotFound extends ComposeExecutorError {

}

export class ComposeFileNotFound extends ComposeExecutorError {

}

export class ComposeUnhandledError extends ComposeExecutorError {

}
