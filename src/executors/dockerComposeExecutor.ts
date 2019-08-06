import { ChildProcess } from "child_process";
import { CommandExecutor } from "./commandExecutor";
import { ComposeFileNotFound, DockerComposeCommandNotFound, DockerComposeExecutorError } from "./exceptions";
import { WorkspaceConfigurator } from "../configurators/workspaceConfigurator";

export class DockerComposeExecutor extends CommandExecutor {

    private _files: string[];
    private _shell: string;

    constructor(name: string, files: string[], shell: string = "/bin/sh", cwd: string = null) {
        super(cwd, {COMPOSE_PROJECT_NAME: name})
        this._files = files;
        this._shell = shell;
    }

    getBaseCommand(): string {
        return this._files.reduce((myString, files) => myString + ' -f ' + files, 'docker-compose');
    }

    private getShellCommand(): string {
        return this._shell;
    }

    public getConnfigServices(): string {
        let configServicesCommand = `config --services`;
        return this.executeSync(configServicesCommand);
    }

    public getPs(): string {
        let composeCommand = `ps`;
        return this.executeSync(composeCommand);
    }

    public shell(serviceName: string): void {
        let shellCommand = this.getShellCommand();
        let composeCommand = `exec ${serviceName} ${shellCommand}`
        let terminalName = `${serviceName} shell`
        this.runInTerminal(composeCommand, true, terminalName);
    }

    public up(serviceName?: string): ChildProcess {
        let composeCommand = serviceName === undefined ? `up --no-recreate` : `up --no-recreate ${serviceName}`;
        return this.execute(composeCommand);
    }

    public down(serviceName?: string): ChildProcess {
        let composeCommand = serviceName === undefined ? `down` : `down ${serviceName}`;
        return this.execute(composeCommand);
    }

    public start(serviceName?: string): ChildProcess {
        let composeCommand = serviceName === undefined ? `start` : `start ${serviceName}`
        return this.execute(composeCommand);
    }

    public stop(serviceName?: string): ChildProcess {
        let composeCommand = serviceName === undefined ? `stop` : `stop ${serviceName}`
        return this.execute(composeCommand);
    }

    public restart(serviceName: string): ChildProcess {
        let composeCommand = `restart ${serviceName}`
        return this.execute(composeCommand);
    }

    public build(serviceName: string): ChildProcess {
        let composeCommand = `build --no-cache ${serviceName}`
        return this.execute(composeCommand);
    }

    public kill(serviceName: string): ChildProcess {
        let composeCommand = `kill ${serviceName}`
        return this.execute(composeCommand);
    }

    public executeSync(composeCommand: string) {
        try {
            return super.executeSync(composeCommand);
        }
        catch (err) {
            if (err.message.includes("No such file"))
                throw new ComposeFileNotFound(err.message, err.output);
            else if (err.message.includes("'docker-compose' is not recognized"))
                throw new DockerComposeCommandNotFound(err.message, err.output);
            else
                throw new DockerComposeExecutorError(err.message, err.output);
        }
    }

}