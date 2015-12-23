管理者パスワードの変更方法
==========================

一般ユーザーのパスワードは [Account Center](./add-user.ja.md) で変更することができますが、
管理者アカウントのパスワード変更方法はソフトウェアごとに異なります。

Open LDAP
---------
実行中の LDAP コンテナ上で
`/tools/change-password [現在のパスワード] [新しいパスワード]`
を実行してください。

実行例:
```
docker exec -it poccis_ldap_1 /tools/change-password admin abcd1234
```

GitLab
------
standard タブから root アカウントでサインインし、
**Profile Settings - Password** で変更してください。

SonarQube
---------
admin でログインし、**Administration - Security - Users** でユーザー管理画面に移動し、
admin 行の **Change password** リンク (鍵アイコン) から変更できます。

Redmine
-------
admin でログインし、**個人設定 - パスワード変更** リンクから変更できます。
