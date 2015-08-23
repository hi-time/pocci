セットアップファイル リファレンス
=================================
セットアップファイル (`setup.*.yml`) を記述することで、
各サービスに対してさまざまな情報を登録することができます。


セットアップファイルの例:

```yaml
pocci:
  domain: pocci.test
  services:
    - gitlab
    - user
    - jenkins
    - sonar
    - redmine
  environment:
    TZ: Asia/Tokyo

user:
  users:
    - uid:          jenkinsci
      givenName:    Jenkins
      sn:           CI
      mail:         jenkins-ci@example.com
      userPassword: password
    - uid:          bouze
      givenName:    Taro
      sn:           BOUZE
      mail:         bouze@example.com
      userPassword: password

jenkins:
  nodes:
    - java
    - nodejs

gitlab:
  groups:
    - groupName: example
      projects:
        - projectName:    example-java
          commitMessage:  "refs #1 (import example codes)"
        - projectName:    example-nodejs
          commitMessage:  "refs #1 (import example codes)"

redmine:
  lang: ja
  projects:
    - projectId: example
      issues:
        - import example codes
```



セットアップファイルでは、以下のような情報の設定が行えます。

セクション  | 役割                          | 設定(登録)できるもの
----------- | ----------------------------- | ----------- 
pocci       | サービス構成全般に関する設定  | サービスのドメイン名、利用するサービス
user        | ユーザー登録                  | サービス利用者のアカウント
gitlab      | GitLab 関連登録               | グループ、プロジェクト (リポジトリ)、チケット (Issue)
jenkins     | Jenkins 関連登録              | ビルドジョブ、スレーブノード
redmine     | Redmine 関連登録              | プロジェクト、チケット



pocci:
------
サービス構成全般に関する情報の登録を行います。

定義例:

```yaml
pocci:
  domain: pocci.example.com
  services:
    - gitlab
    - user
    - jenkins
    - sonar
    - redmine
  environment:
    TZ: Asia/Tokyo
```

*   **domain:** サービスのドメイン名  
    例えば、`domain : pocci.example.com` とすれば、
    `http://gitlab.pocci.example.com` や `http://jenkins.pocci.example.com`
    というURLでサービスが利用できます。  
    デフォルトは `pocci.test`。
*   **services:** 利用するサービス  
    gitlab, jenkins, sonar, user, kanban, redmine
    の中から利用したいものを選んでください。
    *   注意: redmine と kanban は併用できません。
    *   IPアドレスを使って接続する場合（例：`http://192.168.0.2`）、
        ここで先頭に指定したサービスに接続されます。
*   **environment:** サービスコンテナに設定する環境変数


user:
-----
サービス運用開始に最低限必要なユーザーの登録を行います。

定義例:

```yaml
user:
  users:
    - uid:          bouze
      givenName:    太郎
      sn:           坊主
      mail:         bouze@example.com
      userPassword: password
```




ldap:
-----
LDAPサーバ関連設定を行います。

pocci内部の組み込みLDAPサーバ（userサービス）以外を利用する場合には指定が必要になります。

定義例:

```yaml
ldap:
  host:           user.pocci.test
  url:            ldap://user.pocci.test
  domain:         example.com
  baseDn:         dc=example,dc=com
  bindDn:         cn=admin,dc=example,dc=com
  bindPassword:   admin
  organisation:   Example Inc.
  attrLogin:      uid
  attrFirstName:  givenName
  attrLastName:   sn
  attrMail:       mail
```

*   **host:** LDAP サーバーのホスト名  
    pocci内部の組み込みLDAPサーバ（userサービス）以外を利用する場合に指定してください。
*   **url:** LDAP サーバーアクセス時のURL  
    pocci内部の組み込みLDAPサーバ（userサービス）以外を利用する場合に指定してください。
*   **domain:** LDAPドメイン
*   **baseDn:** ベースDN
*   **bindDn:** バインドDN
*   **bindPassword:** バインド時のパスワード
*   **organisation:** 組織
*   **attrLogin:** 各種サービスへのログインアカウントとして使用する利用者属性
*   **attrFirstName:** 利用者の名を表す属性
*   **attrLastName:** 利用者の姓を表す属性
*   **attrMail:** 利用者のメールアドレスを表す属性


外部のLDAPサーバを利用する場合は以下のように記述します。

```yaml
pocci:
  services:
    - gitlab
    - jenkins
    - sonar
    - redmine

ldap:
  host: ldap.example.com
```

*   `pocci.services` に `user` を追加しない。
*   `ldap.host` に外部の LDAP サーバアドレスを記述する。


gitlab:
-------
GitLab 関連情報の登録を行います。

定義例:

```yaml
gitlab:
  topPage: /example/example-java/blob/master/README.md
  groups:
    -
      groupName: example
      projects:
        - projectName:    example-java
          commitMessage:  "初期コード登録 (#1)"
          issues:
            - 初期コード登録
  users:
    - uid:          bouze
      userPassword: password
```

*   **topPage:** ホスト名のみを指定した時に表示されるページ。デフォルトはログインページ
*   **groups:** 登録するグループの情報
    *   **groupName:** グループ名
