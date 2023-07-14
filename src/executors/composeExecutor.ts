import { ChildProcess } from "child_process";
import { CommandExecutor } from "./commandExecutor";
import { ComposeFileNotFound, ComposeCommandNotFound, ComposeExecutorError, ComposeUnhandledError } from "./exceptions";

export interface IComposePsOptions {

}

export interface IComposePsResultPublisher {
    Protocol: string;
    PublishedPort: number;
    TargetPort: number;
    URL: string;
}

export interface IComposePsResult {
    Command: string;
    Created: number;
    ExitCode: number;
    Health: string;
    ID: string;
    Image: string;
    Name: string;
    Project: string;
    Service: string;
    State: string;
    Status: string;
    Publishers: IComposePsResultPublisher[];
}

export class ComposeExecutor extends CommandExecutor {

    private _files: string[];
    private _shell: string;

    constructor(files: string[] = [], shell: string = "/bin/sh", cwd: string = null) {
        super(cwd, process.env)
        this._files = files;
        this._shell = shell;
    }

    getBaseCommand(): string {
        return this._files.reduce((myString, files) => myString + ' -f ' + files, 'docker compose');
    }

    private getShellCommand(): string {
        return this._shell;
    }

    public getVersion(): string {
        let composeCommand = `version`;
        return this.executeSync(composeCommand);
    }

    public getConnfigServices(): string {
        let configServicesCommand = `config --services`;
        return this.executeSync(configServicesCommand);
    }

    public getPs(): string {
        let composeCommand = `ps`;
        return this.executeSync(composeCommand);
    }

    public getPs2(options?: IComposePsOptions): IComposePsResult[] {
        let dockerCommand = `ps -a --format json`
        let result = this.executeSync(dockerCommand);
        return JSON.parse(result)
    }

    public shell(serviceName: string): void {
        let shellCommand = this.getShellCommand();
        let composeCommand = `exec ${serviceName} ${shellCommand}`
        let terminalName = `${serviceName} shell`
        this.runInTerminal(composeCommand, true, terminalName);
    }

    public create(serviceName?: string): ChildProcess {
        let composeCommand = serviceName === undefined ? `create` : `create ${serviceName}`;
        return this.execute(composeCommand);
    }

    public up(serviceName?: string): ChildProcess {
        let composeCommand = serviceName === undefined ? `up --no-recreate` : `up --no-recreate ${serviceName}`;
        return this.execute(composeCommand);
    }

    public down(serviceName?: string): ChildProcess {
        let composeCommand = serviceName === undefined ? `down` : `rm --force --stop ${serviceName}`;
        return this.execute(composeCommand);
    }

    public rm(serviceName?: string): ChildProcess {
        let composeCommand = serviceName === undefined ? `rm --force` : `rm --force ${serviceName}`;
        return this.execute(composeCommand);
    }

    public start(serviceName?: string): ChildProcess {
        let composeCommand = serviceName === undefined ? `start` : `start ${serviceName}`
        return this.execute(composeCommand);
    }

    public pause(serviceName?: string): ChildProcess {
        let composeCommand = serviceName === undefined ? `pause` : `pause ${serviceName}`
        return this.execute(composeCommand);
    }

    public unpause(serviceName?: string): ChildProcess {
        let composeCommand = serviceName === undefined ? `unpause` : `unpause ${serviceName}`
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
            // 1 - Catchall for general errors
            if (err.status === 1)
                throw new ComposeExecutorError(err.message, err.output);
            // 14 - docker compose configuration file not found
            else if (err.status === 14)
                throw new ComposeFileNotFound(err.message, err.output);
            // 127 - docker compose command not found
            else if (err.status === 127)
                throw new ComposeCommandNotFound(err.message, err.output);
            else
                throw new ComposeUnhandledError(err.message, err.output);
        }
    }

}