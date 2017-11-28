# Docker Compose

Docker Compose Extension for Visual Studio Code

## Features

* Manage Docker Compose services

## Requirements

* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/)

## Usage

* Manage Docker Compose services in Explorer

![explorer](images/explorer.png)

## Extension Settings

The extension contributes the following settings:

* `docker-compose.autoRefreshInterval`: Interval (in milliseconds) to auto-refresh containers list. Set 0 to disable auto-refresh. (Default is `10000`)
* `docker-compose.projectName`: Compose project name (Default is basename of the workspace directory)
* `docker-compose.showDockerCompose`: Show Docker Compose navigation view. (Default is `True`)
* `docker-compose.files`: Docker Compose files. You can define array of files. (Default is `["docker-compose.yml"]`).

## Known Issues

The extension is in early stage. Feel free to report bugs.

## Release Notes

### 0.1.0

Initial release
