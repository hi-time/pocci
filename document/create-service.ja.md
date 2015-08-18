サービス開始・利用方法
======================

1. デフォルトの構成でサービス開始する
-------------------------------------
### 起動方法
`bin` ディレクトリにある `create-service` スクリプトを実行すると、
デフォルトの構成でサービス起動できます。

```bash
cd bin
./create-service
```

*   サービス構成は `create-service` スクリプトを再実行することにより何度でもゼロからやり直すことができます。  
    とりあえず試してみたいときにはこの方法が一番簡単です。
*   起動には少し時間がかかります。  
    特に初回はイメージのダウンロードを行うため、
    ネットワーク環境によっては10分以上かかることもあります。


### 起動したサービスへのアクセス方法

起動したCIサービスに接続するマシン（CIサービスのクライアントとなるマシン）の
hosts ファイル (Windowsマシンの場合は `C:\Windows\System32\drivers\etc\hosts`)
に以下のような記述を追加してください。

設定例 (実際のIPアドレスはCIサービスを起動したマシンのものを使用すること) :

```
192.168.1.2 user.pocci.test gitlab.pocci.test jenkins.pocci.test sonar.pocci.test kanban.pocci.test redmine.pocci.test
```

あるいは

```
192.168.1.2 user gitlab jenkins sonar kanban redmine
```

というふうにドメイン名を省略してもOKです
(プロキシサーバを利用している環境の場合は、こっちのほうがうまくつながるかもしれません)。


#### URL

URL                                                | サービス                                                | 主な用途
-------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------
http://gitlab.pocci.test/ (http://gitlab/)         | [GitLab](https://gitlab.com/)                           | コードリポジトリ管理 / チケット (Issue) 管理
http://jenkins.pocci.test/ (http://jenkins/)       | [Jenkins](https://jenkins-ci.org/)                      | CIジョブ管理
http://sonar.pocci.test/ (http://sonar/)           | [SonarQube](http://www.sonarqube.org/)                  | コード品質分析
http://user.pocci.test/ (http://user/)             | [phpLDAPadmin](http://phpldapadmin.sourceforge.net/)    | サービス利用者の登録
http://kanban.pocci.test/ (http://kanban/)         | [GitLab Kanban Board](http://kanban.leanlabs.io/)       | かんばんボード
http://redmine.pocci.test/ (http://redmine/) (*)   | [Redmine](http://www.redmine.org/)                      | チケット (Issue) 管理

(*) デフォルトの構成を利用した場合は起動しないためアクセスできません。


#### アカウント

##### 管理者
サービス     | ユーザー名                 | パスワード  | 備考
------------ | -------------------------- | ----------- | ------------------
GitLab       | root                       | 5iveL!fe    | Standard タブから
SonarQube    | admin                      | admin       |
Redmine      | admin                      | admin       |
phpLDAPadmin | cn=admin,dc=example,dc=com | admin       |

###### 開発者
ユーザー名 | パスワード
---------- | --------
jenkinsci  | password
bouze      | password

*   GitLab は **LDAP**タブから Sign in します。
*   かんばんボードは `with http://gitlab.pocci.test/` をクリックすることで、
    GitLab の OAuth 認証機能を利用し



2. サービス構成タイプを指定して起動する
---------------------------------------
### サービス構成タイプの指定
`create-service [サービス構成タイプ]` というふうに、
`create-service` に引数を追加することにより、
指定されたタイプのサービス構成で起動することができます。

あらかじめ用意されているサービス構成には以下のものがあります。

サービス構成タイプ | 用途・特徴                                                             | 利用可能なサービス
------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------
default            | CI。チケット(Issue)はかんばんとしてタスクボード上で扱うことができる    | GitLab, Jenkins, SonarQube, かんばんボード, ユーザー管理
redmine            | CI。チケット(Issue)はRedmineで扱うことができる                         | GitLab, Jenkins, SonarQube, Redmine, ユーザー管理
kanban             | CIが不要で、コードリポジトリとかんばんボードのみを使いたい場合に利用   | GitLab, かんばんボード, ユーザー管理


### 起動例
例えば、Redmine を使用したい場合には、以下のように実行します。

```bash
./create-service redmine
```

引数を指定せずに `create-service` を実行した場合、`default` の構成で起動します。



3. 独自のサービス構成で起動する
-------------------------------
### セットアップファイル

セットアップファイル (`setup.*.yml`) を作成・編集することで、
サービス構成のカスタマイズや独自構成の定義ができます。

セットアップファイル (`setup.*.yml`) は、
`config` ディレクトリに存在します。

```
config/
  setup.default.yml
  setup.kanban.yml
  setup.redmine.yml
```

これらのファイルをテキストエディタで編集すれば、
サービス構成タイプのカスタマイズを行うことができます。

また、`setup.myservices.yml` というように新しくファイルを作成することも可能です。
この場合、`./create-service myservices` というふうに引数指定すれば、
`create-service` は `setup.myservices.yml` を読み込んで実行します。

セットアップファイルの記述内容に関しては、
[セットアップファイル リファレンス](./setup-yml.ja.md) を参照してください。 
