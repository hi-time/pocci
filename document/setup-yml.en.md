Setup File Reference
====================
Setup files are definition files used
when the `bin/create-config` command configures the initial settings of each service.


Example of a setup file

```yaml
pocci:
  services:
    - gitlab
    - user
    - jenkins
    - sonar
    - redmine

user:
  users:
    - uid:           jenkinsci
      givenName:     Jenkins
      sn:            CI
      mail:          jenkins-ci@example.com
      userPassword:  password
    - uid:           boze
      givenName:     Taro
      sn:            BOZE
      mail:          boze@example.com
      userPassword:  password

jenkins:
  nodes:
    - java
    - nodejs

gitlab:
  groups:
    - groupName:  example
      projects:
        - projectName:     example-java
          commitMessage:   "refs #1 (import example codes)"
        - projectName:     example-nodejs
          commitMessage:   "refs #1 (import example codes)"

redmine:
  projects:
    - projectId:  example
      issues:
        - import example codes
```


Roles of setup files
--------------------
The `bin/create-config` command carries out the following processes.

* Creates the setup files in the config directory.
* Operates a service instance and configures the initial settings.

Setup files describe how to carry out these processes.

### Creating the setup files in the config directory
Each file in the config directory is created by
reflecting the setting information described in the
setup file in the corresponding template file located in the `template/services` directory.

Contents of the config directory:
```
pocci/
  - config/
    - nginx/:                Nginx settings
    - .env:                  Environment variable definitions
    - althosts:              Host names (IP addresses) definitions (host file format)
    - backend-services.yml:  Container definitions for backend services (Docker Compose format)
    - core-services.yml:     Container definitions for various services (Docker Compose format)
    - workspaces.yml:        Container definitions for workspaces (Docker Compose format)
```

The file that plays the central role of the files in the config directory is `.env` (environment variable definitions).
Each service (container) operates according to the environment variable described in `.env`.
`.env` is created based on the information in the setup files.

### Initial settings of service instance
The initial settings of the service instance are configured based
on the information described in the setup files.

Service instance setting example:
*   **user:** Registration of service user acccount
*   **gitlab:** Group, project (repository), and ticket (Issue)
*   **jenkins:** Build job, slave node



pocci:
------
Define information related to overall service configuration.

Definition example

```yaml
pocci:
  domain:  pocci.example.com
  services:
    - gitlab
    - user
    - jenkins
    - sonar
    - redmine
  hosts:
    - 192.168.0.11 test-01.pocci.example.com it-server
    - 192.168.0.12 test-02.pocci.example.com uat-server
  https: true
  certificate:
    subject: "/C=JP/ST=Tokyo/L=Chiyodaku/O=Pocci/CN=*.pocci.example.com/"
  adminMailAddress: admin@example.com
```

*   **domain:** Domain name of service  
    For example, if you set `domain : pocci.example.com`,
    the service can be used with the `http://gitlab.pocci.example.com` or
    `http://jenkins.pocci.example.com`URL.  
    *   The default is `pocci.test`.
    *   Environment variables:  `POCCI_DOMAIN_NAME`
