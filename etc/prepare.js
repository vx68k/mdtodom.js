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

const PACKAGE_NAME = env["npm_package_name"] || "redirect.js";
const PACKAGE_VERSION = env["npm_package_version"] || "(unversioned)";

/**
 * Options for `terser.minify`.
 */
const MINIFY_OPTIONS = {
    ecma: 6,
    module: true,
};

/**
 * Prepares scripts for deployment.
 *
 * @param {Array<string>} args command-line arguments after the script name
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

        let content = readFileSync(script, {encoding: "UTF-8"});
        let output = content
            .replace(/[@]PACKAGE_NAME[@]/g, PACKAGE_NAME)
            .replace(/[@]PACKAGE_VERSION[@]/g, PACKAGE_VERSION);
        writeFileSync(`${outputdir}/${basename(script)}`,
            output, {encoding: "UTF-8"});

        if (script.endsWith(".js")) {
            let result = Terser.minify(output, MINIFY_OPTIONS);
            if (result.error != null) {
                throw result.error;
            }
            writeFileSync(`${outputdir}/${basename(script, ".js")}.min.js`,
                result.code, {encoding: "UTF-8"});
        }
    }
}

if (require.main === module) {
    exit(main(argv.slice(2)))
}
