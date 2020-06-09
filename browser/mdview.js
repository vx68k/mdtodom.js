// mdview.js
// Copyright (C) 2018 Kaz Nishimura
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

// This file is a module script and shall be in strict mode by default.

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
    "https://cdnjs.cloudflare.com/ajax/libs/commonmark/0.29.1/commonmark.min.js";

/**
 * Integrity metadata for the 'commonmark.js' script.
 *
 * @private
 */
const COMMONMARK_INTEGRITY = "sha256-cJ/MjQVItrJja/skVD57W8McWNeVq14/h4qOuq++CvI=";

/**
 * Loads a Markdown resource into a container element.
 *
 * @param {Element} container a DOM element
 * @param {string} [name] the name of a resource
 * @return {Promise<undefined>} a promise that will be resolved when the
 * resource is loaded and rendered.
 * @private
 */
function loadPage(container, name)
{
    if (name == null) {
        name = container.dataset.welcomePage;
        if (name == null) {
            name = "welcome.md";
        }
    }

    return fetch(name,
        {
            mode: "same-origin",
            headers: {
                "Accept": "text/*",
            },
        })
        .then((response) => {
            if (response.ok) {
                return response.text();
            }

            return `# ${response.status} ${response.statusText}\n`;
        })
        .then((text) => {
            let parser = new window.commonmark.Parser();
            let tree = parser.parse(text);

            while (container.hasChildNodes()) {
                container.removeChild(container.lastChild);
            }

            let renderer = new DOMRenderer(document);
            renderer.render(tree, container);
        });
}

/**
 * Returns a promise that will be resolved after a duration has elapsed.
 *
 * @param {number} millis a duration to sleep in milliseconds
 * @return {Promise<undefined>} a promise that will be resolved after the
 * specified duration has elapsed
 * @see {@link https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout WindowOrWorkerGlobalScope.setTimeout}
 */
export function sleep(millis)
{
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, millis);
    });
}

/**
 * Waits for a script to be loaded.
 *
 * @param {HTMLScriptElement} script a DOM HTML script element that is listened
 * for a `load` event
 * @param {string} name a property name to check whether the script has
 * been loaded or not
 * @return {Promise<Event>} a promise that will be resolved when the script
 * is loaded
 */
export function waitForScriptLoaded(script, name)
{
    return new Promise((resolve, reject) => {
        if (name in window) {
            resolve();
        }
        else {
            script.addEventListener("load", () => {
                if (name in window) {
                    resolve();
                }

                reject(`'${name}' not set by the script`);
            });
        }
    });
}

/**
 * Gets the `commonmark.js` script loaded.
 *
 * @return {Promise} a promise that will be resolved when the `commonmark.js`
 * script has been loaded
 * @private
 */
function loadCommonMark()
{
    let script = Object.assign(
        document.createElement("script"),
        {
            id: "commonmark",
            src: COMMONMARK_URL,
            async: true,
            defer: true,
            crossOrigin: "anonymous",
            integrity: COMMONMARK_INTEGRITY,
        });
    document.head.appendChild(script);

    return Promise.race([
        sleep(5000).then(() => Promise.reject("Timed out")),
        waitForScriptLoaded(script, "commonmark"),
    ]);
}

/**
 * Runs the rendering task.
 *
 * @param {Event} [event] an optional DOM event
 * @private
 */
function start(/* event */)
{
    loadCommonMark()
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

                loadPage(container, path);
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