*   **services:** Services to be used  
    Select the services you wish to use from 
    gitlab, jenkins, sonar, user, redmine, and slave.
    *   Notes regarding combinations:
        *   If redmine is specified, gitlab must be specified for services.
            (It is not possible to link with gitlab running on another machine.)
        *   If slave is specified, the URL of a connectible jenkins
            must be set in the JENKINS_URL environment variable.
        *   If an external LDAP server will be used, user cannot be specified.
    *   When a connection is established using the IP address (e.g., `http://192.168.0.2),
        the connection will be to the service specified at the beginning here.
    *   Environment variables:  `INTERNAL_SERVICES`
*   **hosts:** Name of the server referenced by each service  
    *   Define this for each IP address in the format of `IP address Server name Alias1 Alias2 ...` 
    *   The information defined here is reflected in `config/althosts`.
*   **https:** Whether or not to enable HTTPS connection
    *   The default is `false`
    *   Environment variable: `POCCI_HTTPS`
*   **certificate.subject:** Subject of the server certificate
    *   The default is `/C=JP/ST=Chiba/L=Chiba/O=Pocci/CN=*.[Domain name specified in pocci.domain]/`
    *   Environment variable: `CERTIFICATE_SUBJECT`
*   **adminMailAddress:** Mail address of the administrator.
    *   The default is `pocci@localhost.localdomain`.
    *   Environment variable: `ADMIN_MAIL_ADDRESS`
*   **environment:** Environment variable to be set for the service container.  
    Any value can be defined.
*   **logdir:** Log output destination directory  
    Specify an absolute path for the log output destination directory.
    *   The default is `log` under the pocci directory.
    *   Environment variable:  `POCCI_LOG_DIR`

user:
-----
Define the minimum number of users (administrators) required to start service operation.

Definition example:

```yaml
user:
  users:
    - uid:           boze
      givenName:     Taro
      sn:            BOZE
      mail:          boze@example.com
      userPassword:  password
```

*   **users:** First user registered
    *   When using the user administration function incorporated in pocci (Open LDAP),
        specify `uid` (user ID), `userPassword` (password), `givenName` (given name), `sn` (surname), 
        and `mail` (mail address) as shown in the definition example above.
        Use these values to perform user registration.
    *   `uid` and `mail` must be unique.
        And values of `mail` and a value of `pocci.adminMailAddress` must be different.
*   **url:** URL for accessing the user administration screen
    *   The default is `http://user.[Domain name specified in pocci.domain]`
    *   Environment variables: `USER_URL`, `USER_PROTOCOL`, `USER_HOST`, `USER_PORT`


ldap:
-----
LDAP server related definitions.

These definitions are required when using an external LDAP server instead
of the LDAP server (user service) incorporated in pocci.

Definition example:

```yaml
ldap:
  url:             'ldap://user.pocci.test'
  domain:          example.com
  baseDn:          dc=example,dc=com
  bindDn:          cn=admin,dc=example,dc=com
  bindPassword:    admin
  organisation:    Example Inc.
  attrLogin:       uid
  attrFirstName:   givenName
  attrLastName:    sn
  attrMail:        mail
```

*   **url:** URL for accessing the LDAP server
    *   The default is `ldap://user.[Domain name specified in pocci.domain]`
    *   Environment variables:  `LDAP_URL`, `LDAP_PROTOCOL`, `LDAP_HOST`, `LDAP_PORT`
*   **domain:** LDAP domain
    *   Environment variable:  `LDAP_DOMAIN`
*   **baseDn:** Base DN
    *   Environment variable:  `LDAP_BASE_DN`
*   **bindDn:** Bind DN
    *   Environment variable:  `LDAP_BIND_DN`
*   **bindPassword:** Password when binding
    *   Environment variable:  `LDAP_BIND_PASSWORD`
*   **organisation:** Organization
    *   Environment variable:  `LDAP_ORGANISATION`
*   **attrLogin:** User attributes used as the login account of various services
    *   Environment variable:  `LDAP_ATTR_LOGIN`
*   **attrFirstName:** Attribute representing the given name of the user
    *   Environment variable:  `LDAP_ATTR_FIRST_NAME`
*   **attrLastName:** Attribute representing the last name of the user
    *   Environment variable:  `LDAP_ATTR_LAST_NAME`
*   **attrMail:** Attribute representing the mail address of the user
    *   Environment variable:  `LDAP_ATTR_MAIL`


Describe the following when using an external LDAP server.

```yaml
pocci:
  services:
    - gitlab
    - jenkins
    - sonar
    - redmine

ldap:
  url:  'ldap://ldap.example.com'
```

*   Do not add `user` to `pocci.services`.
*   Describe the URL of the external LDAP server in `ldap.url`.


gitlab:
-------
GitLab related definitions.

Definition example:

```yaml
gitlab:
  groups:
    -
      groupName:  example
      projects:
        - projectName:     example-java
          commitMessage:   "Initial code registration (#1)"
          issues:
            - Initial code registration
  users:
    - uid:           boze
      userPassword:  password
```

*   **groups:** Information of groups to be registered
    *   **groupName:** Group names
*   **projects:** Information of projects to be registered
    *   **projectName:** Project name
    *   **commitMessage:** Commit message when registering the source code for initial registration to the repository
        *   `template/code/Group name/Project name` (`template/code/example/example-java` in the case of the setting example above)
            If the directory exists, the files stored in that directory are registered to the repository.
    *   **issues:** Tickets  
         If the description is as follows, only the title is registered.

        ```yaml
          issues:
            - Initial code registration
        ```

        If the description is as follows, the title and explanation can be registered.

        ```yaml
        issues:
          - title:  Initial code registration
            description:   |
              Register the following code.
              *   README.md
              *   package.json
        ```

        *   When Redmine is used, issues cannot be defined (Define in `redmine:` instead of in `gitlab:`)
*   **users:** First user registered
    *   The user ID (`uid`) and password (`userPassword`) must be specified.
    *   This can be skipped when `users:` is specified in `user:` as shown below.

        ```yaml
        user:
          users:
            - uid:           boze
              userPassword:  password
              ...

        gitlab:
          groups:
            ...
        ```

    *   A user defined in `users:` or `user.users:`
        is set as the Owner of the groups defined in `groups:`.
*   **url:** URL of GitLab server
    *   The default is `http://gitlab.[Domain name specified in pocci.domain]`.
    *   Environment variables:  `GITLAB_URL`, `GITLAB_PROTOCOL`, `GITLAB_HOST`, `GITLAB_PORT`
*   **adminPassword:** Password of root user
    *   The default is `5iveL!fe`.
    *   Environment variable:  `GITLAB_ROOT_PASSWORD`
*   **sshPort:** Port number when SSH connection to the Git repository
    *   The default is `10022`.
    *   Environment variable:  `GITLAB_SSH_PORT`
*   **smtpEnabled:** Whether or not to enable the sending of mail to the SMTP server
    *   The default is `false`.
    *   Environment variable:  `GITLAB_SMTP_ENABLED`
*   **smtpDomain:** SMTP domain
    *   The default is the domain name specified in pocci.domain.
    *   Environment variable:  `GITLAB_SMTP_DOMAIN`
*   **smtpHost:** SMTP server host name
    *   The default is `smtp.[Domain name specified in pocci.domain]`.
    *   Environment variable:  `GITLAB_SMTP_HOST`
*   **smtpPort:** SMTP server port number
    *   The default is `25`.
    *   Environment variable:  `GITLAB_SMTP_PORT`
*   **mailAddress:** Mail address of GitLab
    *   The default is the address specified in pocci.adminMailAddress.
    *   Environment variable:  `GITLAB_MAIL_ADDRESS`
*   **dbName:** Name of the database to be used internally by GitLab
    *   The default is `gitlabhq_production`.
    *   Environment variable:  `GITLAB_DB_NAME`
*   **dbUser:** User name for connecting to the database to be used internally by GitLab
    *   The default is `gitlab`.
    *   Environment variable:  `GITLAB_DB_USER`
*   **dbPassword:** Password for connecting to the database to be used internally by GitLab
    *   The default is a random alpha-numeric string.
    *   Environment variable:  `GITLAB_DB_PASS`


jenkins:
--------
Jenkins related definitions.

Definition example:

```yaml
jenkins:
  user: jenkinsci
  jobs:
    - example/example-java
  nodes:
    - java
    - python:  "xpfriend/workspace-python27:latest"
    - centos:
        from:  centos:7.1.1503
```

*   **nodes:** Jenkins slave node to be created  
    Specify this in any of the following three ways.
    *   Specify the node name (`java` or `nodejs`) incorporated in pocci.
    *   Specify `Node name:"Image name"`.  
        Specify an image name that was created keeping in mind that the node will operate as a Jenkins slave node of pocci.
    *   Specify `Node name:Object (map)`.  
        Specify any existing image name in `from:` as an element of the object (map).
        This enables the existing image to be able to be operated as a Jenkins slave node.  
        If it is specified in this format, a directory under the name of `config/image/node name` is created,
        and the Dockerfile for operation as a Jenkins slave node
        and the script used from that file are stored in that directory.
*   **jobs:** Build jobs to be created
    *   Specify this in the format of `GitLab group name/GitLab project name`.
    *   `template/code/GitLab group name/GitLab project name` (`template/code/example/example-java` in the case of the setting example above)
        Place `jenkins-config.xml` in the directory.
*   **user:** User to use when configuring the settings of Jenkins.
    *   The ID (`uid`) of a user defined in `user.users` must be specified.
    *   The default is a first user defined in `user.users`.
*   **url:** URL of Jenkins server
    *   The default is `http://jenkins.[Domain name specified in pocci.domain]`.
    *   Environment variables:  `JENKINS_URL`, `JENKINS_PROTOCOL`, `JENKINS_HOST`, `JENKINS_PORT`
*   **jnlpPort:** Port number for when the Jenkins slave node establishes a JNLP connection.
    *   The default is `50000`.
    *   Environment variable:  `JENKINS_JNLP_PORT`
*   **smtpHost:** SMTP server host name
    *   The default is `smtp.[Domain name specified in pocci.domain]`.
    *   Environment variable:  `JENKINS_SMTP_HOST`
*   **mailAddress:** Mail address of Jenkins
    *   The default is the address specified in pocci.adminMailAddress.
    *   Environment variable:  `JENKINS_MAIL_ADDRESS`


slave:
--------
Jenkins slave node definitions.

Use this when you wish to start only a Jenkins slave node in an environment
in which a Jenkins master does not exist (`jenkins` is not specified in pocci.services).

Definition example:

```yaml
slave:
  nodes:
    - java
    - nodejs
```

The definition information is the same as **jenkins:**.


redmine:
--------
Redmine related defintions.

Definition example:

```yaml
redmine:
  projects:
    -
      projectId:  example
      issues:
        - Initial code registration
  users:
    - uid:           boze
      userPassword:  password
```

*   **projects:** Project information
    *   **projectId:** Project name
    *   **issues:** Tickets  
        If the description is as follows, only the title is registered.

        ```yaml
          issues:
            - Initial code registration
        ```

        If the description is as follows, the title and explanation can be registered.

        ```yaml
        issues:
            subject:  Initial code registration
            description:  |
              Register the following code.
              *   README.md
              *   package.json
        ```

*   **users:** First user registered
    *   The user ID (`uid`) and password (`userPassword`) must be specified.
    *   This can be skipped when `users:` is specified in `user:` as shown below.

        ```yaml
        user:
          users:
            - uid:           boze
              userPassword:  password
              ...

        redmine:
          projects:
            ...
        ```

    *   A user defined in `users:` or `user.users:`
        is set as the administrator and developer of the projects defined in `projects:`.
*   **user:** A user to operate GitLab.
    *   The default is a first user defined in `users:` or `user.users`.
*   **url:** URL of Redmine server
    *   The default is `http://redmine.[Domain name specified in pocci.domain]`.
    *   Environment variables:  `REDMINE_URL`, `REDMINE_PROTOCOL`, `REDMINE_HOST`, `REDMINE_PORT`
*   **smtpEnabled:** Whether or not to enable the sending of mail to the SMTP server
    *   The default is `false`.
    *   Environment variable:  `REDMINE_SMTP_ENABLED`
*   **smtpDomain:** SMTP domain
    *   The default is the domain name specified in pocci.domain.
    *   Environment variable:  `REDMINE_SMTP_DOMAIN`
*   **smtpHost:** SMTP server host name
    *   The default is `smtp.[Domain name specified in pocci.domain]`.
    *   Environment variable:  `REDMINE_SMTP_HOST`
*   **smtpPort:** SMTP server port number
    *   The default is `25`.
    *   Environment variable:  `REDMINE_SMTP_PORT`
*   **mailAddress:** Mail address of Redmine
    *   The default is the address specified in pocci.adminMailAddress.
    *   Environment variable:  `REDMINE_MAIL_ADDRESS`
*   **dbName:** Name of the database to be used internally by Redmine
    *   The default is `redmine_production`.
    *   Environment variable:  `REDMINE_DB_NAME`
*   **dbUser:** User name for connecting to the database to be used internally by Redmine
    *   The default is `redmine`.
    *   Environment variable:  `REDMINE_DB_USER`
*   **dbPassword:** Password for connecting to the database to be used internally by Redmine
    *   The default is a random alpha-numeric string.
    *   Environment variable:  `REDMINE_DB_PASS`
*   **adminPassword:** Password of admin user
    *   The default is `abcd1234`.
    *   Environment variable:  `REDMINE_ADMIN_PASSWORD`


sonar:
------
SonarQube related definitions.

*   **users:** First user registered
    *   The user ID (`uid`) and password (`userPassword`) must be specified.
    *   This can be skipped when `user.users` is specified.
    *   A user defined in `users:` or `user.users:` is belong to the `power-users` group.
*   **user:** A user to operate GitLab.
    *   The default is a first user defined in `users:` or `user.users`.
*   **url:** URL of SonarQube server
    *   The default is `http://sonar.[Domain name specified in pocci.domain]`.
    *   Environment variables:  `SONAR_URL`, `SONAR_PROTOCOL`, `SONAR_HOST`, `SONAR_PORT`
*   **dbUser:** User name for connecting to the database to be used internally by SonarQube
    *   The default is `sonarqube`.
    *   Environment variable:  `SONAR_DB_USER`
*   **dbPassword:** Password for connecting to the database to be used internally by SonarQube
    *   The default is a random alpha-numeric string.
    *   Environment variable:  `SONAR_DB_PASS`
*   **smtpHost:** SMTP server host name
    *   The default is `smtp.[Domain name specified in pocci.domain]`.
    *   Environment variable:  `SONAR_SMTP_HOST`
*   **smtpPort:** SMTP server port number
    *   The default is `25`.
    *   Environment variable:  `SONAR_SMTP_PORT`
*   **mailAddress:** Mail address of SonarQube
    *   The default is the address specified in pocci.adminMailAddress.
    *   Environment variable:  `SONAR_MAIL_ADDRESS`

smtp:
------
SMTP Service related defintions.

*   **url:** URL of SMTP server
    *   The default is `http://smtp.[Domain name specified in pocci.domain]`.
    *   Environment variables:  `SMTP_URL`, `SMTP_PROTOCOL`, `SMTP_HOST`, `SMTP_PORT`
*   **relayhost:** Relay host
    *   The default is a value of environment variable `SMTP_RELAYHOST`
*   **password:** SMTP password
    *   The default is a value of environment variable `SMTP_PASSWORD`

taiga:
--------
Taiga related defintions.

Definition example:

```yaml
taiga:
  projects:
    - name: example
      description: example project
```

*   **projects:** Project information
    *   **name:** Project name
    *   **description:** Project description
*   **users:** First user registered
    *   The user ID (`uid`), password (`userPassword`), and mail address (`mail`) must be specified.
    *   This can be skipped when `users:` is specified in `user:` as shown below.

        ```yaml
        user:
          users:
            - uid:           boze
              userPassword:  password
              ...

        taiga:
          projects:
            ...
        ```

    *   A user defined in `users:` or `user.users:`
        is set as the "Product Onwer" of the projects defined in `projects:`.
*   **user:** A user of the project owner.
    *   The default is a first user defined in `users:` or `user.users`.
*   **url:** URL of Taiga server
    *   The default is `http://taiga.[Domain name specified in pocci.domain]`.
    *   Environment variables:  `TAIGA_URL`, `TAIGA_PROTOCOL`, `TAIGA_HOST`, `TAIGA_PORT`
*   **smtpDomain:** SMTP domain
    *   The default is the domain name specified in pocci.domain.
    *   Environment variable:  `TAIGA_SMTP_DOMAIN`
*   **smtpHost:** SMTP server host name
    *   The default is `smtp.[Domain name specified in pocci.domain]`.
    *   Environment variable:  `TAIGA_SMTP_HOST`
*   **smtpPort:** SMTP server port number
    *   The default is `25`.
    *   Environment variable:  `TAIGA_SMTP_PORT`
*   **mailAddress:** Mail address of Taiga
    *   The default is the address specified in pocci.adminMailAddress.
    *   Environment variable:  `TAIGA_MAIL_ADDRESS`
*   **dbName:** Name of the database to be used internally by Taiga
    *   The default is `taiga_production`.
    *   Environment variable:  `TAIGA_DB_NAME`
*   **dbUser:** User name for connecting to the database to be used internally by Taiga
    *   The default is `taiga`.
    *   Environment variable:  `TAIGA_DB_USER`
*   **dbPassword:** Password for connecting to the database to be used internally by Taiga
    *   The default is a random alpha-numeric string.
    *   Environment variable:  `TAIGA_DB_PASS`
