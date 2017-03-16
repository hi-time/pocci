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

その他利用可能な環境変数に関しては、
[セットアップファイルリファレンスの sonar: の項](./setup-yml.ja.md#sonar-)
を参照してください

### Java プログラムの設定例
`pom.xml` に以下のような設定を行って
**SonarQube Maven Plugin** を利用する (`mvn sonar:sonar` を実行する) ことで、
Java プログラムを分析できます。

```xml
<properties>
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
*   [SonarQube - Analyzing with SonarQube Scanner for Maven](http://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner+for+Maven)
*   [grunt-sonar-runner](https://www.npmjs.com/package/grunt-sonar-runner)
