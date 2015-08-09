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

    Redmine を使用する場合は、以下のようにする。

    ```bash
    ./create-service redmine
    ```

6.  CIサービスに接続するマシンの hosts ファイルを設定する。  
    設定例 (IPアドレスは利用環境に合わせて修正してください) :

    ```
    192.168.1.2 portal.pocci.test user.pocci.test gitlab.pocci.test jenkins.pocci.test sonar.pocci.test kanban.pocci.test redmine.pocci.test
    ```

    あるいは

    ```
    192.168.1.2 portal user gitlab jenkins sonar kanban redmine
    ```


URL
---
サービス                                                | URL
------------------------------------------------------- | ----------------------------------------------
[GitLab](https://gitlab.com/)                           | http://gitlab.pocci.test/ (http://gitlab/)
[Jenkins](https://jenkins-ci.org/)                      | http://jenkins.pocci.test/ (http://jenkins/)
[SonarQube](http://www.sonarqube.org/)                  | http://sonar.pocci.test/ (http://sonar/)
[phpLDAPadmin](http://phpldapadmin.sourceforge.net/)    | http://user.pocci.test/ (http://user/)
[GitLab Kanban Board](http://kanban.leanlabs.io/)       | http://kanban.pocci.test/ (http://kanban/)
[Redmine](http://www.redmine.org/) (*)                  | http://redmine.pocci.test/ (http://redmine/)

(*) create-service で redmine を指定した場合。


利用者
------
### 管理者
サービス     | ユーザー名                 | パスワード
------------ | -------------------------- | --------
GitLab       | root                       | 5iveL!fe
SonarQube    | admin                      | admin
Redmine      | admin                      | admin
phpLDAPadmin | cn=admin,dc=example,dc=com | admin

### 開発者
ユーザー名 | パスワード
---------- | --------
jenkinsci  | password
bouze      | password
