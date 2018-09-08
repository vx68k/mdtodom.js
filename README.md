This file documents the `mdtodom.js` script.

# Description

The `mdtodom.js` script renders [commonmark.js] AST directly into DOM on modern
browsers to make a webpage from a Markdown file.

[commonmark.js]: https://github.com/commonmark/commonmark.js

# Usage

```javascript
import { render } from "./mdtodom.js";

// Assuming commonmark.js has been loaded.
let parser = new commonmark.Parser();
let block = render(document, parser.parse("*something*"));

let container = document.getElementById("container");
container.appendChild(block);
```

# See also

The [project home](https://vx68k.bitbucket.io/mdtodom.js/).

## Informational references

The [Fetch](https://fetch.spec.whatwg.org/) standard by WHATWG.

The [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
documentation on MDN.
