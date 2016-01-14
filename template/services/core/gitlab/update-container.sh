echo "Update GitLab Administrator's email address..."
GITLAB_CONTAINER=${POCCI_SERVICE_PREFIX}_gitlab_1

cat << EOF >/tmp/update-admin-mail-address
user = User.find_by(username: 'root')
user.email = "${ADMIN_MAIL_ADDRESS}"
user.skip_reconfirmation!
user.save
EOF

docker cp /tmp/update-admin-mail-address ${GITLAB_CONTAINER}:/tmp
rm /tmp/update-admin-mail-address
${LIB_DIR}/docker-exec ${GITLAB_CONTAINER} \
    sudo -u git -H bundle exec rails console production /tmp/update-admin-mail-address
