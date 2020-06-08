// prepare.js
// Copyright (C) 2020 Kaz Nishimura
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.
//
// SPDX-License-Identifier: MIT

"use strict";

let {basename} = require("path");
let {argv, exit, env, cwd} = require("process");
let {spawnSync} = require("child_process");
let {mkdirSync, readFileSync, writeFileSync} = require("fs");
let Terser = require("terser");

const PACKAGE_NAME = env["npm_package_name"] || "unknown";
const PACKAGE_VERSION = env["npm_package_version"] || "0.0.0";

/**
 * Options for `terser.minify`.
 */
const MINIFY_OPTIONS = Object.freeze({
    ecma: 6,
    module: true,
});

/**
 * Options for reading and writing files.
 */
const FILE_OPTIONS = Object.freeze({
    encoding: "UTF-8",
});

/**
 * Prepares scripts for deployment.
 *
 * @param {Array<string>} args command-line arguments after the script name
 * @return {Promise<number>} exit status
 */
function main(args)
{
    if (args == null) {
        args = [];
    }

    let outputdir = `${cwd()}/deploy`;

    let result = spawnSync("rm", ["-rf", outputdir], {stdio: "inherit"});
    if (result.status != 0) {
        exit(1);
    }
    mkdirSync(outputdir, {recursive: true});

    for (let script of args) {
        console.log("Processing '%s'", script);

        let content = readFileSync(script, FILE_OPTIONS);
        let filteredContent = content
            .replace(/[@]PACKAGE_NAME[@]/g, PACKAGE_NAME)
            .replace(/[@]PACKAGE_VERSION[@]/g, PACKAGE_VERSION);

        let name = basename(script);
        writeFileSync(`${outputdir}/${name}`, filteredContent, FILE_OPTIONS);

        if (name.endsWith(".js")) {
            let minifiedName = name.replace(/\.js$/, ".min.js");
            let options = Object.assign({}, MINIFY_OPTIONS, {
                sourceMap: {
                    url: `${minifiedName}.map`,
                },
            });
            let minified = Terser.minify({[name]: filteredContent}, options);
            if (minified.error != null) {
                throw minified.error;
            }
            writeFileSync(`${outputdir}/${minifiedName}`, minified.code,
                FILE_OPTIONS);
            if (minified.map != null) {
                writeFileSync(`${outputdir}/${minifiedName}.map`,
                    minified.map, FILE_OPTIONS);
            }
        }
    }

    return new Promise(
        (resolve) => {
            resolve(0);
        });
}

if (require.main === module) {
    main(argv.slice(2))
        .then((status) => {
            exit(status);
        });
}
