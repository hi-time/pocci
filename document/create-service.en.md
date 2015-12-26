How to Start and Use Services
=============================

Initial Setup of Services
-------------------------
The initial setup of each service needs to be performed before the services are started.

Executing the `bin/create-config` command creates
the following setup files in the config directory
and performs the initial setup of the services.

Contents of the config directory:
```
pocci/
  - config/
    - nginx/:                Nginx settings
    - .env:                  Environment variable definitions
    - althosts:              Host names (IP addresses) definitions (host file format)
    - backend-services.yml:  Container definitions for backend services (Docker Compose format)
    - core-services.yml:     Continer definitions for various services (Docker Compose format)
    - workspaces.yml:        Container definitions for workspaces (Docker Compose format)
```

The initial setup of the services can be executed in any of the following three ways

1. Executing with the Default Configuration
2. Specifying the Service Configuration Type and Then Executing
3. Customizing the Service Configuration and Then Executing



### 1. Executing with the Default Configuration
#### How to create
Executing the `create-config` script in the `bin` directory
performs the initial setup with the default configuration.

```bash
cd bin
./create-config
```

*   The service configuration can be returned to the initial state as many times as you wish by executing the `create-config` again.  
    This is the easiest method when you wish to try out the services right away.
*   It takes a little while to create the setup files.  
    In particular, images need to be downloaded the first time, so it may take
    10 minutes or longer depending on the network environment.
*   The execution results (log) can be checked in the terminal screen, `pocci/config.log` or *Setup Log** in the Web screen.


### 2. Specifying the Service Configuration Type and Then Executing

#### Specifying the service configuration type
Initial setup with a specified configuration type can 
be performed by adding an argument to
`create-config` like `create-config [Service Configuration Type]`.

The following service configuration types are provided in advance.

Service configuration type | Services with which can be used                           | Features
---------------------------| --------------------------------------------------------- | -------------------------------------------------
default                    | GitLab, Jenkins, SonarQube, Kanban board, User management | Manages tickets (Issues) with GitLab. Tickets can be handled as kanbans on a task board.
redmine                    | GitLab, Jenkins, SonarQube, Redmine, User management      | Manages ticket (Issues) with Redmine.


#### Execution example
If, for example, you wish to use Redmine, execute as follows.

```bash
./create-config redmine
```

If `create-config` is executed without specifying an argument, setup files with the `default` configuration will be created.



### 3. Customizing the Service Configuration and Then Executing

#### Editing the setup files

The service configuration can be customized or a unique configuration can be defined
by creating setup files (`setup.*.yml`) and then editing them.

Setup files (`setup.*.yml`) exist in
the `template` directory.

```
template/
  setup.default.yml
  setup.redmine.yml
```

Editing these files in a text editor allows you to
customize the service configuration type.

You can also create a new file such as `setup.myservices.yml`.
In this case, if you specify the `./create-config myservices` argument,
`create-config` will read `setup.myservices.yml` and then be executed.

For details on the description information of the setup files,
refer to [Setup File Reference](./setup-yml.en.md). 



Starting the Services
---------------------
### How to start the services
The services can be started by executing the `bin/up-service` command.

```bash
cd bin
./up-service
```

### How to access started services
For details on how to access started CI services,
refer to [How to Connect to Services](./access.en.md).


How to change the administrator password
----------------------------------------
For details on how to change the password of administrators,
refer to [How to Change the Administrator Password](./change-admin-password.en.md).


About Other Commands
--------------------
For details on the command for stopping services and other commands,
refer to [Command Reference](./command.en.md).

