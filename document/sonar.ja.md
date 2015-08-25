SonarQube 設定
==============

目次
----
*   [A. プログラムの分析方法](#a-)
*   [B. 情報源](#b-)


A. プログラムの分析方法
-----------------------
Pocci に標準で組み込まれている Jenkins ノード (**java**, **nodejs** など) には、
SonarQube でプログラム分析を行うために必要な情報が環境変数として組み込まれています。
これを利用して SonarQube との接続設定を行うことができます。

環境変数の例:
*   **SONAR_URL:** SonarQube の URL
*   **SONAR_DB_HOST:** SonarQube データベースのホスト名
*   **SONAR_DB_PORT:** SonarQube データベースのポート番号

その他利用可能な環境変数に関しては、
[セットアップファイルリファレンスの sonar: の項](./setup-yml.ja.md#sonar-)
を参照してください

### Java プログラムの設定例
`pom.xml` に以下のような設定を行って
**SonarQube Maven Plugin** を利用する (`mvn sonar:sonar` を実行する) ことで、
Java プログラムを分析できます。

```xml
<properties>
    <sonar.jdbc.url>jdbc:postgresql://${env.SONAR_DB_HOST}:${env.SONAR_DB_PORT}/${env.SONAR_DB_NAME}</sonar.jdbc.url>
    <sonar.jdbc.username>${env.SONAR_DB_USER}</sonar.jdbc.username>
    <sonar.jdbc.password>${env.SONAR_DB_PASS}</sonar.jdbc.password>
    <sonar.host.url>${env.SONAR_URL}</sonar.host.url>
</properties>
```

*   設定全体については
    `template/code/example/example-java` の `pom.xml` および `build.sh`
    を参照してください。


### JavaScript プログラムの設定例
**grunt-sonar-runner** を利用して、`Gruntfile.js` に以下のような設定を行うことで、
JavaScript プログラムの分析ができます。

```javascript
sonarRunner: {
  analysis: {
    options: {
      sonar: {
        host: {
          url: process.env.SONAR_URL
        },
        jdbc: {
          url: 'jdbc:postgresql://' + process.env.SONAR_DB_HOST + ':' + process.env.SONAR_DB_PORT + '/' + process.env.SONAR_DB_NAME,
          username: process.env.SONAR_DB_USER,
          password: process.env.SONAR_DB_PASS
        },
        ...
      }
    }
  }
}
```

*   設定全体については
    `template/code/example/example-nodejs` の `Gruntfile.js` および `karma.conf.js`
    を参照してください。


B. 情報源
---------
*   [SonarQube](http://www.sonarqube.org/)
*   [SonarQube - Analyzing with Maven](http://docs.sonarqube.org/display/SONAR/Analyzing+with+Maven)
*   [SonarQube Mave Plugin](http://www.mojohaus.org/sonar-maven-plugin/)
*   [grunt-sonar-runner](https://www.npmjs.com/package/grunt-sonar-runner)
