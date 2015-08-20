サービス開始・利用方法
======================

サービスの初期設定
------------------
サービス開始する前に、各サービスの初期設定を行う必要があります。

`bin/create-config` コマンドを実行することで、
config ディレクトリに以下のような設定ファイルが作成され、
サービスの初期設定が行われます。

config ディレクトリの内容:
```
pocci/
  - config/
    - nginx/                ... Nginx 設定
    - .env                  ... 環境変数定義
    - althosts              ... ホスト名 (IPアドレス) 定義 (hostsファイル形式)
    - dns.yml               ... DNSコンテナの定義 (Docker Compose形式)
    - docker-compose.yml    ... 各種サービス用コンテナ定義 (Docker Compose形式)
    - jenkins-slaves.yml    ... Jenkins スレーブノード用コンテナ定義 (Docker Compose形式)
```

サービスの初期設定は、次の3種類の方法のいずれかで実行できます。

1.  デフォルトの構成で実行する
2.  サービス構成タイプを指定して実行する
3.  サービス構成をカスタマイズして実行する



### 1. デフォルトの構成で実行する
#### 作成方法
`bin` ディレクトリにある `create-config` スクリプトを実行すると、
デフォルトの構成で初期設定できます。

```bash
cd bin
./create-config
```

*   サービス構成は `create-config` スクリプトを再実行することにより何度でもゼロからやり直すことができます。  
    とりあえず試してみたいときにはこの方法が一番簡単です。
*   設定ファイル作成には少し時間がかかります。  
    特に初回はイメージのダウンロードを行うため、
    ネットワーク環境によっては10分以上かかることもあります。


### 2. サービス構成タイプを指定して実行する

#### サービス構成タイプの指定
`create-config [サービス構成タイプ]` というふうに、
`create-config` に引数を追加することにより、
指定されたタイプの構成で初期設定することができます。

あらかじめ用意されているサービス構成には以下のものがあります。

サービス構成タイプ | 用途・特徴                                                             | 利用可能なサービス
------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------
default            | CI。チケット(Issue)はかんばんとしてタスクボード上で扱うことができる    | GitLab, Jenkins, SonarQube, かんばんボード, ユーザー管理
redmine            | CI。チケット(Issue)はRedmineで扱うことができる                         | GitLab, Jenkins, SonarQube, Redmine, ユーザー管理
kanban             | CIが不要で、コードリポジトリとかんばんボードのみを使いたい場合に利用   | GitLab, かんばんボード, ユーザー管理


#### 実行例
例えば、Redmine を使用したい場合には、以下のように実行します。

```bash
./create-config redmine
```

引数を指定せずに `create-config` を実行した場合、`default` の構成で設定ファイル作成します。



### 3. サービス構成をカスタマイズして実行する

#### セットアップファイルの編集

セットアップファイル (`setup.*.yml`) を作成・編集することで、
サービス構成のカスタマイズや独自構成の定義ができます。

セットアップファイル (`setup.*.yml`) は、
`template` ディレクトリに存在します。

```
template/
  setup.default.yml
  setup.kanban.yml
  setup.redmine.yml
```

これらのファイルをテキストエディタで編集すれば、
サービス構成タイプのカスタマイズを行うことができます。

また、`setup.myservices.yml` というように新しくファイルを作成することも可能です。
この場合、`./create-config myservices` というふうに引数指定すれば、
`create-config` は `setup.myservices.yml` を読み込んで実行します。

セットアップファイルの記述内容に関しては、
[セットアップファイル リファレンス](./setup-yml.ja.md) を参照してください。 



サービスの起動
--------------
### サービスの起動方法
`bin/up-service` コマンドを実行することでサービス起動できます。

```bash
cd bin
./up-service
```


### 起動したサービスへのアクセス方法

起動したCIサービスに接続するマシン（CIサービスのクライアントとなるマシン）の
hosts ファイル (Windowsマシンの場合は `C:\Windows\System32\drivers\etc\hosts`)
に以下のような記述を追加してください。

設定例 (実際のIPアドレスはCIサービスを起動したマシンのものを使用すること) :

```
192.168.1.2 user.pocci.test gitlab.pocci.test jenkins.pocci.test sonar.pocci.test kanban.pocci.test redmine.pocci.test
```


#### URL

URL                             | サービス                                                | 主な用途
------------------------------- | ------------------------------------------------------- | ---------------------------------------------
http://gitlab.pocci.test/       | [GitLab](https://gitlab.com/)                           | コードリポジトリ管理 / チケット (Issue) 管理
http://jenkins.pocci.test/      | [Jenkins](https://jenkins-ci.org/)                      | CIジョブ管理
http://sonar.pocci.test/        | [SonarQube](http://www.sonarqube.org/)                  | コード品質分析
http://user.pocci.test/         | [phpLDAPadmin](http://phpldapadmin.sourceforge.net/)    | サービス利用者の登録
http://kanban.pocci.test/       | [GitLab Kanban Board](http://kanban.leanlabs.io/)       | かんばんボード
http://redmine.pocci.test/ (*)  | [Redmine](http://www.redmine.org/)                      | チケット (Issue) 管理

(*) デフォルトの構成を利用した場合は起動しないためアクセスできません。


#### アカウント

##### 管理者
サービス     | ユーザー名                 | パスワード  | 備考
------------ | -------------------------- | ----------- | ------------------
GitLab       | root                       | 5iveL!fe    | Standard タブから
SonarQube    | admin                      | admin       |
Redmine      | admin                      | admin       |
phpLDAPadmin | cn=admin,dc=example,dc=com | admin       |

*   GitLab は **Standard**タブから Sign in します。


###### 開発者
ユーザー名 | パスワード
---------- | --------
jenkinsci  | password
bouze      | password

*   GitLab は **LDAP**タブから Sign in します。
*   かんばんボードは `with http://gitlab.pocci.test/` をクリックすることで、
    GitLab の OAuth 認証機能を利用してユーザー名、パスワードの入力無しでログインできます。


その他のコマンド
----------------
サービス停止など、その他のコマンドに関しては、
[コマンドリファレンス](./command.ja.md) を参照してください。

