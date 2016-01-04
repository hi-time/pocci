GitLab CIの利用方法
===================

目次
----
*   [A. .gitlab-ci.ymlの作成](#a-)
*   [B. ランナーの作成](#b-)
*   [C. 情報源](#c-)


A. .gitlab-ci.ymlの作成
-----------------------
GitLab で 自動ビルドジョブ実行を行うためには、
GitLab に登録したプロジェクト (リポジトリ) に
**.gitlab-ci.yml** という名前の設定ファイルを作成する必要があります。

**.gitlab-ci.yml の例:** 

```yaml
build_job:
  script: bash ./build.sh
  tags:
    - java
```

*   **build_job:** 任意のビルドジョブ名
*   **script:** 実行するスクリプト
*   **tags:**  
    ビルド実行に利用するランナーにつけられたタグ。  
    デフォルト構成 (setup.default.yml) でセットアップした場合、`java` もしくは `nodejs`
    が利用可能です。

記述方法の詳細については、
[Quick Start - Creating a .gitlab-ci.yml file](http://doc.gitlab.com/ce/ci/quick_start/README.html#creating-a-.gitlab-ci.yml-file) および
[Configuration of your builds with .gitlab-ci.yml](http://doc.gitlab.com/ce/ci/yaml/README.html)
を参照してください。


B. ランナーの作成
-----------------
ビルドジョブはランナー上で実行されます。
そのため、ビルドジョブ実行の前にあらかじめランナーを作成しておく必要があります。

デフォルトの構成 (setup.default.yml) では、
`java` および `nodejs` という名前の (タグ付けがされた) ランナーが作成されています。

ランナーは `setup.*.yml` ファイルで **runners:** 指定することで自動作成できますが、
後から手動で作成することも可能です。

手動でのランナー作成方法については、
[Quick Start - Configuring a Runner](http://doc.gitlab.com/ce/ci/quick_start/README.html#configuring-a-runner)を参照してください。


C. 情報源
---------
*   [GitLab CI - Quick Start](http://doc.gitlab.com/ce/ci/quick_start/README.html)
*   [Configuration of your builds with .gitlab-ci.yml](http://doc.gitlab.com/ce/ci/yaml/README.html)
