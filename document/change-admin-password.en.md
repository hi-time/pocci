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
Log in with **admin** user, 
and open user management form by **Administration - Security - Users**.
You can change the password by **Change password** link (lock icon) of **admin** row.

Redmine
-------
Log in with **admin** user,
and click **My account - Change password** link.
