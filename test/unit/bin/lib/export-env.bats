#!/usr/bin/env bats

setup() {
  set -e

  TEST_ENV=/tmp/export-env-test.env
  TEST_SH=/tmp/export-env-test.sh
  echo 'TEST1=aaa' > ${TEST_ENV}
  echo $'\r' >> ${TEST_ENV}
  echo 'TEST2=bbb' >> ${TEST_ENV}
  echo 'echo ${TEST1}' > ${TEST_SH}
  echo 'echo ${TEST2}' >> ${TEST_SH}
  chmod +x ${TEST_SH}
}

teardown() {
  rm ${TEST_ENV}
  rm ${TEST_SH}
}

@test "backup IFS" {
  # setup
  IFS_ORG=${IFS}

  # when
  source ${SUT_BIN}/lib/export-env ${TEST_ENV}

  # then
  [ "${IFS}" = "${IFS_ORG}" ]
}

@test "exported env values" {
  # when
  source ${SUT_BIN}/lib/export-env ${TEST_ENV}

  # then
  result=$(${TEST_SH} | head -1)
  [ "$result" = "aaa" ]
  result=$(${TEST_SH} | tail -1)
  [ "$result" = "bbb" ]
}
