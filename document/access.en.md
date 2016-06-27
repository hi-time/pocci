How to Connect to Services
==========================

Add a description such as the following to the hosts file
(`C:\Windows\System32\drivers\etc\hosts` in the case of a Windows machine) of the machine to be
connected to the started CI services (machine that will be a client of the CI services).

Setting example (the acutual IP address must be the IP address of the machine that started the CI services):

```
192.168.1.2 user.pocci.test gitlab.pocci.test jenkins.pocci.test sonar.pocci.test kanban.pocci.test redmine.pocci.test cert.pocci.test
```


URLs
----

URL                             | Services                                                | Main applications
------------------------------- | ------------------------------------------------------- | ---------------------------------------------
http://gitlab.pocci.test/       | [GitLab](https://gitlab.com/)                           | Version Control / Issue Tracking / Continuous Integration
http://jenkins.pocci.test/ (*)  | [Jenkins](https://jenkins-ci.org/)                      | Continuous Integration
http://sonar.pocci.test/        | [SonarQube](http://www.sonarqube.org/)                  | Quality Management
http://user.pocci.test/         | [Account Center (LDAP)](https://github.com/xpfriend/pocci-account-center)    | User Account Management
http://kanban.pocci.test/       | [GitLab Kanban Board](http://kanban.leanlabs.io/)       | Kanban Board
http://redmine.pocci.test/ (*)  | [Redmine](http://www.redmine.org/)                      | Issue Tracking
http://cert.pocci.test/         | -                                                       | Download page of Root Certificate and Server Certificate

(*) If the default configuration is used, access will not be possible because the services will not be started.


Accounts
--------

### Administrators
Service               | User name                  | Password    | Remark
--------------------- | -------------------------- | ----------- | ------------------
GitLab                | root                       | 5iveL!fe    | From Standard tab
SonarQube             | admin                      | admin       |
Redmine               | admin                      | abcd1234    |
Account Center (LDAP) | admin                      | admin       |

*   For GitLab, sign in from the **Standard** tab.
*   For details on how to change the password of administrators,
    refer to [How to Change the Administrator Password](./change-admin-password.en.md).


### Developers
User name  | Password
---------- | --------
jenkinsci  | password
bouze      | password

*   For GitLab, sign in from the **LDAP** tab.
*   For kanban board, you can click `with http://gitlab.pocci.test/` to log in using the
    OAuth authentication function of GitLab without entering a user name and password.

