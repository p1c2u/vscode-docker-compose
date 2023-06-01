# Docker Compose

Docker Compose Extension for Visual Studio Code

## Features

* Projexts view to manage Compose projects.
* Services view to manage Compose services and containers.
* Multi-folder workspace support.

## Requirements

* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/)

## Usage

* Docker Compose Explorer

![explorer](images/explorer.png)

## Extension Settings

The extension contributes the following settings:

* `docker-compose.autoRefreshInterval`: Interval (in milliseconds) to auto-refresh containers list. Set 0 to disable auto-refresh. (Default is `10000`)
* `docker-compose.projectNames`: Override Docker Compose project name for each workspace root (Default is basename of the workspace directory).
* `docker-compose.showExplorer`: Show Docker Compose explorer view. (Default is `True`)
* `docker-compose.files`: Docker Compose files. You can define array of files. (Default is `["docker-compose.yml"]`).
* `docker-compose.shell`: Specify shell to use inside Docker Container. (Default is `"/bin/sh"`).

## Known Issues

The extension is in experimental stage. Feel free to report bugs.
