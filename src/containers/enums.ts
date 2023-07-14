export enum ContainerState {
    Created = "Created",
    Running = "Running",
    Paused = "Paused",
    Restarting = "Restarting",
    Removing = "Removing",
    Exited = "Exited",
    Dead = "Dead",
    Unknown = "Unknown",
}

export enum ContainerHealth {
    Starting = "Starting",
    Healthy = "Healthy",
    Unhealthy = "Unhealthy",
}
