利用者の登録
============

LDAPユーザー登録
----------------
組み込みの利用者管理機能 (user サービス) を利用している場合、
以下の手順で LDAP サーバーに利用者登録を行うことができます。

1.  ブラウザで user サービスのURL（例: http://user.pocci.test/ ）にアクセスし、
    admin 権限でログイン (例: `cn=admin,dc=example,dc=com` / `admin`)する。
2.  画面左側の `dc=xxx,dc=xxx` (例: dc=example,dc=com) の部分をクリックする。
3.  **Create a child entry** (もしくは **Create new entry here**) をクリックする。
4.  **Templates:** で一番先頭の **Courier Mail: Account** を選択する。
5.  以下の情報を入力し、**Create Object** をクリックする。
    *   Given Name :    名
    *   Last name :     姓
    *   Common Name :   ユーザーID
    *   User ID :       ユーザーID (Common Name と同じでよい)
    *   Email :         E-mail アドレス
    *   Password :      初期パスワード
6.  確認画面が表示されるので **Commit** をクリックする。


GitLab への登録
---------------
新規追加したユーザーが GitLab のリポジトリにアクセス（更新）できるようにするためには、
GitLab のグループもしくはプロジェクトにメンバー登録する必要があります。

以下の手順でメンバー登録できます。

1.  新規作成したユーザーで GitLab に一度サインインしておきます。
2.  メンバー登録するグループのオーナー権限を持つユーザー
    (setup.*.yml で登録したユーザーにはオーナー権限が与えられています)
    で GitLab にサインインします。
3.  登録したいグループまたはプロジェクトを開き、画面左の **Members**
    アイコンをクリックします。
4.  **Add members** ボタンをクリックし、**People** で登録したいユーザーを選択し、
    **Group Access** でユーザーに与える権限を選択し、**Add users to group**
    をクリックしてください。
    *   権限については `Read more about role permissions here` のリンクを参考にしてください。

