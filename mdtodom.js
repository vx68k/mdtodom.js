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
function render(document, tree)
{
    let walker = tree.walker();
    let ancestors = [];
    for (let step = walker.next(); step != null; step = walker.next()) {
        if (step.entering) {
            let child = null;
            switch (step.node.type) {
            case "document":
                child = document.createElement("div");
                break;
            case "heading":
                child = document.createElement("h" + step.node.level);
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
            default:
                console.log("Falling back: " + step.node.type);
                child = document.createElement("span");
                break;
            case "thematic_break":
                ancestors[ancestors.length - 1].appendChild(
                    document.createElement("hr"));
                break;
            case "text":
                ancestors[ancestors.length - 1].appendChild(
                    document.createTextNode(step.node.literal));
                break;
            case "softbreak":
                ancestors[ancestors.length - 1].appendChild(
                    document.createTextNode(" "));
                break;
            }
            if (child != null) {
                ancestors.push(child);
            }
        }
        else if (ancestors.length > 1) {
            let child = ancestors.pop();
            ancestors[ancestors.length - 1].appendChild(child);
        }
        else {
            return ancestors[0];
        }
    }
}

export {
    render,
};
