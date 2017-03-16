SonarQube Setup
===============

Contents
--------
*   [A. Program Analysis Method](#a-)
*   [B. See Also](#b-)


A. Program Analysis Method
--------------------------
The Jenkins nodes (**java**, **nodejs**, etc.) included as standard in Pocci
incorporate the information necessary for program analysis in SonarQube as environmental variables.
They can be used to configure the settings for connecting with SonarQube.

Environment variable example:
*   **SONAR_URL:** URL of SonarQube

For details on other environment variables that can be used,
refer to [sonar: section of Setup File Reference]  (./setup-yml.en.md#sonar-).


### Java program setting example
A Java program can be analyzed by configuring the settings
for `pom.xml` as shown below and then using
**SonarQube Maven Plugin** (executing `mvn sonar:sonar`).

```xml
<properties>
    <sonar.host.url>${env.SONAR_URL}</sonar.host.url>
</properties>
```

* For the overall settings, refer to
    `pom.xml` and `build.sh` of
    `template/code/example/example-java`.


### JavaScript program setting example
A JavaScript program can be analyzed by configuring
the settings for `Gruntfile.js` as shown below using **grunt-sonar-runner**.

```javascript
sonarRunner:  {
  analysis:  {
    options:  {
      sonar:  {
        host:  {
          url:  process.env.SONAR_URL
        },
        ...
      }
    }
  }
}
```

* For the overall settings, refer to
    refer to `Gruntfile.js` and `karma.conf.js` of
    `template/code/example/example-nodejs`.


B. See Also
-----------
*   [SonarQube](http://www.sonarqube.org/)
*   [SonarQube - Analyzing with SonarQube Scanner for Maven](http://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner+for+Maven)
*   [grunt-sonar-runner](https://www.npmjs.com/package/grunt-sonar-runner)
