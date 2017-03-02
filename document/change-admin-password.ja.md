管理者パスワードの変更方法
==========================

一般ユーザーのパスワードは [Account Center](./add-user.ja.md) で変更することができますが、
管理者アカウントのパスワード変更方法はソフトウェアごとに異なります。

GitLab
------
standard タブから root アカウントでサインインし、
**Profile Settings - Password** で変更してください。

SonarQube
---------
1.  admin でログインする。
1.  **Administrator - 個人設定** をクリックする。
1.  **セキュリティ** をクリックする。

Redmine
-------
admin でログインし、**個人設定 - パスワード変更** リンクから変更できます。


Open LDAP
---------
1.  Jenkins を利用している場合は、以下の手順で LDAP 管理者パスワードを変更してください。
    1.  ログインする。
    1.  **Jenkinsの管理** をクリックする。
    1.  **グローバルセキュリティの設定** をクリックする。
    1.  LDAPの**高度な設定** をクリックする。
    1.  **管理者のパスワード** に新しいパスワードを入力する。
    1.  **保存** をクリックする。
1.  Redmine を利用している場合は、以下の手順で LDAP 管理者パスワードを変更してください。
    1.  admin でログインする。
    1.  **管理** をクリックする。
    1.  **LDAP認証** をクリックする。
    1.  **ldap** リンクをクリックする。
    1.  **パスワード** に新しいパスワードを入力する。
    1.  **保存** をクリックする。
1.  `config/.env` ファイルに書かれている以下の変数値を新しいパスワードに変更してください。
    *   LDAP_PASS
    *   LDAP_BIND_PASSWORD
    *   LDAP_ADMIN_PASSWORD
1.  実行中の LDAP コンテナ上で
    `/tools/change-password [現在のパスワード] [新しいパスワード]`
    を実行してください。

    実行例:
    ```
    docker exec -it poccis_ldap_1 /tools/change-password admin abcd1234
    ```
1.  `bin/restart-service` を実行して、サービスを再起動してください。


データベース (PostgreSQL)
-------------------------
GitLab, Redmine, SonarQube は内部的に PostgreSQL データベースを使用しています。

それぞれのアプリケーションがデータベース接続時に使用するパスワードは、
`create-config` 実行時に作成されたランダムな文字列です。

この文字列は以下の手順で変更できます。

1.  `config/core-services.yml` の `DB_PASS` の値を新しいパスワードに変更する。
    (DB_PASS設定は **gitlabdb**, **redminedb**, **sonarqubedb** のいずれかの下にある)
1.  `config/.env` の `*_DB_PASS` の値を新しいパスワードに変更する
    (`*` は **GITLAB**, **REDMINE**, **SONAR*** のいずれか)。
1.  実行中のデータベースコンテナ上で `alter user ...` SQL を実行し、
    パスワード変更を行う。

    実行例:
    ```
    docker exec poccis_gitlabdb_1 psql -U postgres -c "alter user gitlab with unencrypted password 'abcd1234'"
    ```

1.  `bin/restart-service` を実行して、サービスを再起動する。
