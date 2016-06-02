Pocci
=====

開発環境向けサービスを構成するためのテンプレートシステム。

[English](./README.md)

Pocciとは
---------
Gitリポジトリ管理 (GitLab), CIシステム (Jenkins), チケット管理 (Redmine), 品質分析 (SonarQube)
といったサービスを手軽に構築するための仕組みです。

Pocciの特徴
-----------
### オールインワン
GitLab, Jenkins, Redmine, SonarQube
などの様々なソフトウェアを1台のマシンにセットアップすることができます。

### 統合環境
セットアップされた各ソフトウェアはばらばらに動作するのではなく、
ひとつのシステムとして協調動作します。

![ソフトウェア連携図](./pocci.ja.png)

### 自由にカスタマイズ
サービス構成のカスタマイズには4種類の方法があります。

#### Step 1. サービス構成の選択
標準で3タイプのサービス構成を用意しています。

サービス構成タイプ | コード管理 | CI        | チケット管理           | 品質分析
------------------ | ---------- | --------- | ---------------------- | ---------
**default**        | GitLab     | GitLab CI | GitLab + GitLab Kanban | SonarQube
**jenkins**        | GitLab     | Jenkins   | GitLab + GitLab Kanban | SonarQube
**redmine**        | GitLab     | Jenkins   | Redmine                | SonarQube

[初期セットアップ実行時に好みのタイプを指定するだけ](./document/create-service.ja.md)
で手軽にセットアップ可能です。


#### Step 2. サービス構成の修正
[サービス構成はとてもシンプルなyamlファイルで定義されている](./document/setup-yml.ja.md)ため、
ファイルの書き換えによるカスタマイズが簡単にできます。

例えば「不要なサービスの起動をやめてメモリ消費量を減らしたい」
といったことはとても簡単で、不要なサービス名が書かれている行を削除するだけです。

#### Step 3. テンプレートで追加ソフトウェアを利用
[追加テンプレート](https://github.com/xpfriend/pocci-template-examples/blob/master/README.ja.md)
を利用することにより、
[Nexus](http://www.sonatype.org/nexus/)や[Taiga](https://taiga.io/)
といった標準のサービス構成に含まれていないソフトウェアもセットアップ可能です。

#### Step 4. テンプレートを独自に作成
少し手間がかかりますが、
[独自のテンプレートを作成する](./document/pocci-template.ja.md)ことも可能です。


### 手軽に再セットアップ
一度作成した構成に不満がある場合には、
既存の環境を完全に廃棄して再セットアップを行うことが簡単にできます。  
「別のサービス構成タイプを試してみたい」、「いろいろなテンプレートを試してみたい」
といった場合にも便利です。


Pocci導入方法
-------------
### Pocci-box を利用する場合
[Pocci-box](https://atlas.hashicorp.com/xpfriend/boxes/pocci)は
Pocciを動作させるために必要なOSとソフトウェアを搭載したVMイメージです。

VirtualBox と Vagrant が利用できる環境であれば、
最も簡単に導入可能です。

導入方法の詳細については
[Pocci-boxのREADME](https://github.com/xpfriend/pocci-box/blob/master/README.ja.md)
をご参照ください。


### Pocciをそのまま使う場合
#### 必須環境
*   起動するVMに5GB以上割り当て可能な空きメモリをもつマシン
*   [Docker](https://www.docker.com/)
*   [Docker Compose](https://github.com/docker/compose/)

#### インストール方法
1.  uid=1000 のユーザーに現在のユーザーを変更する。

2.  このリポジトリをクローンする。

    ```bash
    git clone https://github.com/xpfriend/pocci.git pocci
    cd pocci
    ```

3.  ビルドを行う。

    ```bash
    cd bin
    ./build
    ```


利用方法
--------
利用方法に関しては、[サービス開始・利用方法](./document/create-service.ja.md)
を参照してください。
