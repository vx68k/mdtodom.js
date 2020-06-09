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

// This file is a module script.

/**
 * Client-side Markdown viewer.
 *
 * @module mdview.js
 */

import { DOMRenderer } from "./mdtodom.js";

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
 */
const COMMONMARK_URL =
    "https://cdnjs.cloudflare.com/ajax/libs/commonmark/0.29.1/commonmark.min.js";

/**
 * Integrity metadata for the 'commonmark.js' script.
 */
const COMMONMARK_INTEGRITY = "sha256-cJ/MjQVItrJja/skVD57W8McWNeVq14/h4qOuq++CvI=";

function loadPage(container, path) {
    // Measuring timings.
    if ("gtag" in self && "performance" in self) {
        gtag("event", "timing_complete", {
            "name": "mdview_begin",
            "value": Math.floor(performance.now()),
        });
    }

    if (path == null) {
        path = container.dataset.welcomePage;
        if (path == null) {
            path = "welcome.md";
        }
    }

    return fetch(path, {
        mode: "same-origin",
        headers: {
            "Accept": "text/*",
        },
    }).then((response) => {
        if (response.ok) {
            return response.text();
        }
        return "# " + response.status + " " + response.statusText + "\n";
    }).then((text) => {
        let parser = new commonmark.Parser();
        let tree = parser.parse(text);

        while (container.hasChildNodes()) {
            container.removeChild(container.lastChild);
        }

        let renderer = new DOMRenderer(document);
        renderer.render(tree, container);

        // Measuring timings.
        if ("gtag" in self && "performance" in self) {
            gtag("event", "timing_complete", {
                "name": "mdview_end",
                "value": Math.floor(performance.now()),
            });
        }
    }).catch((reason) => {
        throw new Error(reason);
    });
}

/**
 * Wait for a script to be loaded.
 *
 * @param {string} propertyName property name to check whether the script has
 * been loaded or not
 * @param {Node} node a DOM node to listen a "load" event
 */
function waitForScriptLoaded(propertyName, node)
{
    return new Promise((resolve) => {
        if (propertyName in self) {
            resolve();
        }
        else {
            node.addEventListener("load", function () {
                resolve();
            });
        }
    });
}

function sleep(millis)
{
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, millis);
    });
}

/**
 * Gets the `commonmark.js` script loaded.
 *
 * @return {Promise} a promise object for the `commonmark.js` script
 * @private
 */
function loadCommonMark()
{
    let commonMarkScript = Object.assign(
        document.createElement("script"),
        {
            id: "commonmark",
            src: COMMONMARK_URL,
            async: true,
            defer: true,
            crossOrigin: "anonymous",
            integrity: COMMONMARK_INTEGRITY,
        });
    document.head.appendChild(commonMarkScript);

    return Promise.race([
        sleep(5000).then(() => Promise.reject("Timed out")),
        waitForScriptLoaded("commonmark", commonMarkScript)
    ]);
}

/**
 * Loads and renders a Markdown document in a container element.
 *
 * @param {string} containerId DOM identifier of the conainer element
 */
function render(containerId)
{
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

        loadCommonMark()
            .then(() => loadPage(container, path))
            .catch((reason) => {
                throw new Error("Failed to load commonmark.js: " + reason);
            });
    }
}

/**
 * Runs the rendering task.
 *
 * @param {Event} event an optional DOM event
 */
function start(/* event */)
{
    let containerId = new URL(import.meta.url).hash.substring(1);
    if (containerId == "") {
        containerId = "mdview";
    }
    render(containerId);
}

console.info("Loaded: %s (%s %s)", MODULE_NAME, PACKAGE_NAME, PACKAGE_VERSION);
if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", start);
}
else {
    // The 'DOMContentLoaded' event has already been fired.
    start();
}
