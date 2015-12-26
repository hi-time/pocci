セットアップファイル リファレンス
=================================
セットアップファイル (`setup.*.yml`) は、`bin/create-config`
コマンドが各サービスの初期設定を行う際に利用する定義ファイルです。


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
    - uid:          boze
      givenName:    Taro
      sn:           BOZE
      mail:         boze@example.com
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


セットアップファイルの役割
--------------------------
`bin/create-config` コマンドは以下の処理を行います。

*   config ディレクトリ内の設定ファイルを作成する
*   サービスインスタンスを操作して初期設定を行う

これらの処理をどのように行うかを記述したものがセットアップファイルになります。

### config ディレクトリ内の設定ファイル作成
config ディレクトリの各ファイルは
`template/services` ディレクトリにある雛形ファイルに対して、
セットアップファイルに記述された設定内容を反映することにより作成されます。

config ディレクトリの内容:
```
pocci/
  - config/
    - nginx/                ... Nginx 設定
    - .env                  ... 環境変数定義
    - althosts              ... ホスト名 (IPアドレス) 定義 (hostsファイル形式)
    - backend-services.yml  ... バックエンドサービス用コンテナの定義 (Docker Compose形式)
    - core-services.yml     ... 各種サービス用コンテナ定義 (Docker Compose形式)
    - workspaces.yml        ... ビルド時作業領域用コンテナ定義 (Docker Compose形式)
```

config ディレクトリ内のファイルの中で中心的な役割を担うのが `.env` (環境変数定義) です。
各サービス（コンテナ）は `.env` に記述された環境変数に従って動作を行います。
`.env` はセットアップファイルの内容をもとにして作成されます。

### サービスインスタンスの初期設定
セットアップファイルに記述された情報をもとにして、
サービスインスタンスの初期設定が行われます。

サービスインスタンスの設定例:
*   **user:** サービス利用者のアカウント登録
*   **gitlab:** グループ、プロジェクト (リポジトリ)、チケット (Issue)
*   **jenkins:** ビルドジョブ、スレーブノード



pocci:
------
サービス構成全般に関する情報定義。

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
  hosts:
    - 192.168.0.11 test-01.pocci.example.com it-server
    - 192.168.0.12 test-02.pocci.example.com uat-server
  environment:
    TZ: Asia/Tokyo
```

*   **domain:** サービスのドメイン名  
    例えば、`domain : pocci.example.com` とすれば、
    `http://gitlab.pocci.example.com` や `http://jenkins.pocci.example.com`
    というURLでサービスが利用できます。  
    *   デフォルトは `pocci.test`
    *   環境変数: `POCCI_DOMAIN_NAME`
*   **services:** 利用するサービス  
    gitlab, jenkins, sonar, user, kanban, redmine, slave
    の中から利用したいものを選んでください。
    *   組み合わせに関する注意:
        *   redmine と kanban は併用できません。
        *   redmine を指定する場合は必ず services に gitlab の指定が必要です。
            (別マシン上に起動する gitlab と連携することはできません)
        *   kanban を指定する場合は services に gitlab を指定するか
            GITLAB_URL 環境変数に接続可能な gitlab の URL が設定されている必要があります。
        *   slave を指定する場合は、JENKINS_URL 環境変数に接続可能な
            jenkins の URL が設定されている必要があります。
        *   外部の LDAP サーバを利用する場合は user の指定はできません。
    *   IPアドレスを使って接続する場合（例：`http://192.168.0.2`）、
        ここで先頭に指定したサービスに接続されます。
    *   環境変数: `INTERNAL_SERVICES`
*   **hosts:** 各サービスが参照するサーバの名前  
    *   `IPアドレス サーバ名 別名1 別名2 ...`  の形式でIPアドレス毎に記述する
    *   ここで記述した内容は `config/althosts` に反映される
*   **environment:** サービスコンテナに設定する環境変数  
    任意の値を定義可能です。
*   **logdir:** ログ出力先ディレクトリ  
    ログ出力先ディレクトリを絶対パスで指定してください。
    *   デフォルトは pocci ディレクトリの下の `log` になります。
    *   環境変数: `POCCI_LOG_DIR`

user:
-----
サービス運用開始に最低限必要なユーザー (管理者) の定義を行います。

定義例:

```yaml
user:
  users:
    - uid:          boze
      givenName:    太郎
      sn:           坊主
      mail:         boze@example.com
      userPassword: password
```

*   **users:** 初期登録ユーザー
    *   pocci に組み込まれているユーザー管理機能 (Open LDAP) を使用する場合、
        上記定義例のように `uid` (ユーザーID), `userPassword` (パスワード), 
        `givenName` (名), `sn` (姓), `mail` (メールアドレス) を指定してください。
        これらの値を利用してユーザー登録が行われます。
*   **url:** ユーザー管理画面アクセス時のURL
    *   デフォルトは `http://user.[pocci.domainで指定したドメイン名]`
    *   環境変数: `USER_URL`, `USER_PROTOCOL`, `USER_HOST`, `USER_PORT`


