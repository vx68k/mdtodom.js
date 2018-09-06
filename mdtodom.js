// mdtodom.js
// Copyright (C) 2018 Kaz Nishimura
//
// Copying and distribution of this file, with or without modification, are
// permitted in any medium without royalty provided the copyright notice and
// this notice are preserved.  This file is offered as-is, without any warranty.

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
