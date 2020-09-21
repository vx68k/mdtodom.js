# Introduction

The `mdtodom.js` script renders a [commonmark.js] AST directly into DOM on
modern web browsers to make a webpage from a Markdown content.

[![(License)](https://img.shields.io/badge/license-MIT-blue.svg)][MIT]

[commonmark.js]: https://github.com/commonmark/commonmark.js

[MIT]: https://opensource.org/licenses/MIT

# Usage

The basic usage of the script is shown below:

```javascript
import {DOMRenderer} from "./mdtodom.js";

// Assuming commonmark.js has been loaded.
let parser = new window.commonmark.Parser();
let renderer = new DOMRenderer(document);
let child = rendereer.render(parser.parse("*something* in Markdown"));

let container = document.getElementById("container");
container.appendChild(child);
```

# See also

The [project home](https://vx68k.bitbucket.io/mdtodom.js/).

## Informational references

The [Fetch](https://fetch.spec.whatwg.org/) standard by WHATWG.

The [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
documentation on MDN.
