#!/bin/sh

distdir="`pwd`"/dist

PACKAGE_VERSION="${npm_package_version:-(unversioned)}"

rm -rf "$distdir" || exit 1
mkdir -p "$distdir" || exit 1

for file in *.js extras/*.js; do
    sed -e "s/[@]PACKAGE_VERSION[@]/$PACKAGE_VERSION/g" \
        $file > "$distdir"/${file#*/} || exit 1; \
done
