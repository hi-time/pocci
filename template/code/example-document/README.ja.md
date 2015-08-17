開発環境の利用方法について
==========================

この開発環境を利用するために、最初に以下の設定を行ってください。
1.  hostsファイルの設定
2.  パスワードの変更
3.  利用者情報の修正


### 1. hosts ファイルの設定
開発環境上の各サービスに接続するためには、
ご自身の PC の hosts ファイル (`C:\Windows\System32\drivers\etc\hosts`)
に以下の記述を追加する必要があります。

```
XXX.XXX.XXX.XXX user gitlab jenkins sonar kanban
```

この設定を行うことにより、以下の URL でサービスにアクセスできます。

URL             | サービス                                                | 主な用途
--------------- | ------------------------------------------------------- | ---------------------------------------------
http://user/    | [phpLDAPadmin](http://phpldapadmin.sourceforge.net/)    | パスワード変更
http://gitlab/  | [GitLab](https://gitlab.com/)                           | コードリポジトリ管理 / チケット (Issue) 管理
http://jenkins/ | [Jenkins](https://jenkins-ci.org/)                      | CIジョブ管理
http://sonar/   | [SonarQube](http://www.sonarqube.org/)                  | コード品質分析
http://kanban/  | [GitLab Kanban Board](http://kanban.leanlabs.io/)       | かんばんボード


### 2. パスワードの変更
(あとで書く).

### 3. 利用者情報の修正
(あとで書く).