ldap:
-----
LDAPサーバ関連定義。

pocci内部の組み込みLDAPサーバ（userサービス）を利用せずに、
外部の LDAP サーバを利用する場合は記述する必要があります。

定義例:

```yaml
ldap:
  url:            'ldap://user.pocci.test'
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

*   **url:** LDAP サーバーアクセス時のURL
    *   デフォルトは `ldap://user.[pocci.domainで指定したドメイン名]`
    *   環境変数: `LDAP_URL`, `LDAP_PROTOCOL`, `LDAP_HOST`, `LDAP_PORT`
*   **domain:** LDAPドメイン
    *   環境変数: `LDAP_DOMAIN`
*   **baseDn:** ベースDN
    *   環境変数: `LDAP_BASE_DN`
*   **bindDn:** バインドDN
    *   環境変数: `LDAP_BIND_DN`
*   **bindPassword:** バインド時のパスワード
    *   環境変数: `LDAP_BIND_PASSWORD`
*   **organisation:** 組織
    *   環境変数: `LDAP_ORGANISATION`
*   **attrLogin:** 各種サービスへのログインアカウントとして使用する利用者属性
    *   環境変数: `LDAP_ATTR_LOGIN`
*   **attrFirstName:** 利用者の名を表す属性
    *   環境変数: `LDAP_ATTR_FIRST_NAME`
*   **attrLastName:** 利用者の姓を表す属性
    *   環境変数: `LDAP_ATTR_LAST_NAME`
*   **attrMail:** 利用者のメールアドレスを表す属性
    *   環境変数: `LDAP_ATTR_MAIL`


外部のLDAPサーバを利用する場合は以下のように記述します。

```yaml
pocci:
  services:
    - gitlab
    - jenkins
    - sonar
    - redmine

ldap:
  url: 'ldap://ldap.example.com'
```

*   `pocci.services` に `user` を追加しない。
*   `ldap.url` に外部の LDAP サーバのURLを記述する。


gitlab:
-------
GitLab 関連定義。

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
    - uid:          boze
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
            - uid:          boze
              userPassword: password
              ...

        gitlab:
          groups:
            ...
        ```

    *   `users:` または `user.users:` で定義したユーザーは、
        `groups:` で定義したグループの Owner として設定されます。
*   **url:** GitLab サーバのURL
    *   デフォルトは `http://gitlab.[pocci.domainで指定したドメイン名]`
    *   環境変数: `GITLAB_URL`, `GITLAB_PROTOCOL`, `GITLAB_HOST`, `GITLAB_PORT`
*   **adminPassword:** rootユーザーのパスワード
    *   デフォルトは `5iveL!fe`
    *   環境変数: `GITLAB_ROOT_PASSWORD`
*   **sshPort:** GitリポジトリにSSH接続する際のポート番号
    *   デフォルトは `10022`
    *   環境変数: `GITLAB_SSH_PORT`
*   **smtpEnabled:** SMTPサーバへのメール送信を有効にするかどうか
    *   デフォルトは `false`
    *   環境変数: `GITLAB_SMTP_ENABLED`
*   **smtpDomain:** SMTPドメイン
    *   デフォルトは pocci.domain で指定したドメイン名
    *   環境変数: `GITLAB_SMTP_DOMAIN`
*   **smtpHost:** SMTPサーバホスト名
    *   デフォルトは `smtp.[pocci.domain で指定したドメイン名]`
    *   環境変数: `GITLAB_SMTP_HOST`
*   **smtpPort:** SMTPサーバポート番号
    *   デフォルトは `25`
    *   環境変数: `GITLAB_SMTP_PORT`
*   **mailAddress:** このサーバのメールアドレス
    *   デフォルトは `gitlab@[pocci.domainで指定したドメイン名]`
    *   環境変数: `GITLAB_MAIL_ADDRESS`


jenkins:
--------
Jenkins 関連定義。

定義例:

```yaml
jenkins:
  user:
    uid:          boze
    userPassword: password
  jobs:
    - example/example-java
  nodes:
    - java
    - python: "xpfriend/jenkins-slave-python27:latest"
    - centos:
        from: centos:7.1.1503
```

*   **nodes:** 作成するJenkinsスレーブノード  
    以下の3種類のいずれかの方法で指定できます。
    *   pocci 組み込みのノード名 (`java` もしくは `nodejs`) を指定する。
    *   `ノード名:"イメージ名"` を指定する。  
        pocci の Jenkinsスレーブノードとして動作することを意識して作成されたイメージ名を指定します。
    *   `ノード名:オブジェクト(マップ)` を指定する。  
        オブジェクト(マップ)の要素として `from:` で任意の既存イメージ名を指定します。
        これにより、既存のイメージを Jenkins スレーブノードとして動作させることができるようになります。  
        この形式で指定すると `config/image/ノード名` という名前でディレクトリが作成され、
        その中に Jenkinsスレーブノードとして動作させるための Dockerfile
        とそのファイルから利用されるスクリプトが格納されます。