*   **projects:** 登録するプロジェクトの情報
    *   **projectName:** プロジェクト名
    *   **commitMessage:** 初期登録用のソースコードをリポジトリに登録する際のコミットメッセージ
        *   `template/code/グループ名/プロジェクト名` (上の設定例の場合は `template/code/example/example-java`)
            ディレクトリが存在すれば、その中に格納されているファイルがリポジトリへ登録されます。
        *   Jenkins を利用している場合、上のディレクトリ内に `jenkins-config.xml` が存在すれば、Jenkins へのジョブ登録が行われます。
    *   **issues:** チケット  
        以下のように記述するとタイトルのみが登録されますが、

        ```yaml
          issues:
            - 初期コード登録
        ```

        以下のように記述するとタイトルと説明を登録できます。

        ```yaml
        issues:
          - title: 初期コード登録
            description:  |
              以下のコードを登録する。
              *   README.md
              *   package.json
        ```

        *   Redmine を使用する場合、issues の定義はできません(`gitlab:` ではなく `redmine:` の方に定義する)
*   **users:** 初期登録ユーザー
    *   ユーザーID (`uid`) およびパスワード (`userPassword`) の指定が必要です。
    *   以下のように `user:` に `users:` が指定されている場合は省略可能です。

        ```yaml
        user:
          users:
            - uid:          bouze
              userPassword: password
              ...

        gitlab:
          groups:
            ...
        ```

    *   `users:` または `user.users:` で定義したユーザーは、
        `groups:` で定義したグループの Owner として設定されます。
*   **host:** GitLab サーバのホスト名。外部の GitLab サーバを使用する場合に指定する
*   **url:** GitLab サーバのURL。外部の GitLab サーバを使用する場合に指定する
*   **adminPassword:** rootユーザーのパスワード。デフォルトは `5iveL!fe`
*   **dbUser:** GitLab が内部的に使用するデータベース接続時のユーザー名。デフォルトは `gitlab`
*   **dbPassword:** GitLab が内部的に使用するデータベース接続時のパスワード。デフォルトは `secretpassword`
*   **dbName:** GitLab が内部的に使用するデータベースの名前。デフォルトは `gitlabhq_production`




jenkins:
--------
Jenkins 関連の情報登録を行います。

定義例:

```yaml
jenkins:
  user:
    uid:          bouze
    userPassword: password
  nodes:
    - java
    - nodejs
```

*   **nodes:** ビルド実行時に利用できるJenkinsスレーブノードの種類  
    `java`, `nodejs`, `iojs` が指定できます。
*   **user:** Jenkins の設定を行う際に利用するユーザー
    *   ユーザーID (`uid`) およびパスワード (`userPassword`) の指定が必要です。
    *   以下のように `user:` に `users:` が指定されている場合は省略可能です。

        ```yaml
        user:
          users:
            - uid:          bouze
              userPassword: password
              ...

        gitlab:
          groups:
            ...
        ```

*   **host:** Jenkins サーバのホスト名。外部の Jenkins サーバを使用する場合に指定する
*   **url:** Jenkins サーバのURL。外部の Jenkins サーバを使用する場合に指定する


redmine:
--------
Redmine 関連の情報登録を行います。

定義例:

```yaml
redmine:
  projects:
    -
      projectId: example
      issues:
        - 初期コード登録
  users:
    - uid:          bouze
      userPassword: password
  lang: ja
```

*   **projects:** プロジェクト情報
    *   **projectId:** プロジェクト名
    *   **issues:** チケット  
        以下のように記述するとタイトルのみが登録されますが、

        ```yaml
          issues:
            - 初期コード登録
        ```

        以下のように記述するとタイトルと説明を登録できます。

        ```yaml
        issues:
            subject: 初期コード登録
            description: |
              以下のコードを登録する。
              *   README.md
              *   package.json
        ```

*   **users:** 初期登録ユーザー
    *   ユーザーID (`uid`) およびパスワード (`userPassword`) の指定が必要です。
    *   以下のように `user:` に `users:` が指定されている場合は省略可能です。

        ```yaml
        user:
          users:
            - uid:          bouze
              userPassword: password
              ...

        redmine:
          projects:
            ...
        ```

    *   `users:` または `user.users:` で定義したユーザーは、
        `projects:` で定義したプロジェクトの管理者および開発者として設定されます。
*   **lang:** デフォルト設定で利用する言語
*   **host:** Redmine サーバのホスト名。外部の Redmine サーバを使用する場合に指定する
*   **url:** Redmine サーバのURL。外部の Redmine サーバを使用する場合に指定する
*   **dbUser:** Redmine が内部的に使用するデータベース接続時のユーザー名。デフォルトは `redmine`
*   **dbPassword:** Redmine が内部的に使用するデータベース接続時のパスワード。デフォルトは `password`
*   **dbName:** Redmine が内部的に使用するデータベースの名前。デフォルトは `redmine_production`


sonar:
------
SonarQube 関連の設定を行います。

*   **host:** SonarQube サーバのホスト名。外部の SonarQube サーバを使用する場合に指定する
*   **url:** SonarQube サーバのURL。外部の SonarQube サーバを使用する場合に指定する
*   **dbUser:** SonarQube が内部的に使用するデータベース接続時のユーザー名。デフォルトは `sonarqube`
*   **dbPassword:** SonarQube が内部的に使用するデータベース接続時のパスワード。デフォルトは `sonarqubepass`
*   **dbName:** SonarQube が内部的に使用するデータベースの名前。デフォルトは `sonarqubedb`
