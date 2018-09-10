This file documents the `mdtodom.js` script.

# Description

The `mdtodom.js` script renders [commonmark.js] AST directly into DOM on
modern browsers to make a webpage from a Markdown file.

[![(License)](https://img.shields.io/badge/license-MIT-blue.svg)][MIT]

[commonmark.js]: https://github.com/commonmark/commonmark.js

[MIT]: https://opensource.org/licenses/MIT

# Usage

```javascript
import { render } from "./mdtodom.js";

// Assuming commonmark.js has been loaded.
let parser = new commonmark.Parser();
let child = render(document, parser.parse("*something*"));

let container = document.getElementById("container");
container.appendChild(child);
```

# See also

The [project home](https://vx68k.bitbucket.io/mdtodom.js/).

## Informational references

The [Fetch](https://fetch.spec.whatwg.org/) standard by WHATWG.

The [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
documentation on MDN.
