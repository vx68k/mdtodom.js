// mdtodom.js
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

// This file is a module script and shall be in strict mode by default.

/**
 * Markdown-to-DOM renderer.
 *
 * @module mdtodom.js
 */

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
const MODULE_NAME = "mdtodom.js";

export class CommonMarkTreeIterator
{
    constructor(walker)
    {
        this._walker = walker;

        Object.seal(this);
    }

    get walker()
    {
        return this._walker;
    }

    next()
    {
        let step = this._walker.next();
        return {
            done: (step == null),
            value: step,
        };
    }

    [Symbol.iterator]()
    {
        return this;
    }
}

/**
 * DOM renderer for commonmark.js ASTs.
 *
 * @param {Document} document DOM document
 */
export class DOMRenderer
{
    constructor(document)
    {
        this._document = document;
    }

    /**
     * Returns the DOM document.
     */
    get document()
    {
        return this._document;
    }

    /**
     * Renders a commonmark.js AST into DOM.
     *
     * @param {commonmark.Node} tree AST
     * @param {Node} root DOM node to be populated by content nodes, or `null`
     * @return {(DocumentFragment|Node)} root DOM node
     */
    render(tree, root)
    {
        if (root == null) {
            root = this.document.createDocumentFragment();
        }

        let document = this.document;
        let ancestors = [];
        let parent = null;
        for (let step of new CommonMarkTreeIterator(tree.walker())) {
            let node = step.node;
            if (step.entering) {
                let child = null;
                switch (node.type) {
                case "document":
                    parent = root;
                    break;
                case "heading":
                    child = parent.appendChild(
                        document.createElement("h" + node.level));
                    break;
                case "paragraph":
                    child = parent.appendChild(document.createElement("p"));
                    break;
                case "block_quote":
                    child = parent.appendChild(
                        document.createElement("blockquote"));
                    break;
                case "list":
                    if (node.listType == "ordered") {
                        child = parent.appendChild(
                            document.createElement("ol"));
                        if (node.listStart != 1) {
                            child.setAttribute("start", node.listStart);
                        }
                    }
                    else {
                        child = parent.appendChild(
                            document.createElement("ul"));
                    }
                    break;
                case "item":
                    child = parent.appendChild(document.createElement("li"));
                    break;
                case "emph":
                    child = parent.appendChild(document.createElement("em"));
                    break;
                case "strong":
                    child = parent.appendChild(
                        document.createElement("strong"));
                    break;
                case "link":
                    child = parent.appendChild(document.createElement("a"));
                    child.setAttribute("href", node.destination);
                    if (node.title != "") {
                        child.setAttribute("title", node.title);
                    }
                    break;
                case "image":
                    // Container!
                    child = parent.appendChild(document.createElement("img"));
                    child.setAttribute("src", node.destination);
                    if (node.title != "") {
                        child.setAttribute("title", node.title);
                    }
                    break;

                case "code_block":
                    parent.appendChild(document.createElement("pre"))
                        .appendChild(this.createCodeElement(node.literal));
                    break;
                case "code":
                    parent.appendChild(this.createCodeElement(node.literal));
                    break;
                case "text":
                    parent.appendChild(document.createTextNode(node.literal));
                    break;
                case "softbreak":
                    parent.appendChild(document.createTextNode("\n"));
                    break;
                case "html_block":
                    // For security reasons, any inserted script elements must
                    // not be executed.
                    parent.insertAdjacentHTML("beforeend", node.literal);
                    break;

                // Group of empty elements.
                case "linebreak":
                    parent.appendChild(document.createElement("br"));
                    break;
                case "thematic_break":
                    parent.appendChild(document.createElement("hr"));
                    break;

                // Anything else.
                default:
                    // No flows should come here.
                    console.debug("Falling back: " + node.type);
                    if (node.isContainer) {
                        child = document.createElement("span");
                        parent.appendChild(child);
                    }
                    break;
                }
                if (child != null) {
                    ancestors.push(parent);
                    parent = child;
                }
            }
            else {
                let text;
                switch (node.type) {
                case "document":
                    parent = null;
                    break;
                case "heading":
                    text = parent.textContent;
                    parent.setAttribute(
                        "id", text.toLowerCase().replace(/\s/g, "-"));
                    break;
                case "image":
                    text = parent.textContent;
                    while (parent.hasChildNodes()) {
                        parent.removeChild(parent.lastChild);
                    }
                    parent.setAttribute("alt", text);
                    break;
                default:
                    break;
                }
                if (parent != null) {
                    parent = ancestors.pop();
                }
            }
        }
        if (ancestors.length > 0) {
            console.debug("Ancestors stack not empty")
        }
        return root;
    }

    /**
     * Creates a `code` element with text.
     *
     * @param {string} text code text
     * @return {Element} `code` element
     */
    createCodeElement(text)
    {
        let code = this.document.createElement("code");
        code.appendChild(this.document.createTextNode(text));
        return code;
    }
}

/**
 * Renders a commonmark.js AST into DOM.
 *
 * @param {Document} document DOM Document object
 * @param {commonmark.Node} tree commonmark.js Node object
 * @param {Node} root DOM node to be populated by content nodes, or `null`
 * @return {(DocumentFragment|Node)} root DOM node
 */
export function render(document, tree, root)
{
    let renderer = new DOMRenderer(document);
    return renderer.render(tree, root);
}

console.info("Loaded: %s (%s %s)", MODULE_NAME, PACKAGE_NAME, PACKAGE_VERSION);
