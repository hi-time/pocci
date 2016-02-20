httpsアクセスの方法
===================

設定方法
--------
セットアップファイルの **pocci.https** で `true` を指定した場合、
Pocci サービス (厳密にいうと Pocci サービス内の Nginx リバースプロキシ) は
https 接続が可能な状態に構成されます。

また、この設定を行った場合、
Dockerコンテナ以外のネットワークにあるマシンからの http 接続はすべて
https URL にリダイレクトされます。


https接続の方法
---------------
### ブラウザからの接続
いきなり GitLab 等に接続しようとすると証明書エラーが発生します。

最初に **http://cert.pocci.test/** にアクセスし、
ルート証明書 (Root Certificate)をダウンロードし、
「信頼されたルート証明機関」にインポートしてください。


### Git接続
ルート証明書 (Root Certificate)を登録するか、
以下のように証明書のエラーを無視する設定を行ってください。

**設定例:**
```bash
# git clone の際の証明書エラーを無視する
git -c http.sslVerify=false clone http://gitlab.pocci.test/example/example-nodejs.git

# example-nodejs で行う git 操作の証明書エラーをすべて無視する
cd example-nodejs
git config http.sslVerify false
```


証明書の格納場所
----------------
証明書は初期セットアップ時に以下の場所に作成されます。
```
- config/nginx/ssl/public/
  - cacerts/
    - pocci-root-ca.crt     ... ルート証明書 (Root Certificate)
  - server.crt              ... サーバ証明書 (Server Certificate)
  - server.csr              ... サーバCSR (Server CSR)
  - index.html              ... 証明書ダウンロードページ用HTMLファイル
```

証明書のサブジェクトは **pocci.certificate.subject** により変更することも可能ですが、
特に必要がなければ変更せずに利用可能です。
