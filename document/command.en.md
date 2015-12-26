Command Reference
=================

Preparation and Settings
------------------------
### bin/build (Build)
Create the service user environment.

```bash
bash ./build
```

### bin/create-config (Service initial setup)
Create the setup files in the `config` folder and perform the initial setup of the services.

```bash
./create-config
```

*   **Caution:** If you execute this command, the services that are currently in use will be discarded and the data that is being used will be deleted.

The service configuration type can be specified as an argument.

```bash
./create-config redmine
```

For details, refer to [How to Start and Use Services](./create-service.en.md).


Starting and Stopping
---------------------
### bin/up-service (Starts services)
Start the services and open the workspaces.

```bash
./up-service
```


### bin/stop-service (Stops services)
Stop the services and close the workspaces.

```bash
./stop-service
```

### bin/restart-service (Restarts services)
Restart the services and reopen the workspaces.

```bash
./restart-service
```

### bin/open-workspace (Opens workspaces)
Open the workspaces.

```bash
./open-workspace
```

### bin/close-workspace (Closes workspaces)
Close the workspaces.

```bash
./close-workspace
```



Backup and Restore
------------------
### bin/backup (Backs up)
Back up the volume data to the backup directory.

```bash
./backup
```

### bin/restore (Restores)
Restore the data that was backed up with `bin/backup`.

```bash
./restore ../backup/20150821-2339/
```

*  Specify the backup destination directory as an argument.
*  **Caution:** If you execute this command, the services that are currently in use will be discarded and the data that is being used will be deleted.


Executing One-off Commands
--------------------------
### bin/oneoff (Executes one-off command)
Execute a command in a container that has been newly created from any image.

For example, if you execute the following command, the node interpretor is started
in the container created from xpfriend/jenkins-slave-nodejs:1.1.1.

```bash
./oneoff xpfriend/jenkins-slave-nodejs:1.1.1 node
```

Example of starting bash in a created container:

```bash
./oneoff xpfriend/jenkins-slave-nodejs:1.1.1 bash
```

Bash can also be started by just specifying part of the image name as shown below.

```bash
./oneoff nodejs bash
```

In this case, start bash using part of an image name that matches an image name specified from the images currently existing on the host.

*   If you use a `oneoff` command, the directory at the time of command execution 
    is mounted as the `/app` directory in the container.
*   The container is not executed in the container that is currently running.
    (if you wish to execute a command in the container that is currently running, use `docker exec` or `psh`.



Utility Commands when Using Containers
--------------------------------------
To use these utility commands, you need to
execute `source ./bin/pocci-utils` beforehand.

Please note that executing any of these commands when not even one container is running will result in an error.

### stats (Checks container status)
The CPU usage and memory usage for all the currently running containers can be checked.

If you wish to monitor the status continuously:
```bash
stats
```

If you wish to check just once:
```bash
stats --no-stream
```


### vls (Displays VOLUME directory list)
The VOLUME directory list of containers can be checked.

If you wish to display all VOLUMEs:
```bash
vls
```

If you wish to display just the VOLUMEs of the specified container.
```bash
vls dns
```
* Search for a container that matches part of a container name and then display the VOLUME of the container that is a hit.

### vcd (Changes directory to VOLUME data directory)
Change the directory to the data directory corresponding to the specified VOLUME of the specified container.

```bash
vcd nginx conf.d
```

* The container name and VOLUME name that are the first hits in the partial match search are used.

### psh (Logs in to container)
Log in to a running container.

When accessing using sh:
```bash
psh dns
```

When accessing using bash:
```bash
psh dns bash
```

Discarding
----------
### bin/destroy-service (Discarding services)
Discard the services and service settings currently in use.

```bash
./destroy-service
```

*   **Caution:** If you execute this command, the services that are currently in use will be discarded and the data that is being used will be deleted.
