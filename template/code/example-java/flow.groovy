node('java') {
  git url: "${env.GITLAB_URL}/example/example-java.git"
  sh 'bash ./build.sh'
  step([$class: 'JUnitResultArchiver', testResults: 'target/surefire-reports/*.xml'])
}
