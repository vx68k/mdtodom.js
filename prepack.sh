#!/bin/sh

distdir="`pwd`"/dist

PACKAGE_NAME="${npm_package_name:-mdtodom}"
PACKAGE_VERSION="${npm_package_version:-(unversioned)}"

SCRIPTS="mdtodom.js mdview.js"

rm -rf "$distdir" || exit 1
mkdir -p "$distdir" || exit 1

for file in $SCRIPTS; do
    distfile=${file##*/}
    sed \
        -e "s,[@]PACKAGE_NAME[@],$PACKAGE_NAME,g" \
        -e "s,[@]PACKAGE_VERSION[@],$PACKAGE_VERSION,g" \
        $file > "$distdir"/$distfile || exit 1
    node ./node_modules/terser/bin/uglifyjs \
        "$distdir"/$distfile \
        --module --output "$distdir"/${distfile%.js}.min.js || exit 1
done
