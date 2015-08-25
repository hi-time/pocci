Redmine の設定
==============

目次
----
*   [A. プロジェクトの作成](#a-)
*   [B. GitLab との連携](#b-)
*   [C. 情報源](#c-)



A. プロジェクトの作成
---------------------
以下のような操作でプロジェクトを作成できます。

1.  画面右上の ![ログイン](images/redmine-login.png) をクリックし、
    **ログイン:** `admin`、**パスワード:** `admin`
    で **ログイン** をクリックする。

    ![ログイン画面](images/redmine-login-form.png)

2.  画面左上の ![プロジェクト](images/redmine-project-button.png)
    をクリックし、![新しいプロジェクト](images/redmine-new-project-button.png)
    をクリックする。

3.  **名前** にプロジェクト名を入力し、
    ![作成](images/redmine-new-project-create-button.png) をクリックする。
    *   **識別子** にも入力が必要ですが、
        名前を入力すると識別子にも同じものが自動入力されます。

    ![新規プロジェクト作成画面](images/redmine-new-project-form.png)

4.  **メンバー** タブをクリックして、
    **新しいメンバー** をクリックする。

    ![新しいメンバーボタン](images/redmine-new-member-button.png)

5.  作成したプロジェクトを利用するユーザーとそのユーザーに割り当てる
    **ロール** をチェックして、**追加** をクリックする。
    *   Redmine に一度もログインしたことのないユーザーはこの画面に現れないため、
        事前にそのユーザーで一度ログインしておく必要があります。

    ![新しいメンバー画面](images/redmine-new-member-form.png)

6.  **リポジトリ** タブをクリックして、
    **新しいリポジトリ** をクリックする。

    ![新しいリポジトリボタン](images/redmine-new-repository-button.png)

7.  以下のように入力して、**作成** をクリックする。
    *   **バージョン管理システム:** `Git`
    *   **識別子:** 任意の名前
    *   **リポジトリのパス:** `/home/git/data/repositories/GitLabのグループ名/GitLabのプロジェクト名.git`

    ![新しいリポジトリ画面](images/redmine-new-repository-form.png)



B. GitLab との連携
------------------
GitLab 標準の Issue の代わりに Redmine を使用するには、
GitLab で以下のような設定を行います。

1.  グループのオーナー権限を持つユーザーで GitLab にログインする。
2.  設定を行うプロジェクトを開き、画面左側の 
    ![Settings](images/gitlab-settings-button.png) をクリックする。
3.  ![Services](images/gitlab-services-button.png) をクリックする。
4.  一覧の中の ![Redmine](images/gitlab-services-redmine-button.png) をクリックする。
5.  以下の設定を行い、**Save** をクリックする。
    *   **Active** にチェックを入れる。
    *   **Project url** に Redmine プロジェクトのトップページの URL を入力する。
    *   **Issues url** に `Redmine のURL` + `/issues/:id` を入力する。
    *   **New issue url** に `Redmine プロジェクトのトップページの URL` + `/issues/new` を入力する。

    ![Redmineサービス登録](images/gitlab-services-redmine-form.png)


C. 情報源
---------
*   [Redmine](http://www.redmine.org/)
*   [sameersbn/redmine](https://github.com/sameersbn/docker-redmine/)
