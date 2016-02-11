'use strict';

var util = require('util');
var Stream = require('stream').Stream;
var TokenType = require('./token-type');
var BreakType = require('./break-type');
var Tokenizer = require('./tokenizer');
var LineBreak = require('./line-break');

function TokenizerStream() {
  Stream.call(this);

  var that = this;

  this.readable = true;
  this.writable = true;

  this.tokenizer = Tokenizer.createTokenizer();
  this.linebreak = new LineBreak();

  this.tokenizer.on('token', function (token, type) {
    that.linebreak.process(token, type);
  });

  this.linebreak.on('action', function (token, type, action) {
    that.emit('data', token);
    that.emit('token', token, type, action);
  });

  this.tokenizer.on('end', function () {
    that.linebreak.end();
  });
}

util.inherits(TokenizerStream, Stream);

TokenizerStream.prototype.write = function (chunk) {
  this.tokenizer.write(chunk);
};

TokenizerStream.prototype.end = function (data) {
  if (data) {
    this.write(data);
  }
  this.tokenizer.end();
  this.emit('end');
};

module.exports = {
  Break: BreakType,
  Token: TokenType,

  Tokenizer: Tokenizer,
  tokenize: Tokenizer.tokenize,
  tokenizeSync: Tokenizer.tokenizeSync,

  createTokenizerStream: function () {
    return new TokenizerStream();
  }
};
