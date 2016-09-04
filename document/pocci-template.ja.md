テンプレート作成手引き
======================

テンプレートとは
----------------
**テンプレート**とはサービスの初期設定時 (`./create-config` コマンド実行時) 
に利用される一連のファイルを含むディレクトリもしくは git リポジトリです。

### テンプレートの構成
テンプレートは **セットアップファイル**、**サービス定義**、**ソースコード**
の3つで構成されます。

*   **セットアップファイル (setup.*.yml)**  
    セットアップファイル (setup.*.yml) はサービス構成を定義するYAML形式のファイルです。
*   **サービス定義 (services)**  
    サービス定義ディレクトリ (services)
    には各サービスのコンテナ定義 (Docker Compose ファイル) や
    初期化設定を行うスクリプトが格納されています。
*   **ソースコード (code)**  
    code ディレクトリは初期設定時にGitリポジトリに登録しておきたいソースコードを格納しておく場所です。


### デフォルトのテンプレート
**template** ディレクトリがデフォルトのテンプレートです。

デフォルトのテンプレートには以下のようなファイルやディレクトリが含まれています。

*   セットアップファイル (setup.*.yml)
    *   setup.default.yml
    *   setup.jenkins.yml
    *   setup.redmine.yml
*   サービス定義ディレクトリ (services)
    *   バックエンドサービス: dns, fluentd
    *   一般サービス: gitlab, jenkins, nginx, redmine, sonar, user
*   ソースコード (code)
    *   example-java
    *   example-nodejs
    *   users-guide


### 利用者独自のテンプレート
環境変数 **POCCI_TEMPLATE** の指定により、
利用者独自のテンプレートを利用することができます。

テンプレートは絶対パスもしくは git リポジトリのURLで指定できます。

*   **絶対パス指定の例:**
    ```bash
    export POCCI_TEMPLATE=/user_data/mytemplate
    ```

*   **URL指定の例:**
    ```bash
    export POCCI_TEMPLATE=http://example.com/mytemplate.git
    ```

また、空白で区切って複数のテンプレートを指定することができます。

*   **複数指定例:**
    ```bash
    export POCCI_TEMPLATE="template /user_data/mytemplate"
    ```

    このように指定した場合、
    デフォルトのテンプレート (template)
    に定義されたサービスと利用者独自のテンプレート (/user_data/mytemplate)
    に定義されたサービスの両方を使うことができます。



テンプレート内ファイルの作成方法
--------------------------------
### セットアップファイル (setup.*.yml)
セットアップファイルの記述内容に関しては、
[セットアップファイル リファレンス](./setup-yml.ja.md) を参照してください。 


### サービス定義 (services)
サービス定義は `services` ディレクトリの下に以下の構造、ファイル名で格納してください。

```
- services/
  - core/
    - [service name]/
      - js/
          - [service name].js       ... セットアップファイルから環境変数への変換等を行う JavaScript
      - volumes/                    ... config/volumes/[service_name] の内容
      - create-config.sh            ... config ディレクトリの内容を作成するシェルスクリプト
      - docker-compose.yml.template ... config/core-services.yml ファイルを作成するシェルスクリプト
      - fluent.conf.template        ... config/fluent.conf ファイルを作成するシェルスクリプト
      - nginx.conf.template         ... config/nginx/[service_name].conf ファイルを作成するシェルスクリプト
      - update-container.sh         ... 起動したサービスに接続して初期設定を行うシェルスクリプト
```

上記のファイルすべてを作成する必要はありません。
デフォルトのテンプレート (template) や
[サンプルテンプレート](https://github.com/xpfriend/pocci-template-examples)
の実装を参考にして必要なものだけを作成してください。

以下それぞれのファイルについて説明します。

#### js/[service name].js
セットアップファイルから環境変数への変換等を行う JavaScript です。

ファイル名は [サービス名].js としてください。

以下の3つのファンクションを作成できます。
*   **addDefaults:** setup.*.yml ファイルのパラメタ定義とデフォルト値設定を行う。
*   **addEnvironment:** setup.*.yml ファイルに設定された内容を環境変数に設定する。
*   **setup:** 起動したサービスに接続して初期設定を行う。

それぞれのファンクションの実装方法については、
デフォルトのテンプレートやサンプルテンプレートのソースコードを参考にしてください。


#### docker-compose.yml.template
config/core-services.yml ファイルを作成するためのシェルスクリプトです。  
標準出力に Docker Compose 形式の定義を出力してください。


#### fluent.conf.template
config/fluent.conf ファイルを作成するためのシェルスクリプトです。  
標準出力に Fluentd 設定ファイル形式の定義を出力してください。


#### nginx.conf.template
config/nginx.conf ファイルを作成するためのシェルスクリプトです。  
標準出力に Nginx 設定ファイル形式の定義を出力してください。


#### volumes
このディレクトリの内容は `config/volumes/サービス名`
にそのままコピーされます。  
任意の設定ファイルを格納したディレクトリをマウントしたい場面等で利用できます。


#### create-config.sh
config ディレクトリの内容を作成するシェルスクリプトです。  
任意の処理を記述できます。


#### update-container.sh
起動したサービスに接続して初期設定を行うシェルスクリプトです。  
任意の処理を記述できます。



### ソースコード (code)
**code ディレクトリ**は初期設定時にGitリポジトリに登録しておきたいソースコードを格納しておく場所です。

以下のディレクトリ構造で格納してください。

```
- code/
  - グループ名/
    - プロジェクト名/
```

例えば、セットアップファイルで以下のように定義している場合は

```
gitlab:
  groups:
    - groupName: example
      projects:
        - projectName:    example-java
```

以下のディレクトリ構造にしてください。

```
- code/
  - example/
    - example-java/
```

