import { CommandExecutor } from "./commandExecutor";
import { WorkspaceConfigurator } from "../configurators/workspaceConfigurator";

export class DockerCommandExecutor extends CommandExecutor {

    public attach(serviceName: string): void {
        let command = `docker attach ${serviceName}`
        this.runInTerminal(command, true, serviceName);
    }
}