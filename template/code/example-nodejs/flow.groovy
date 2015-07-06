node('nodejs') {
  git url: "${env.GITLAB_URL}/example/example-nodejs.git"
  sh 'bash ./build.sh'
  step([$class: 'JUnitResultArchiver', testResults: 'test-results/*.xml'])
}
