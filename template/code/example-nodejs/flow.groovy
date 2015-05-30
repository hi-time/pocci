node('nodejs') {
  git url: 'http://server/gitlab/example/example-nodejs.git'
  sh 'bash ./build.sh'
  step([$class: 'JUnitResultArchiver', testResults: 'test-results/*.xml'])
}
