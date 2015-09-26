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


ユーティリティコマンド
----------------------
### bin/oneoff (ワンオフコマンド実行)
Jenkinsスレーブコンテナ用イメージから新しく作成したコンテナ上でコマンドを実行します。

例えば、以下のコマンドを実行すると nodejs スレーブ用コンテナ上で node インタプリタを起動します。

```bash
./oneoff nodejs node
```

nodejs コンテナ上で bash を起動する例:

```bash
./oneoff nodejs bash
```

java コンテナ上で bash を起動する例:

```bash
./oneoff java bash
```

java コンテナ上で `java -version` を実行する例:

```bash
./oneoff java java -version
```

*   `oneoff` コマンドを利用すると、コマンド実行時のディレクトリがコンテナ上の `/app` 
    ディレクトリとしてマウントされます。
*   現在起動しているコンテナ上でコマンドを実行するわけではありません。
    (現在起動しているコンテナ上でコマンド実行したい場合は `docker exec` を使用してください)


### bin/stats (コンテナ状態確認)
現在動作している全コンテナの CPU使用率やメモリ使用量が確認できます。

状態を継続的に監視したい場合:
```bash
./stats
```

1回だけ確認したい場合:
```bash
./stats --no-stream
```

なお、コンテナがひとつも動作していないときにこのコマンドを実行するとエラーになります。


廃棄
----
### bin/destroy-service (サービス廃棄)
現在利用中のサービスおよびサービス設定を廃棄します。

```bash
./destroy-service
```

*   **注意：** このコマンドを実行すると、現在利用中のサービスは廃棄され、利用中のデータは消去されます。
