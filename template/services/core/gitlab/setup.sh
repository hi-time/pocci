echo "Update GitLab user's avatar..."
GITLAB_CONTAINER=${POCCI_SERVICE_PREFIX}_gitlab_1
AVATAR_DIR=${TEMP_CONFIG_DIR}/avatar

${LIB_DIR}/docker-exec ${GITLAB_CONTAINER} \
    bash -c "if [ ! -d /tmp/avatar ]; then mkdir /tmp/avatar && chown git:git /tmp/avatar; fi"


cat << EOF >/tmp/update-avatar
Dir.glob('/tmp/avatar/*') do |name|
  uid = File.basename(name, ".*")
  pp uid
  File.open(name) do |f|
    user = User.find_by(username: uid)
    user.avatar = f
    user.save!
  end
end
EOF

docker cp /tmp/update-avatar ${GITLAB_CONTAINER}:/tmp
rm /tmp/update-avatar

for i in `ls ${AVATAR_DIR}`; do
    FILE_NAME="$(basename "$i")"
    FILE_PATH="${AVATAR_DIR}/${FILE_NAME}"

    docker cp ${FILE_PATH} "${GITLAB_CONTAINER}:/tmp/avatar/${FILE_NAME}"
    ${LIB_DIR}/docker-exec ${GITLAB_CONTAINER} chown git:git "/tmp/avatar/${FILE_NAME}"
done

${LIB_DIR}/docker-exec ${GITLAB_CONTAINER} \
    sudo -u git -H bundle exec rails console production /tmp/update-avatar
