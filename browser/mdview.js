// mdview.js
// Copyright (C) 2018-2020 Kaz Nishimura
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

/**
 * ECMAScript module of a client-side Markdown viewer.
 *
 * Use this module in a HTML file as follows:
 *
 * ```html
 * <script src="mdview.min.js" type="module" async>
 * </script>
 * ```
 *
 * @module mdview.js
 */

// This file is a module script and shall be in strict mode by default.

import {DOMRenderer} from "./mdtodom.js";

/**
 * Package name.
 *
 * @private
 */
const PACKAGE_NAME = "@PACKAGE_NAME@";

/**
 * Package version.
 *
 * @private
 */
const PACKAGE_VERSION = "@PACKAGE_VERSION@";

/**
 * Module name.
 *
 * @private
 */
const MODULE_NAME = "mdview.js";

/**
 * URL of the 'commonmark.js' script.
 *
 * @private
 */
const COMMONMARK_URL =
    "https://cdnjs.cloudflare.com/ajax/libs/commonmark/0.29.2/commonmark.min.js";


let commonmarkImported = import(COMMONMARK_URL);

/**
 * Loads a Markdown resource into a container element.
 *
 * @param {Element} container a DOM element
 * @param {string} [name] the name of a resource
 * @return {Promise<undefined>} a promise that will be resolved when the
 * resource is loaded and rendered.
 * @private
 */
async function loadPage(container, name)
{
    if (name == null) {
        name = container.dataset.welcomePage;
        if (name == null) {
            name = "welcome.md";
        }
    }

    let response = await fetch(name, {
        mode: "same-origin",
        headers: {
            "Accept": "text/*",
        },
    });

    let text = `# ${response.status} ${response.statusText}\n`;
    if (response.ok) {
        text = await response.text();
    }

    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }

    let parser = new window.commonmark.Parser();
    let renderer = new DOMRenderer(document);
    renderer.render(parser.parse(text), container);
}

/**
 * Runs the rendering task.
 *
 * @param {Event} [event] an optional DOM event
 * @private
 */
function start(/* event */)
{
    commonmarkImported
        .then(() => {
            let containerId = new URL(import.meta.url).hash.substring(1);
            if (containerId == "") {
                containerId = "mdview";
            }

            let container = document.getElementById(containerId);
            if (container != null) {
                let path = null;
                if (location.search.startsWith("?")) {
                    path = location.search.substring(1);
                    if (path.startsWith("view=")) {
                        path = path.substring(5);
                    }
                    if (path.startsWith(".") || path.indexOf("/.") >= 0) {
                        path = null;
                    }
                }

                return loadPage(container, path);
            }
        })
        .catch((reason) => {
            throw new Error(`Failed to load commonmark.js: ${reason}`);
        });
}

console.info("Loaded: %s (%s %s)", MODULE_NAME, PACKAGE_NAME, PACKAGE_VERSION);
if (document.readyState != "loading") {
    // The 'DOMContentLoaded' event has already been fired.
    start();
}
else {
    document.addEventListener("DOMContentLoaded", start);
}
