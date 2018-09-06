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
 * Renders a commonmark.js AST into DOM.
 *
 * @param {Document} document DOM Document object
 * @param {commonmark.Node} tree commonmark.js Node object
 * @return {Node} DOM Node object
 */
export function render(document, tree)
{
    let walker = tree.walker();
    let ancestors = [];
    for (let step = walker.next(); step != null; step = walker.next()) {
        if (step.entering) {
            let node = step.node;
            let child = null;
            switch (node.type) {
            case "document":
                child = document.createElement("div");
                break;
            case "heading":
                child = document.createElement("h" + node.level);
                break;
            case "paragraph":
                child = document.createElement("p");
                break;
            case "emph":
                child = document.createElement("em");
                break;
            case "strong":
                child = document.createElement("strong");
                break;
            case "link":
                child = document.createElement("a");
                child.setAttribute("href", node.destination);
                if (node.title != "") {
                    child.setAttribute("title", node.title);
                }
                break;
            default:
                console.log("Falling back: " + node.type);
                if (node.isContainer) {
                    child = document.createElement("span");
                }
                break;
            case "thematic_break":
                child = document.createElement("hr");
                break;
            case "code":
                child = document.createElement("code");
                child.appendChild(document.createTextNode(node.literal));
                break;
            case "text":
                child = document.createTextNode(node.literal);
                break;
            case "softbreak":
                child = document.createTextNode("\n");
                break;
            }
            if (child != null) {
                if (node.isContainer) {
                    ancestors.push(child);
                }
                else {
                    ancestors[ancestors.length - 1].appendChild(child);
                }
            }
        }
        else if (ancestors.length > 1) {
            let child = ancestors.pop();
            ancestors[ancestors.length - 1].appendChild(child);
        }
    }
    return ancestors[0];
}
