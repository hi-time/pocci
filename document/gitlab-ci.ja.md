GitLab CIの利用方法
===================

.gitlab-ci.ymlの作成
--------------------
GitLab で 自動ビルドジョブ実行を行うためには、
GitLab に登録したプロジェクト (リポジトリ) に
**.gitlab-ci.yml** という名前の設定ファイルを作成する必要があります。

**.gitlab-ci.yml の例:** 

```yaml
build_job:
  image: xpfriend/workspace-java:3.23.0
  script: bash ./build.sh
  tags:
    - docker
```

*   **build_job:** 任意のビルドジョブ名
*   **image:** ビルド時に使用する Docker イメージ (ビルドは Docker コンテナ上で実行されます)
*   **script:** 実行するスクリプト

記述方法の詳細については、
[Quick Start - Creating a .gitlab-ci.yml file](http://docs.gitlab.com/ce/ci/quick_start/README.html#creating-a-.gitlab-ci.yml-file),
[Configuration of your builds with .gitlab-ci.yml](http://docs.gitlab.com/ce/ci/yaml/README.html), 
[Docker integration](http://docs.gitlab.com/ce/ci/docker/README.html)
を参照してください。