*   **jobs:** 作成するビルドジョブ
    *   `GitLabグループ名/GitLabプロジェクト名` の形式で指定してください。
    *   `template/code/GitLabグループ名/GitLabプロジェクト名` (上の設定例の場合は `template/code/example/example-java`)
        ディレクトリ内に `jenkins-config.xml` を格納してください。
*   **user:** Jenkins の設定を行う際に利用するユーザー
    *   ユーザーID (`uid`) およびパスワード (`userPassword`) の指定が必要です。
    *   以下のように `user:` に `users:` が指定されている場合は省略可能です。

        ```yaml
        user:
          users:
            - uid:          boze
              userPassword: password
              ...

        gitlab:
          groups:
            ...
        ```

*   **url:** Jenkins サーバのURL
    *   デフォルトは `http://jenkins.[pocci.domainで指定したドメイン名]`
    *   環境変数: `JENKINS_URL`, `JENKINS_PROTOCOL`, `JENKINS_HOST`, `JENKINS_PORT`
*   **jnlpPort:** JenkinsスレーブノードがJNLP接続する際のポート番号
    *   デフォルトは `50000`
    *   環境変数: `JENKINS_JNLP_PORT`
*   **smtpHost:** SMTPサーバホスト名
    *   デフォルトは `smtp.[pocci.domain で指定したドメイン名]`
    *   環境変数: `JENKINS_SMTP_HOST`
*   **mailAddress:** このサーバのメールアドレス
    *   デフォルトは `jenkins@[pocci.domainで指定したドメイン名]`
    *   環境変数: `JENKINS_MAIL_ADDRESS`


slave:
--------
Jenkins スレーブノード定義。

Jenkins マスターが存在しない (pocci.services に `jenkins` を指定していない) 環境で、
Jenkins スレーブノードだけを起動したい場合に使用します。

定義例:

```yaml
slave:
  nodes:
    - java
    - nodejs
```

定義内容は **jenkins:** と同一です。


redmine:
--------
Redmine 関連定義。

定義例:

```yaml
redmine:
  projects:
    -
      projectId: example
      issues:
        - 初期コード登録
  users:
    - uid:          boze
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
            - uid:          boze
              userPassword: password
              ...

        redmine:
          projects:
            ...
        ```

    *   `users:` または `user.users:` で定義したユーザーは、
        `projects:` で定義したプロジェクトの管理者および開発者として設定されます。
*   **lang:** デフォルト設定で利用する言語
*   **url:** Redmine サーバのURL
    *   デフォルトは `http://redmine.[pocci.domainで指定したドメイン名]`
    *   環境変数: `REDMINE_URL`, `REDMINE_PROTOCOL`, `REDMINE_HOST`, `REDMINE_PORT`
*   **smtpDomain:** SMTPドメイン
    *   デフォルトは pocci.domain で指定したドメイン名
    *   環境変数: `REDMINE_SMTP_DOMAIN`
*   **smtpHost:** SMTPサーバホスト名
    *   デフォルトは `smtp.[pocci.domain で指定したドメイン名]`
    *   環境変数: `REDMINE_SMTP_HOST`
*   **smtpPort:** SMTPサーバポート番号
    *   デフォルトは `25`
    *   環境変数: `REDMINE_SMTP_PORT`
*   **mailAddress:** このサーバのメールアドレス
    *   デフォルトは `redmine@[pocci.domainで指定したドメイン名]`
    *   環境変数: `REDMINE_MAIL_ADDRESS`


sonar:
------
SonarQube 関連定義。

*   **url:** SonarQube サーバのURL
    *   デフォルトは `http://sonar.[pocci.domainで指定したドメイン名]`
    *   環境変数: `SONAR_URL`, `SONAR_PROTOCOL`, `SONAR_HOST`, `SONAR_PORT`
*   **dbUser:** SonarQube が内部的に使用するデータベース接続時のユーザー名
    *   デフォルトは `sonarqube`
    *   環境変数: `SONAR_DB_USER`
*   **dbPassword:** SonarQube が内部的に使用するデータベース接続時のパスワード
    *   デフォルトは `sonarqubepass`
    *   環境変数: `SONAR_DB_PASS`

kanban:
------
かんばんボード関連定義。

定義例:

```yaml
kanban:
  - board: example/example-board
    stages:
      - あとで
      - 今週
      - 調査中
      - 対応中
      - リリース待ち
  - board: example/example-java
    stages:
      - TODO
      - 要件定義
      - 実装
      - 受け入れテスト
```

*   **url:** かんばんボードサーバのURL
    *   デフォルトは `http://kanban.[pocci.domainで指定したドメイン名]`
    *   環境変数: `KANBAN_URL`, `KANBAN_PROTOCOL`, `KANBAN_HOST`, `KANBAN_PORT`
*   **board:** 工程を定義するボード
    *   `GitLabグループ名/GitLabプロジェクト名` の形式で指定してください。
*   **stages:** 工程
