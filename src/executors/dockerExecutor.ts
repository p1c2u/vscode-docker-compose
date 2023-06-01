import { ChildProcess } from "child_process";
import { CommandExecutor } from "./commandExecutor";
import { DockerExecutorError, DockerUnhandledError } from "./exceptions";

export interface IDockerPsOptions {
    projectName?: string;
    projectDir?: string;
    containerName?: string;
}

export class DockerExecutor extends CommandExecutor {

    private _shell: string;

    constructor(shell: string = "/bin/sh", cwd: string = null) {
        super(cwd)
        this._shell = shell;
    }

    getBaseCommand(): string {
        return 'docker';
    }

    private getShellCommand(): string {
        return this._shell;
    }

    public getVersion(): string {
        let dockerCommand = `version`;
        return this.executeSync(dockerCommand);
    }

    public getPs(options?: IDockerPsOptions): string {
        let dockerCommand = `ps -a --format '{{.Label "com.docker.compose.service"}}'`
        if (options !== undefined) {
            if (options.projectName !== undefined)
                dockerCommand += ` --filter label=com.docker.compose.project=${options.projectName}`
            if (options.projectDir !== undefined)
                dockerCommand += ` --filter label=com.docker.compose.project.working_dir=${options.projectDir}`
            if (options.containerName !== undefined)
                dockerCommand += ` --filter name=${options.containerName}`
        }
        return this.executeSync(dockerCommand);
    }

    public attach(name: string): void {
        let dockerCommand = `attach ${name}`
        this.runInTerminal(dockerCommand, true, name);
    }

    public logs(name: string): string {
        let dockerCommand = `logs ${name}`
        return this.executeSync(dockerCommand);
    }

    public start(name: string): ChildProcess {
        let dockerCommand = `start ${name}`
        return this.execute(dockerCommand);
    }

    public stop(name: string): ChildProcess {
        let dockerCommand = `stop ${name}`
        return this.execute(dockerCommand);
    }

    public kill(name: string): ChildProcess {
        let dockerCommand = `kill ${name}`
        return this.execute(dockerCommand);
    }

    public executeSync(dockerCommand: string) {
        try {
            return super.executeSync(dockerCommand);
        }
        catch (err) {
            // 1 - Catchall for general errors
            if (err.status === 1)
                throw new DockerExecutorError(err.message, err.output);
            else
                throw new DockerUnhandledError(err.message, err.output);
        }
    }
}