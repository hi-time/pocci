Pocci
=====

A try of CI Services by Docker containers.

![Services](./pocci-service.png)

[日本語](./README.ja.md)

Requirement
-----------
*   [Docker](https://www.docker.com/)
*   [Docker Compose](https://github.com/docker/compose/)

Usage
-----
1.  Change the current user to the user who has uid=1000.

2.  Clone this repository.

    ```bash
    git clone https://github.com/xpfriend/pocci.git pocci
    cd pocci
    ```

3.  Build setup tools.

    ```bash
    cd bin
    bash ./build
    ```

4.  Check and edit the files in `config` directory.

    ```
    config/
      - code/               ... Example codes
      - services/           ... Service definitions
        - nginx/              ... Nginx reverse proxy configuration
      - setup.yml           ... User settings
    ```

5.  Create and start services by `create-service`.

    ```bash
    ./create-service
    ```

6.  Add a line to your `hosts` file, like this:

    ```
    192.168.1.2 portal.pocci.test user.pocci.test gitlab.pocci.test jenkins.pocci.test sonar.pocci.test
    ```

7.  Use the services.

    *   http://gitlab.pocci.test ... GitLab
    *   http://jenkins.pocci.test ... Jenkins
    *   http://sonar.pocci.test ... SonarQube
    *   http://user.pocci.test ... phpLDAPadmin

Users
--------------
### Administrator
Service      | User name                  | Password
------------ | -------------------------- | --------
GitLab       | root                       | 5iveL!fe
SonarQube    | admin                      | admin
phpLDAPadmin | cn=admin,dc=example,dc=com | admin

### Developer
User name  | Password
---------- | --------
jenkinsci  | password
bouze      | password
