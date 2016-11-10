var assert = require('assert');
var scanFile = require('../').scanFile;
var path = require('path');
var fs = require('fs');
var inputTxtPath = path.join(__dirname, "input.txt");
var outputTxtPath = path.join(__dirname, "output.txt");
var expectedResult = fs.readFileSync(outputTxtPath).toString('utf8');
var options = {
  filePath: inputTxtPath,
  startLine: 100,
  endLine: 200,
};
var timeout = setTimeout(ranOutOfTime, 1000);
scanFile(options, function(err, sourceBuffer) {
  if (err) throw err;
  var text = sourceBuffer.toString('utf8');
  assert.strictEqual(text, expectedResult);
  clearTimeout(timeout);
});
function ranOutOfTime() {
  throw new Error("timeout");
}
