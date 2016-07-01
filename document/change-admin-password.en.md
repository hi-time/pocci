How to Change the Administrator Password
========================================

How to change the administrator password is different for each software.

GitLab
------
Click **Standard** tab and sign in with root account.
And change the password by **Profile Settings - Password**.

SonarQube
---------
1.  Log in with **admin** user.
1.  Click **Administrator - My account**.
1.  Click **Security**.

Redmine
-------
Log in with **admin** user,
and click **My account - Change password** link.


Open LDAP
---------
1.  If you are using the Jenkins, change admin password of LDAP in the following procedure.
    1.  Log in to Jenkins.
    1.  Click **Manage Jenkins** link.
    1.  Click **Configure Global Security** link.
    1.  Click  **Advanced..** button.
    1.  Input a new password in **Manager Password** field.
    1.  Click **Save** button.
1.  If you are using the Redmine, change admin password of LDAP in the following procedure.
    1.  Sign in to Redmine with **admin** user.
    1.  Click **Administration** link.
    1.  Click **LDAP authentication** link.
    1.  Click **ldap** link.
    1.  Input a new password in **Password** field.
    1.  Click **Save**.
1.  Change the following variables in `config/.env` file to the new password
    *   LDAP_PASS
    *   LDAP_BIND_PASSWORD
    *   LDAP_ADMIN_PASSWORD
1.  Execute `/tools/change-password [current password] [new password]` in the ldap container.

    For example:
    ```
    docker exec -it poccis_ldap_1 /tools/change-password admin abcd1234
    ```

1.  Execute `bin/restart-service` to restart the services.


Database (PostgreSQL)
---------------------
GitLab, Redmine, SonarQube uses internally PostgreSQL database.

Password that each application will use to connect to the database is
a random string that has been created by the `create-config`.

This string can be changed by the following procedure.
1.  Change the value of the `DB_PASS` in the `config/core-services.yml` file to the new password.
    (DB_PASS is under either **gitlabdb** or **redminedb** or **sonarqubedb**)
1.  Change the value of the `*_DB_PASS` in the `config/.env` file to the new password.
     (`*` is either **GITLAB** or **REDMINE** or **SONAR***)
1   Execute `alter user ...` SQL in the database container.
    For example:

    For example:
    ```
    docker exec poccis_gitlabdb_1 psql -U postgres -c "alter user gitlab with unencrypted password 'abcd1234'"
    ```

1.  Execute `bin/restart-service` to restart the services.
