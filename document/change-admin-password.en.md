How to Change the Administrator Password
========================================

How to change the administrator password is different for each software.

Open LDAP
---------
Execute `/tools/change-password [current password] [new password]` in the ldap container.
For example:

```
docker exec -it poccis_ldap_1 /tools/change-password admin abcd1234
```

GitLab
------
Click **Standard** tab and sign in with root account.
And change the password by **Profile Settings - Password**.

SonarQube
---------
Call [api/users/change_password](https://nemo.sonarqube.org/web_api/api/users/change_password).

For example:

```
curl -u admin:admin -X POST "http://sonar.pocci.test/api/users/change_password?login=admin&previousPassword=admin&password=abcd1234"
```

Redmine
-------
Log in with **admin** user,
and click **My account - Change password** link.
