#!/bin/sh

distdir="`pwd`"/dist

rm -rf "$distdir" || exit 1
mkdir -p "$distdir" || exit 1

for file in *.js extras/*.js; do
    sed -e "s/[@]PACKAGE_VERSION[@]/$npm_package_version/g" \
        $file > "$distdir"/${file#*/} || exit 1; \
done
