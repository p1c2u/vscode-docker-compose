import { ChildProcess } from "child_process";
import { CommandExecutor } from "./commandExecutor";
import { ComposeFileNotFound, DockerComposeCommandNotFound, DockerComposeExecutorError } from "./exceptions";
import { WorkspaceConfigurator } from "../configurators/workspaceConfigurator";

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

    public getPs(projectName: string, containerName: string): string {
        let dockerCommand = `ps -a --format '{{.Label "com.docker.compose.service"}}' --filter name=${containerName} --filter label=com.docker.compose.project=${projectName}`
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

}