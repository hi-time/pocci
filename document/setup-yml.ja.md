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
    - TZ=Asia/Tokyo

ldap:
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



セットアップファイルでは、以下のような情報の登録が行えます。

セクション  | 役割                          | 定義(登録)できるもの
----------- | ----------------------------- | ----------- 
pocci       | サービス構成全般に関する登録  | サービスのドメイン名、利用するサービス
ldap        | LDAP 関連登録                 | サービス利用者のアカウント
gitlab      | GitLab 関連登録               | グループ、プロジェクト (リポジトリ)、チケット (Issue)
jenkins     | Jenkins 関連登録              | ビルドジョブ、スレーブノード
redmine     | Redmine 関連登録設定          | プロジェクト、チケット




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
    - TZ=Asia/Tokyo
```

*   **domain:**  
    サービスのドメイン名。  
    例えば、`domain : pocci.example.com` とすれば、
    `http://gitlab.pocci.example.com` や `http://jenkins.pocci.example.com`
    というURLでサービスが利用できます。  
    デフォルトは `pocci.test`。
*   **services:**  
    利用するサービス。  
    gitlab, jenkins, sonar, user, kanban, redmine
    の中から利用したいものを選んでください。
    *   注意: redmine と kanban は併用できません。
    *   IPアドレスを使って接続する場合（例：`http://192.168.0.2`）、
        ここで先頭に指定したサービスに接続されます。
*   **environment:**  
    サービスコンテナに設定する環境変数。


ldap:
-----
サービス運用開始に最低限必要なユーザーの登録を行います。

定義例:

```yaml
ldap:
  users:
    - uid:          bouze
      givenName:    太郎
      sn:           坊主
      mail:         bouze@example.com
      userPassword: password
```

外部のLDAPサーバを利用する（pocciのLDAP機能やユーザー登録機能は使用しない）
場合は以下のように定義します。

```yaml
services:
  - gitlab
  - jenkins
  - sonar
  - redmine
ldap:
  host: ldap.example.com
  readOnly: true
  users:
    - uid:          bouze
      givenName:    太郎
      sn:           坊主
      mail:         bouze@example.com
      userPassword: password
```

*   **services** に `user` を追加しない。
*   **host** に外部の LDAP サーバアドレスを記述する。
*   **readOnly** に true を設定する


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
```

*   **topPage:** ... ホスト名のみを指定した時に表示されるページ。デフォルトはログインページ
*   **groups:** ... 登録するグループの情報
    *   **groupName:** ... グループ名
*   **projects:** ... 登録するプロジェクトの情報
    *   **projectName:** ... プロジェクト名
    *   **commitMessage:**  
        *   初期登録用のソースコードをリポジトリに登録する際のコミットメッセージ。
        *   `template/code/グループ名/プロジェクト名` (上の設定例の場合は `template/code/example/example-java`)
            ディレクトリが存在すれば、その中に格納されているファイルがリポジトリへ登録されます。
        *   Jenkins を利用している場合、上のディレクトリ内に `jenkins-config.xml` が存在すれば、Jenkins へのジョブ登録が行われます。
    *   **issues:**  
        チケット。  
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


注意点:
*   **ldap** で定義したユーザーは、ここで定義したグループの Owner として設定されます。
*   Redmine を使用する場合、issues の定義はできません(**gitlab**ではなく**redmine**の方に定義する)。


jenkins:
--------
Jenkins 関連の情報登録を行います。

定義例:

```yaml
jenkins:
  nodes:
    - java
    - nodejs
```

*   **nodes:**  
    ビルド実行時に利用できるJenkinsスレーブノードの種類。
    `java`, `nodejs`, `iojs` が指定できます。




redmine:
--------
Redmine 関連の情報登録を行います。

定義例:

```yaml
redmine:
  lang: ja
  projects:
    -
      projectId: example
      issues:
        - 初期コード登録
```

*   **lang:** ... デフォルト設定で利用する言語
*   **projects:** ... プロジェクト情報
    *   **projectId:** ... プロジェクト名
    *   **issues:**  
        チケット。  
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

