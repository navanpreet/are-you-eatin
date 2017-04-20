#!/bin/bash

# this file and helpers go in a folder called "package" in the root of your
# node application

# general configuration
PACKAGE_NAME=${PACKAGE_NAME:-} # package name
VERSION=${VERSION:-1} # take from command line
ENTRY=${ENTRY:-}

DEPLOY_PATH=${DEPLOY_PATH:-/opt/${PACKAGE_NAME}}

# everything else, shouldn't have to edit much below here

# Require package name
if [ -z "${PACKAGE_NAME}" ]; then
    echo "No package name given."
    echo "Usage: $0 PACKAGE_NAME VERSION [ENTRY]"
    exit 1
fi

# root package directory
tmp_dir="$(mktemp -d -t "${PACKAGE_NAME}.XXXXXX")" \
    || ( echo "Failed to make temporary folder" ; false ) || exit 1
build_dir="${tmp_dir}/build"
extra_dir="${tmp_dir}/extra"

mkdir -p "${build_dir}"
mkdir -p "${extra_dir}"

# cleanup files on exit or kill
cleanup() {
    echo "Cleaning up..."
    rm -frv "${tmp_dir}"
}
trap cleanup SIGINT SIGTERM EXIT

# dependent paths inside package directory
package_dir="${build_dir}/opt/${PACKAGE_NAME}"

# transformed files
postinstall="${extra_dir}/postinstall.sh"
preremove="${extra_dir}/preremove.sh"
systemd_package_script="${build_dir}/lib/systemd/system/${PACKAGE_NAME}.service"
systemd_package_dir="${systemd_package_script}.d"

# setup package directories
mkdir -p "${package_dir}"

# transforms an include file
transform() {
    sed -e 's|%PACKAGE_NAME%|'"${PACKAGE_NAME}"'|g' \
        -e 's|%ENTRY%|'"${ENTRY}"'|g' \
        "$1" > "$2"
}

if [ ! -z "${ENTRY}" ]; then
    # transform dependent files
    mkdir -pv "$(dirname "${systemd_package_script}")"
    transform "package/app.service.in" "${systemd_package_script}"
fi

transform "package/postinstall.sh.in" "${postinstall}"
transform "package/preremove.sh.in" "${preremove}"

# set pre/post scripts executable
chmod a+x "${postinstall}" "${preremove}"

# copy package files into place
rsync -rv \
    --exclude .git \
    --exclude .gitignore \
    --exclude package \
    --filter "dir-merge,- .gitignore" \
    . \
    "${package_dir}"

if [ ! -z "${ENTRY}" -a -f package/environment.conf ]; then
    mkdir -pv "${systemd_package_dir}"
    cp -v package/environment.conf "${systemd_package_dir}"
    chmod 0600 "${systemd_package_dir}/environment.conf"
fi

# install npm dependencies inside package directory
( cd "${package_dir}" && npm install )

# finally, build the package
fpm \
    --force \
    -s dir \
    -t deb \
    --architecture all \
    --version "${VERSION}" \
    --iteration 1 \
    --name "hart-${PACKAGE_NAME}" \
    --after-install "${postinstall}" \
    --before-remove "${preremove}" \
    --pleaserun-name "${PACKAGE_NAME}.service" \
    --depends nodejs \
    -C "${build_dir}" \
    .

