// mdtodom.js
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
 * Markdown-to-DOM renderer.
 *
 * @module mdtodom
 */

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

        let walker = tree.walker();
        let ancestors = [];
        for (let step = walker.next(); step != null; step = walker.next()) {
            let node = step.node;
            if (step.entering) {
                let child = null;
                switch (node.type) {
                case "document":
                    child = root;
                    break;
                case "heading":
                    child = this.document.createElement("h" + node.level);
                    break;
                case "paragraph":
                    child = this.document.createElement("p");
                    break;
                case "block_quote":
                    child = this.document.createElement("blockquote");
                    break;
                case "list":
                    if (node.listType == "ordered") {
                        child = this.document.createElement("ol");
                        if (node.listStart != 1) {
                            child.setAttribute("start", node.listStart);
                        }
                    }
                    else {
                        child = this.document.createElement("ul");
                    }
                    break;
                case "item":
                    child = this.document.createElement("li");
                    break;
                case "emph":
                    child = this.document.createElement("em");
                    break;
                case "strong":
                    child = this.document.createElement("strong");
                    break;
                case "link":
                    child = this.document.createElement("a");
                    child.setAttribute("href", node.destination);
                    if (node.title != "") {
                        child.setAttribute("title", node.title);
                    }
                    break;
                case "image":
                    // Container!
                    child = this.document.createElement("object");
                    child.setAttribute("data", node.destination);
                    if (node.title != "") {
                        child.setAttribute("title", node.title);
                    }
                    break;

                case "code_block":
                    child = this.document.createElement("pre");
                    child.appendChild(this.createCodeElement(node.literal));
                    break;
                case "code":
                    child = this.createCodeElement(node.literal);
                    break;
                case "html_block":
                    // For security reasons, HTML blocks are just exposed as
                    // text nodes.
                    child = this.document.createTextNode(node.literal);
                    break;
                case "text":
                    child = this.document.createTextNode(node.literal);
                    break;
                case "softbreak":
                    child = this.document.createTextNode("\n");
                    break;

                // Group of empty elements.
                case "linebreak":
                    child = this.document.createElement("br");
                    break;
                case "thematic_break":
                    child = this.document.createElement("hr");
                    break;

                // Anything else.
                default:
                    // No flows should come here.
                    console.log("Falling back: " + node.type);
                    if (node.isContainer) {
                        child = this.document.createElement("span");
                    }
                    break;
                }
                if (node.isContainer) {
                    ancestors.unshift(child);
                }
                else if (child != null) {
                    ancestors[0].appendChild(child);
                }
            }
            else if (node.type != "document") {
                let child = ancestors.shift();
                if (node.type == "heading") {
                    child.setAttribute(
                        "id",
                         child.textContent.toLowerCase().replace(/\s/g, "-"));
                }
                ancestors[0].appendChild(child);
            }
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
