コマンドリファレンス
====================

準備・設定
----------
### bin/build (ビルド)
サービス利用環境を作成します。

```bash
bash ./build
```

### bin/create-config (サービスの初期設定)
`config` フォルダに設定ファイルを作成し、サービスを初期設定します。

```bash
./create-config
```

*   **注意：** このコマンドを実行すると、現在利用中のサービスは廃棄され、利用中のデータは消去されます。

引数でサービス構成タイプを指定できます。

```bash
./create-config redmine
```

詳細については、[サービス開始・利用方法](./create-service.ja.md) を参照してください。


起動・停止
----------
### bin/up-service (サービス起動)
サービスおよびJenkins スレーブを起動します。

```bash
./up-service
```


### bin/stop-service (サービス停止)
サービスおよびJenkins スレーブを停止します。

```bash
./stop-service
```

### bin/restart-service (サービス再起動)
サービスおよびJenkins スレーブを再起動します。

```bash
./restart-service
```

### bin/up-jenkins-slave (Jenkinsスレーブ起動)
Jenkins スレーブのみを起動します。

```bash
./up-jenkins-slave
```

### bin/stop-jenkins-slave (Jenkinsスレーブ停止)
Jenkins スレーブのみを停止します。

```bash
./stop-jenkins-slave
```



バックアップ・リストア
----------------------
### bin/backup (バックアップ)
ボリュームデータを backup ディレクトリにバックアップします。

```bash
./backup
```

### bin/restore (リストア)
`bin/backup` でバックアップしたデータをリストアします。

```bash
./restore ../backup/20150821-2339/
```

*   引数でバックアップ先ディレクトリを指定します。
*   **注意：** このコマンドを実行すると、現在利用中のサービスは廃棄され、利用中のデータは消去されます。


ワンオフコマンド実行
--------------------
### bin/oneoff (ワンオフコマンド実行)
任意のイメージから新しく作成したコンテナ上でコマンドを実行します。

例えば、以下のコマンドを実行すると xpfriend/jenkins-slave-nodejs:1.1.1
から作成したコンテナ上で node インタプリタを起動します。

```bash
./oneoff xpfriend/jenkins-slave-nodejs:1.1.1 node
```

作成したコンテナ上で bash を起動する例:

```bash
./oneoff xpfriend/jenkins-slave-nodejs:1.1.1 bash
```

以下のようにイメージ名の一部を指定して起動することもできます。

```bash
./oneoff nodejs bash
```

この場合、現在ホスト上に存在するイメージの中から指定したイメージ名に一致するものを利用して起動します。

*   `oneoff` コマンドを利用すると、コマンド実行時のディレクトリがコンテナ上の `/app` 
    ディレクトリとしてマウントされます。
*   現在起動しているコンテナ上でコマンドを実行するわけではありません。
    (現在起動しているコンテナ上でコマンド実行したい場合は `docker exec` や `psh` を使用してください)



コンテナ利用時のユーティリティコマンド
--------------------------------------
これらのユーティリティコマンドを使用するためには、
事前に `source ./bin/pocci-utils` を実行しておく必要があります。

なお、コンテナがひとつも動作していないときにこれらのコマンドを実行するとエラーになります。

### stats (コンテナ状態確認)
現在動作している全コンテナの CPU使用率やメモリ使用量が確認できます。

状態を継続的に監視したい場合:
```bash
stats
```

1回だけ確認したい場合:
```bash
stats --no-stream
```


### vls (VOLUMEディレクトリ一覧表示)
コンテナのVOLUMEディレクトリ一覧を確認できます。

すべてのVOLUMEを表示する場合:
```bash
vls
```

指定されたコンテナのVOLUMEだけを表示する場合:
```bash
vls dns
```
*   コンテナ名を部分一致検索してヒットしたコンテナのVOLUMEを表示します。

### vcd (VOLUMEデータディレクトリへのcd)
指定したコンテナの指定したVOLUMEに対応するデータディレクトリに cd します。

```bash
vcd nginx conf.d
```

*   コンテナ名およびVOLUME名は部分一致検索で最初にヒットしたものが採用されます。

### psh (コンテナへのログイン)
起動中のコンテナにログインします。

sh でアクセスする場合:
```bash
psh dns
```

bash でアクセスする場合:
```bash
psh dns bash
```

廃棄
----
### bin/destroy-service (サービス廃棄)
現在利用中のサービスおよびサービス設定を廃棄します。

```bash
./destroy-service
```

*   **注意：** このコマンドを実行すると、現在利用中のサービスは廃棄され、利用中のデータは消去されます。
