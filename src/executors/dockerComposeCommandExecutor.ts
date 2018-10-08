import { ChildProcess } from "child_process";
import { CommandExecutor } from "./commandExecutor";
import { ComposeFileNotFound, DockerComposeExecutorError } from "./exceptions";
import { WorkspaceConfigurator } from "../configurators/workspaceConfigurator";

export class DockerComposeCommandExecutor extends CommandExecutor {

    private _files: string[];
    private _shell: string;

    constructor(name: string, files: string[], shell: string = "/bin/sh", cwd: string = null) {
        super(cwd, {COMPOSE_PROJECT_NAME: name})
        this._files = files;
        this._shell = shell;
    }

    private getBaseCommand(): string {
        return this._files.reduce((myString, files) => myString + ' -f ' + files, 'docker-compose');
    }

    private getShellCommand(): string {
        return this._shell;
    }

    public getConnfigServices(): string {
        let command = this.getBaseCommand();
        let configServicesCommand = `${command} config --services`;
        return this.execSync(configServicesCommand);
    }

    public getPs(): string {
        let command = this.getBaseCommand();
        let composeCommand = `${command} ps`;
        return this.execSync(composeCommand);
    }

    public shell(serviceName: string): void {
        let command = this.getBaseCommand();
        let shellCommand = this.getShellCommand();
        let composeCommand = `${command} exec ${serviceName} ${shellCommand}`
        let terminalName = `${serviceName} shell`
        this.runInTerminal(composeCommand, true, terminalName);
    }

    public up(serviceName?: string): ChildProcess {
        let command = this.getBaseCommand();
        let composeCommand = serviceName === undefined ? `${command} up --no-recreate` : `${command} up --no-recreate ${serviceName}`;
        return this.exec(composeCommand);
    }

    public down(serviceName?: string): ChildProcess {
        let command = this.getBaseCommand();
        let composeCommand = serviceName === undefined ? `${command} down` : `${command} down ${serviceName}`;
        return this.exec(composeCommand);
    }

    public start(serviceName?: string): ChildProcess {
        let command = this.getBaseCommand();
        let composeCommand = serviceName === undefined ? `${command} start` : `${command} start ${serviceName}`
        return this.exec(composeCommand);
    }

    public stop(serviceName?: string): ChildProcess {
        let command = this.getBaseCommand();
        let composeCommand = serviceName === undefined ? `${command} stop` : `${command} stop ${serviceName}`
        return this.exec(composeCommand);
    }

    public restart(serviceName: string): ChildProcess {
        let command = this.getBaseCommand();
        let composeCommand = `${command} restart ${serviceName}`
        return this.exec(composeCommand);
    }

    public build(serviceName: string): ChildProcess {
        let command = this.getBaseCommand();
        let composeCommand = `${command} build --no-cache ${serviceName}`
        return this.exec(composeCommand);
    }

    public kill(serviceName: string): ChildProcess {
        let command = this.getBaseCommand();
        let composeCommand = `${command} kill ${serviceName}`
        return this.exec(composeCommand);
    }

    public execSync(command: string) {
        try {
            return super.execSync(command);
        }
        catch (err) {
            if (err.message.includes("No such file"))
                throw new ComposeFileNotFound(err.output);
            else
                throw new DockerComposeExecutorError(err.output);
        }
    }

}