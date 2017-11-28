import { CommandExecutor } from "./commandExecutor";
import { WorkspaceConfigurator } from "../configurators/workspaceConfigurator";

export class DockerComposeCommandExecutor extends CommandExecutor {

    private getBaseCommand(): string {
        const configuration = WorkspaceConfigurator.getConfiguration();
        const files: string[] = configuration.get<string[]>("files");

        return files.reduce((myString, files) => myString + ' -f ' + files, 'docker-compose');
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

    public up(serviceName: string): string {
        let command = this.getBaseCommand();
        let composeCommand = `${command} up -d --no-recreate ${serviceName}`
        return this.execSync(composeCommand);
    }

    public start(serviceName: string): string {
        let command = this.getBaseCommand();
        let composeCommand = `${command} start ${serviceName}`
        return this.execSync(composeCommand);
    }

    public stop(serviceName: string): string {
        let command = this.getBaseCommand();
        let composeCommand = `${command} stop ${serviceName}`
        return this.execSync(composeCommand);
    }

    public restart(serviceName: string): string {
        let command = this.getBaseCommand();
        let composeCommand = `${command} restart ${serviceName}`
        return this.execSync(composeCommand);
    }

    public build(serviceName: string): string {
        let command = this.getBaseCommand();
        let composeCommand = `${command} build --no-cache ${serviceName}`
        return this.execSync(composeCommand);
    }

    public kill(serviceName: string): string {
        let command = this.getBaseCommand();
        let composeCommand = `${command} kill ${serviceName}`
        return this.execSync(composeCommand);
    }

    public down(): string {
        let command = this.getBaseCommand();
        let composeCommand = `${command} down`
        return this.execSync(composeCommand);
    }

}