var util = require('util');
var stream = require('stream');
var fs = require('fs');
var StreamSink = require('streamsink');

exports.scanFile = scanFile;
exports.LineScanner = LineScanner;

util.inherits(LineScanner, stream.Transform);
function LineScanner(options) {
  stream.Transform.call(this, options);
  this.startLine = Math.max(options.startLine, 0);
  this.endLine = Math.max(options.endLine, 0);
  this.currentLine = 0;
  this.maxByteCount = options.maxByteCount || (120 * (this.endLine - this.startLine));
  this.currentByteCount = 0;
}

LineScanner.prototype._transform = function(chunk, encoding, callback) {
  if (stoppedCapturing(this)) {
    callback();
    return;
  }

  var startIsCapturing = startedCapturing(this);
  var startCaptureIndex = 0;
  for (var i = 0; i < chunk.length; i += 1) {
    var c = chunk[i];
    var isNewline = (c === 10);

    this.currentByteCount += 1;
    this.currentLine += isNewline;

    if (stoppedCapturing(this)) {
      callback(null, chunk.slice(startCaptureIndex, i + isNewline));
      return;
    } else if (!startIsCapturing && startedCapturing(this)) {
      startIsCapturing = true;
      startCaptureIndex = i + isNewline;
    }
  }
  var resultBuffer = null;
  if (startIsCapturing && startCaptureIndex < chunk.length) {
    resultBuffer = chunk.slice(startCaptureIndex, chunk.length);
  }
  callback(null, resultBuffer);
};

function startedCapturing(self) {
  return (self.currentLine >= self.startLine);
}

function stoppedCapturing(self) {
  return (self.currentLine >= self.endLine || self.currentByteCount >= self.maxByteCount);
}

function scanFile(options, callback) {
  var filePath = options.filePath;
  if (!filePath) throw new Error("filePath required");

  var startLine = options.startLine;
  if (startLine == null) throw new Error("startLine required");

  var endLine = options.endLine;
  if (endLine == null) throw new Error("endLine required");

  var reportedError = false;

  var inStream = fs.createReadStream(filePath);
  inStream.on('error', onError);

  var lineScanner = new LineScanner({
    startLine: startLine,
    endLine: endLine,
    maxByteCount: options.maxByteCount,
  });
  lineScanner.on('error', onError);

  var sink = new StreamSink();
  sink.on('error', onError);
  sink.on('finish', onFinish);

  inStream.pipe(lineScanner);
  lineScanner.pipe(sink);

  function onError(err) {
    if (reportedError) return;
    reportedError = true;
    callback(err);
  }

  function onFinish() {
    var resultBuffer = sink.toBuffer();
    callback(null, resultBuffer);
  }
}
