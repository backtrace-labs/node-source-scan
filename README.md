# node-source-scan

## Usage

```js
var scanFile = require('source-scan').scanFile;
var options = {
  filePath: "file.js",
  startLine: 100,
  endLine: 200,
};
scanFile(options, function(err, sourceBuffer) {
  if (err) throw err;
  // sourceBuffer is a Buffer object with the source code from lines 100-200.
});
```

## Documentation

### scanFile(options, callback)

`options`:

 * `filePath`: String or buffer that represents the file system path to open.
 * `startLine`: 0-based line index to start capturing from. 0 is the first line
   in the file.
 * `endLine`: 0-based line index to stop capturing. `startLine` of 0 and
   `endLine`: of 10 means to capture the first 10 lines. If `endLine` is beyond
   the end of the file, it is clamped to include the last line.
 * `maxByteCount`: optional. Sets a limit on the maximum number of bytes that
   will be obtained from the file. Defaults to 120 bytes times
   `endLine - startLine`.

`callback(err, sourceBuffer)`
