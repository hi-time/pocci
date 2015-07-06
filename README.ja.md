Pocci
=====

Docker コンテナを使った CIサービス構築の試作。

![Services](./pocci-service.png)

[English](./README.md)

必須ソフトウェア
----------------
*   [Docker](https://www.docker.com/)
*   [Docker Compose](https://github.com/docker/compose/)

利用法
------
1.  uid=1000 のユーザーに現在のユーザーを変更する。

2.  このリポジトリをクローンする。

    ```bash
    git clone https://github.com/xpfriend/pocci.git pocci
    cd pocci
    ```

3.  ビルドを行う。

    ```bash
    cd bin
    bash ./build
    ```

4.  `config` ディレクトリに作成されたファイルを確認し、必要に応じて編集する。

    ```
    config/
      - code/               ... サンプルコード
      - services/           ... サービス定義
        - nginx/            ... Nginx リバースプロキシ設定
      - setup.yml           ... ユーザー設定
    ```

5.  `create-service` を実行してサービスの作成と開始を行う。

    ```bash
    ./create-service
    ```

6.  hosts ファイルを設定する。  
    設定例:

    ```
    192.168.1.2 portal.pocci.test user.pocci.test gitlab.pocci.test jenkins.pocci.test sonar.pocci.test
    ```

7.  以下の URL にアクセスしてサービスを利用する。

    *   http://gitlab.pocci.test ... GitLab
    *   http://jenkins.pocci.test ... Jenkins
    *   http://sonar.pocci.test ... SonarQube
    *   http://user.pocci.test ... phpLDAPadmin


利用者
------
### 管理者
サービス     | ユーザー名                 | パスワード
------------ | -------------------------- | --------
GitLab       | root                       | 5iveL!fe
SonarQube    | admin                      | admin
phpLDAPadmin | cn=admin,dc=example,dc=com | admin

### 開発者
ユーザー名 | パスワード
---------- | --------
jenkinsci  | password
bouze      | password
