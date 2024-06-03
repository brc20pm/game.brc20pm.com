window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
        o = b;
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  1: [ function(require, module, exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = "undefined" !== typeof Uint8Array ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len = b64.length;
      if (len % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
      var validLen = b64.indexOf("=");
      -1 === validLen && (validLen = len);
      var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
      return [ validLen, placeHoldersLen ];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return 3 * (validLen + placeHoldersLen) / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return 3 * (validLen + placeHoldersLen) / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i;
      for (i = 0; i < len; i += 4) {
        tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = 255 & tmp;
      }
      if (2 === placeHoldersLen) {
        tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
        arr[curByte++] = 255 & tmp;
      }
      if (1 === placeHoldersLen) {
        tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = 255 & tmp;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[63 & num];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (255 & uint8[i + 2]);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
      if (1 === extraBytes) {
        tmp = uint8[len - 1];
        parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
      } else if (2 === extraBytes) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
      }
      return parts.join("");
    }
  }, {} ],
  2: [ function(require, module, exports) {
    (function(global) {
      "use strict";
      var base64 = require("base64-js");
      var ieee754 = require("ieee754");
      var isArray = require("isarray");
      exports.Buffer = Buffer;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      Buffer.TYPED_ARRAY_SUPPORT = void 0 !== global.TYPED_ARRAY_SUPPORT ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();
      exports.kMaxLength = kMaxLength();
      function typedArraySupport() {
        try {
          var arr = new Uint8Array(1);
          arr.__proto__ = {
            __proto__: Uint8Array.prototype,
            foo: function() {
              return 42;
            }
          };
          return 42 === arr.foo() && "function" === typeof arr.subarray && 0 === arr.subarray(1, 1).byteLength;
        } catch (e) {
          return false;
        }
      }
      function kMaxLength() {
        return Buffer.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
      }
      function createBuffer(that, length) {
        if (kMaxLength() < length) throw new RangeError("Invalid typed array length");
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          that = new Uint8Array(length);
          that.__proto__ = Buffer.prototype;
        } else {
          null === that && (that = new Buffer(length));
          that.length = length;
        }
        return that;
      }
      function Buffer(arg, encodingOrOffset, length) {
        if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) return new Buffer(arg, encodingOrOffset, length);
        if ("number" === typeof arg) {
          if ("string" === typeof encodingOrOffset) throw new Error("If encoding is specified then the first argument must be a string");
          return allocUnsafe(this, arg);
        }
        return from(this, arg, encodingOrOffset, length);
      }
      Buffer.poolSize = 8192;
      Buffer._augment = function(arr) {
        arr.__proto__ = Buffer.prototype;
        return arr;
      };
      function from(that, value, encodingOrOffset, length) {
        if ("number" === typeof value) throw new TypeError('"value" argument must not be a number');
        if ("undefined" !== typeof ArrayBuffer && value instanceof ArrayBuffer) return fromArrayBuffer(that, value, encodingOrOffset, length);
        if ("string" === typeof value) return fromString(that, value, encodingOrOffset);
        return fromObject(that, value);
      }
      Buffer.from = function(value, encodingOrOffset, length) {
        return from(null, value, encodingOrOffset, length);
      };
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        Buffer.prototype.__proto__ = Uint8Array.prototype;
        Buffer.__proto__ = Uint8Array;
        "undefined" !== typeof Symbol && Symbol.species && Buffer[Symbol.species] === Buffer && Object.defineProperty(Buffer, Symbol.species, {
          value: null,
          configurable: true
        });
      }
      function assertSize(size) {
        if ("number" !== typeof size) throw new TypeError('"size" argument must be a number');
        if (size < 0) throw new RangeError('"size" argument must not be negative');
      }
      function alloc(that, size, fill, encoding) {
        assertSize(size);
        if (size <= 0) return createBuffer(that, size);
        if (void 0 !== fill) return "string" === typeof encoding ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
        return createBuffer(that, size);
      }
      Buffer.alloc = function(size, fill, encoding) {
        return alloc(null, size, fill, encoding);
      };
      function allocUnsafe(that, size) {
        assertSize(size);
        that = createBuffer(that, size < 0 ? 0 : 0 | checked(size));
        if (!Buffer.TYPED_ARRAY_SUPPORT) for (var i = 0; i < size; ++i) that[i] = 0;
        return that;
      }
      Buffer.allocUnsafe = function(size) {
        return allocUnsafe(null, size);
      };
      Buffer.allocUnsafeSlow = function(size) {
        return allocUnsafe(null, size);
      };
      function fromString(that, string, encoding) {
        "string" === typeof encoding && "" !== encoding || (encoding = "utf8");
        if (!Buffer.isEncoding(encoding)) throw new TypeError('"encoding" must be a valid string encoding');
        var length = 0 | byteLength(string, encoding);
        that = createBuffer(that, length);
        var actual = that.write(string, encoding);
        actual !== length && (that = that.slice(0, actual));
        return that;
      }
      function fromArrayLike(that, array) {
        var length = array.length < 0 ? 0 : 0 | checked(array.length);
        that = createBuffer(that, length);
        for (var i = 0; i < length; i += 1) that[i] = 255 & array[i];
        return that;
      }
      function fromArrayBuffer(that, array, byteOffset, length) {
        array.byteLength;
        if (byteOffset < 0 || array.byteLength < byteOffset) throw new RangeError("'offset' is out of bounds");
        if (array.byteLength < byteOffset + (length || 0)) throw new RangeError("'length' is out of bounds");
        array = void 0 === byteOffset && void 0 === length ? new Uint8Array(array) : void 0 === length ? new Uint8Array(array, byteOffset) : new Uint8Array(array, byteOffset, length);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          that = array;
          that.__proto__ = Buffer.prototype;
        } else that = fromArrayLike(that, array);
        return that;
      }
      function fromObject(that, obj) {
        if (Buffer.isBuffer(obj)) {
          var len = 0 | checked(obj.length);
          that = createBuffer(that, len);
          if (0 === that.length) return that;
          obj.copy(that, 0, 0, len);
          return that;
        }
        if (obj) {
          if ("undefined" !== typeof ArrayBuffer && obj.buffer instanceof ArrayBuffer || "length" in obj) {
            if ("number" !== typeof obj.length || isnan(obj.length)) return createBuffer(that, 0);
            return fromArrayLike(that, obj);
          }
          if ("Buffer" === obj.type && isArray(obj.data)) return fromArrayLike(that, obj.data);
        }
        throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
      }
      function checked(length) {
        if (length >= kMaxLength()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength().toString(16) + " bytes");
        return 0 | length;
      }
      function SlowBuffer(length) {
        +length != length && (length = 0);
        return Buffer.alloc(+length);
      }
      Buffer.isBuffer = function isBuffer(b) {
        return !!(null != b && b._isBuffer);
      };
      Buffer.compare = function compare(a, b) {
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) throw new TypeError("Arguments must be Buffers");
        if (a === b) return 0;
        var x = a.length;
        var y = b.length;
        for (var i = 0, len = Math.min(x, y); i < len; ++i) if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
         case "hex":
         case "utf8":
         case "utf-8":
         case "ascii":
         case "latin1":
         case "binary":
         case "base64":
         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return true;

         default:
          return false;
        }
      };
      Buffer.concat = function concat(list, length) {
        if (!isArray(list)) throw new TypeError('"list" argument must be an Array of Buffers');
        if (0 === list.length) return Buffer.alloc(0);
        var i;
        if (void 0 === length) {
          length = 0;
          for (i = 0; i < list.length; ++i) length += list[i].length;
        }
        var buffer = Buffer.allocUnsafe(length);
        var pos = 0;
        for (i = 0; i < list.length; ++i) {
          var buf = list[i];
          if (!Buffer.isBuffer(buf)) throw new TypeError('"list" argument must be an Array of Buffers');
          buf.copy(buffer, pos);
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer.isBuffer(string)) return string.length;
        if ("undefined" !== typeof ArrayBuffer && "function" === typeof ArrayBuffer.isView && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) return string.byteLength;
        "string" !== typeof string && (string = "" + string);
        var len = string.length;
        if (0 === len) return 0;
        var loweredCase = false;
        for (;;) switch (encoding) {
         case "ascii":
         case "latin1":
         case "binary":
          return len;

         case "utf8":
         case "utf-8":
         case void 0:
          return utf8ToBytes(string).length;

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return 2 * len;

         case "hex":
          return len >>> 1;

         case "base64":
          return base64ToBytes(string).length;

         default:
          if (loweredCase) return utf8ToBytes(string).length;
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
        }
      }
      Buffer.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        var loweredCase = false;
        (void 0 === start || start < 0) && (start = 0);
        if (start > this.length) return "";
        (void 0 === end || end > this.length) && (end = this.length);
        if (end <= 0) return "";
        end >>>= 0;
        start >>>= 0;
        if (end <= start) return "";
        encoding || (encoding = "utf8");
        while (true) switch (encoding) {
         case "hex":
          return hexSlice(this, start, end);

         case "utf8":
         case "utf-8":
          return utf8Slice(this, start, end);

         case "ascii":
          return asciiSlice(this, start, end);

         case "latin1":
         case "binary":
          return latin1Slice(this, start, end);

         case "base64":
          return base64Slice(this, start, end);

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return utf16leSlice(this, start, end);

         default:
          if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
          encoding = (encoding + "").toLowerCase();
          loweredCase = true;
        }
      }
      Buffer.prototype._isBuffer = true;
      function swap(b, n, m) {
        var i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer.prototype.swap16 = function swap16() {
        var len = this.length;
        if (len % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
        for (var i = 0; i < len; i += 2) swap(this, i, i + 1);
        return this;
      };
      Buffer.prototype.swap32 = function swap32() {
        var len = this.length;
        if (len % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer.prototype.swap64 = function swap64() {
        var len = this.length;
        if (len % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer.prototype.toString = function toString() {
        var length = 0 | this.length;
        if (0 === length) return "";
        if (0 === arguments.length) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer.prototype.equals = function equals(b) {
        if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return 0 === Buffer.compare(this, b);
      };
      Buffer.prototype.inspect = function inspect() {
        var str = "";
        var max = exports.INSPECT_MAX_BYTES;
        if (this.length > 0) {
          str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
          this.length > max && (str += " ... ");
        }
        return "<Buffer " + str + ">";
      };
      Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (!Buffer.isBuffer(target)) throw new TypeError("Argument must be a Buffer");
        void 0 === start && (start = 0);
        void 0 === end && (end = target ? target.length : 0);
        void 0 === thisStart && (thisStart = 0);
        void 0 === thisEnd && (thisEnd = this.length);
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) throw new RangeError("out of range index");
        if (thisStart >= thisEnd && start >= end) return 0;
        if (thisStart >= thisEnd) return -1;
        if (start >= end) return 1;
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        var x = thisEnd - thisStart;
        var y = end - start;
        var len = Math.min(x, y);
        var thisCopy = this.slice(thisStart, thisEnd);
        var targetCopy = target.slice(start, end);
        for (var i = 0; i < len; ++i) if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (0 === buffer.length) return -1;
        if ("string" === typeof byteOffset) {
          encoding = byteOffset;
          byteOffset = 0;
        } else byteOffset > 2147483647 ? byteOffset = 2147483647 : byteOffset < -2147483648 && (byteOffset = -2147483648);
        byteOffset = +byteOffset;
        isNaN(byteOffset) && (byteOffset = dir ? 0 : buffer.length - 1);
        byteOffset < 0 && (byteOffset = buffer.length + byteOffset);
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (!dir) return -1;
          byteOffset = 0;
        }
        "string" === typeof val && (val = Buffer.from(val, encoding));
        if (Buffer.isBuffer(val)) {
          if (0 === val.length) return -1;
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        }
        if ("number" === typeof val) {
          val &= 255;
          if (Buffer.TYPED_ARRAY_SUPPORT && "function" === typeof Uint8Array.prototype.indexOf) return dir ? Uint8Array.prototype.indexOf.call(buffer, val, byteOffset) : Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
          return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        var indexSize = 1;
        var arrLength = arr.length;
        var valLength = val.length;
        if (void 0 !== encoding) {
          encoding = String(encoding).toLowerCase();
          if ("ucs2" === encoding || "ucs-2" === encoding || "utf16le" === encoding || "utf-16le" === encoding) {
            if (arr.length < 2 || val.length < 2) return -1;
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read(buf, i) {
          return 1 === indexSize ? buf[i] : buf.readUInt16BE(i * indexSize);
        }
        var i;
        if (dir) {
          var foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) if (read(arr, i) === read(val, -1 === foundIndex ? 0 : i - foundIndex)) {
            -1 === foundIndex && (foundIndex = i);
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            -1 !== foundIndex && (i -= i - foundIndex);
            foundIndex = -1;
          }
        } else {
          byteOffset + valLength > arrLength && (byteOffset = arrLength - valLength);
          for (i = byteOffset; i >= 0; i--) {
            var found = true;
            for (var j = 0; j < valLength; j++) if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
        return -1 !== this.indexOf(val, byteOffset, encoding);
      };
      Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        var remaining = buf.length - offset;
        if (length) {
          length = Number(length);
          length > remaining && (length = remaining);
        } else length = remaining;
        var strLen = string.length;
        if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
        length > strLen / 2 && (length = strLen / 2);
        for (var i = 0; i < length; ++i) {
          var parsed = parseInt(string.substr(2 * i, 2), 16);
          if (isNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function latin1Write(buf, string, offset, length) {
        return asciiWrite(buf, string, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer.prototype.write = function write(string, offset, length, encoding) {
        if (void 0 === offset) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (void 0 === length && "string" === typeof offset) {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else {
          if (!isFinite(offset)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
          offset |= 0;
          if (isFinite(length)) {
            length |= 0;
            void 0 === encoding && (encoding = "utf8");
          } else {
            encoding = length;
            length = void 0;
          }
        }
        var remaining = this.length - offset;
        (void 0 === length || length > remaining) && (length = remaining);
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) throw new RangeError("Attempt to write outside buffer bounds");
        encoding || (encoding = "utf8");
        var loweredCase = false;
        for (;;) switch (encoding) {
         case "hex":
          return hexWrite(this, string, offset, length);

         case "utf8":
         case "utf-8":
          return utf8Write(this, string, offset, length);

         case "ascii":
          return asciiWrite(this, string, offset, length);

         case "latin1":
         case "binary":
          return latin1Write(this, string, offset, length);

         case "base64":
          return base64Write(this, string, offset, length);

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return ucs2Write(this, string, offset, length);

         default:
          if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
        }
      };
      Buffer.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        return 0 === start && end === buf.length ? base64.fromByteArray(buf) : base64.fromByteArray(buf.slice(start, end));
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        var res = [];
        var i = start;
        while (i < end) {
          var firstByte = buf[i];
          var codePoint = null;
          var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
             case 1:
              firstByte < 128 && (codePoint = firstByte);
              break;

             case 2:
              secondByte = buf[i + 1];
              if (128 === (192 & secondByte)) {
                tempCodePoint = (31 & firstByte) << 6 | 63 & secondByte;
                tempCodePoint > 127 && (codePoint = tempCodePoint);
              }
              break;

             case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if (128 === (192 & secondByte) && 128 === (192 & thirdByte)) {
                tempCodePoint = (15 & firstByte) << 12 | (63 & secondByte) << 6 | 63 & thirdByte;
                tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343) && (codePoint = tempCodePoint);
              }
              break;

             case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if (128 === (192 & secondByte) && 128 === (192 & thirdByte) && 128 === (192 & fourthByte)) {
                tempCodePoint = (15 & firstByte) << 18 | (63 & secondByte) << 12 | (63 & thirdByte) << 6 | 63 & fourthByte;
                tempCodePoint > 65535 && tempCodePoint < 1114112 && (codePoint = tempCodePoint);
              }
            }
          }
          if (null === codePoint) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | 1023 & codePoint;
          }
          res.push(codePoint);
          i += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        var len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) return String.fromCharCode.apply(String, codePoints);
        var res = "";
        var i = 0;
        while (i < len) res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
        return res;
      }
      function asciiSlice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) ret += String.fromCharCode(127 & buf[i]);
        return ret;
      }
      function latin1Slice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) ret += String.fromCharCode(buf[i]);
        return ret;
      }
      function hexSlice(buf, start, end) {
        var len = buf.length;
        (!start || start < 0) && (start = 0);
        (!end || end < 0 || end > len) && (end = len);
        var out = "";
        for (var i = start; i < end; ++i) out += toHex(buf[i]);
        return out;
      }
      function utf16leSlice(buf, start, end) {
        var bytes = buf.slice(start, end);
        var res = "";
        for (var i = 0; i < bytes.length; i += 2) res += String.fromCharCode(bytes[i] + 256 * bytes[i + 1]);
        return res;
      }
      Buffer.prototype.slice = function slice(start, end) {
        var len = this.length;
        start = ~~start;
        end = void 0 === end ? len : ~~end;
        if (start < 0) {
          start += len;
          start < 0 && (start = 0);
        } else start > len && (start = len);
        if (end < 0) {
          end += len;
          end < 0 && (end = 0);
        } else end > len && (end = len);
        end < start && (end = start);
        var newBuf;
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          newBuf = this.subarray(start, end);
          newBuf.__proto__ = Buffer.prototype;
        } else {
          var sliceLen = end - start;
          newBuf = new Buffer(sliceLen, void 0);
          for (var i = 0; i < sliceLen; ++i) newBuf[i] = this[i + start];
        }
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
        return val;
      };
      Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset + --byteLength];
        var mul = 1;
        while (byteLength > 0 && (mul *= 256)) val += this[offset + --byteLength] * mul;
        return val;
      };
      Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        noAssert || checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + 16777216 * this[offset + 3];
      };
      Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return 16777216 * this[offset] + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
        mul *= 128;
        val >= mul && (val -= Math.pow(2, 8 * byteLength));
        return val;
      };
      Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var i = byteLength;
        var mul = 1;
        var val = this[offset + --i];
        while (i > 0 && (mul *= 256)) val += this[offset + --i] * mul;
        mul *= 128;
        val >= mul && (val -= Math.pow(2, 8 * byteLength));
        return val;
      };
      Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
        noAssert || checkOffset(offset, 1, this.length);
        if (!(128 & this[offset])) return this[offset];
        return -1 * (255 - this[offset] + 1);
      };
      Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        var val = this[offset] | this[offset + 1] << 8;
        return 32768 & val ? 4294901760 | val : val;
      };
      Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        var val = this[offset + 1] | this[offset] << 8;
        return 32768 & val ? 4294901760 | val : val;
      };
      Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        noAssert || checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        noAssert || checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        byteLength |= 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }
        var mul = 1;
        var i = 0;
        this[offset] = 255 & value;
        while (++i < byteLength && (mul *= 256)) this[offset + i] = value / mul & 255;
        return offset + byteLength;
      };
      Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        byteLength |= 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }
        var i = byteLength - 1;
        var mul = 1;
        this[offset + i] = 255 & value;
        while (--i >= 0 && (mul *= 256)) this[offset + i] = value / mul & 255;
        return offset + byteLength;
      };
      Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 1, 255, 0);
        Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value));
        this[offset] = 255 & value;
        return offset + 1;
      };
      function objectWriteUInt16(buf, value, offset, littleEndian) {
        value < 0 && (value = 65535 + value + 1);
        for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> 8 * (littleEndian ? i : 1 - i);
      }
      Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
        } else objectWriteUInt16(this, value, offset, true);
        return offset + 2;
      };
      Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = 255 & value;
        } else objectWriteUInt16(this, value, offset, false);
        return offset + 2;
      };
      function objectWriteUInt32(buf, value, offset, littleEndian) {
        value < 0 && (value = 4294967295 + value + 1);
        for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) buf[offset + i] = value >>> 8 * (littleEndian ? i : 3 - i) & 255;
      }
      Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset + 3] = value >>> 24;
          this[offset + 2] = value >>> 16;
          this[offset + 1] = value >>> 8;
          this[offset] = 255 & value;
        } else objectWriteUInt32(this, value, offset, true);
        return offset + 4;
      };
      Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = 255 & value;
        } else objectWriteUInt32(this, value, offset, false);
        return offset + 4;
      };
      Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);
          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }
        var i = 0;
        var mul = 1;
        var sub = 0;
        this[offset] = 255 & value;
        while (++i < byteLength && (mul *= 256)) {
          value < 0 && 0 === sub && 0 !== this[offset + i - 1] && (sub = 1);
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength;
      };
      Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);
          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }
        var i = byteLength - 1;
        var mul = 1;
        var sub = 0;
        this[offset + i] = 255 & value;
        while (--i >= 0 && (mul *= 256)) {
          value < 0 && 0 === sub && 0 !== this[offset + i + 1] && (sub = 1);
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength;
      };
      Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 1, 127, -128);
        Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value));
        value < 0 && (value = 255 + value + 1);
        this[offset] = 255 & value;
        return offset + 1;
      };
      Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
        } else objectWriteUInt16(this, value, offset, true);
        return offset + 2;
      };
      Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = 255 & value;
        } else objectWriteUInt16(this, value, offset, false);
        return offset + 2;
      };
      Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
          this[offset + 2] = value >>> 16;
          this[offset + 3] = value >>> 24;
        } else objectWriteUInt32(this, value, offset, true);
        return offset + 4;
      };
      Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
        value < 0 && (value = 4294967295 + value + 1);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = 255 & value;
        } else objectWriteUInt32(this, value, offset, false);
        return offset + 4;
      };
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        noAssert || checkIEEE754(buf, value, offset, 4, 3.4028234663852886e38, -3.4028234663852886e38);
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        noAssert || checkIEEE754(buf, value, offset, 8, 1.7976931348623157e308, -1.7976931348623157e308);
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer.prototype.copy = function copy(target, targetStart, start, end) {
        start || (start = 0);
        end || 0 === end || (end = this.length);
        targetStart >= target.length && (targetStart = target.length);
        targetStart || (targetStart = 0);
        end > 0 && end < start && (end = start);
        if (end === start) return 0;
        if (0 === target.length || 0 === this.length) return 0;
        if (targetStart < 0) throw new RangeError("targetStart out of bounds");
        if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        end > this.length && (end = this.length);
        target.length - targetStart < end - start && (end = target.length - targetStart + start);
        var len = end - start;
        var i;
        if (this === target && start < targetStart && targetStart < end) for (i = len - 1; i >= 0; --i) target[i + targetStart] = this[i + start]; else if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) for (i = 0; i < len; ++i) target[i + targetStart] = this[i + start]; else Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
        return len;
      };
      Buffer.prototype.fill = function fill(val, start, end, encoding) {
        if ("string" === typeof val) {
          if ("string" === typeof start) {
            encoding = start;
            start = 0;
            end = this.length;
          } else if ("string" === typeof end) {
            encoding = end;
            end = this.length;
          }
          if (1 === val.length) {
            var code = val.charCodeAt(0);
            code < 256 && (val = code);
          }
          if (void 0 !== encoding && "string" !== typeof encoding) throw new TypeError("encoding must be a string");
          if ("string" === typeof encoding && !Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
        } else "number" === typeof val && (val &= 255);
        if (start < 0 || this.length < start || this.length < end) throw new RangeError("Out of range index");
        if (end <= start) return this;
        start >>>= 0;
        end = void 0 === end ? this.length : end >>> 0;
        val || (val = 0);
        var i;
        if ("number" === typeof val) for (i = start; i < end; ++i) this[i] = val; else {
          var bytes = Buffer.isBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
          var len = bytes.length;
          for (i = 0; i < end - start; ++i) this[i + start] = bytes[i % len];
        }
        return this;
      };
      var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = stringtrim(str).replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
        while (str.length % 4 !== 0) str += "=";
        return str;
      }
      function stringtrim(str) {
        if (str.trim) return str.trim();
        return str.replace(/^\s+|\s+$/g, "");
      }
      function toHex(n) {
        if (n < 16) return "0" + n.toString(16);
        return n.toString(16);
      }
      function utf8ToBytes(string, units) {
        units = units || Infinity;
        var codePoint;
        var length = string.length;
        var leadSurrogate = null;
        var bytes = [];
        for (var i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                (units -= 3) > -1 && bytes.push(239, 191, 189);
                continue;
              }
              if (i + 1 === length) {
                (units -= 3) > -1 && bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              (units -= 3) > -1 && bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = 65536 + (leadSurrogate - 55296 << 10 | codePoint - 56320);
          } else leadSurrogate && (units -= 3) > -1 && bytes.push(239, 191, 189);
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 6 | 192, 63 & codePoint | 128);
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
          } else {
            if (!(codePoint < 1114112)) throw new Error("Invalid code point");
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
          }
        }
        return bytes;
      }
      function asciiToBytes(str) {
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) byteArray.push(255 & str.charCodeAt(i));
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        var c, hi, lo;
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }
      function blitBuffer(src, dst, offset, length) {
        for (var i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function isnan(val) {
        return val !== val;
      }
    }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {});
  }, {
    "base64-js": 1,
    ieee754: 4,
    isarray: 3
  } ],
  3: [ function(require, module, exports) {
    var toString = {}.toString;
    module.exports = Array.isArray || function(arr) {
      return "[object Array]" == toString.call(arr);
    };
  }, {} ],
  4: [ function(require, module, exports) {
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = 8 * nBytes - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (;nBits > 0; e = 256 * e + buffer[offset + i], i += d, nBits -= 8) ;
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (;nBits > 0; m = 256 * m + buffer[offset + i], i += d, nBits -= 8) ;
      if (0 === e) e = 1 - eBias; else {
        if (e === eMax) return m ? NaN : Infinity * (s ? -1 : 1);
        m += Math.pow(2, mLen);
        e -= eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = 8 * nBytes - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = 23 === mLen ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || 0 === value && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || Infinity === value) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        value += e + eBias >= 1 ? rt / c : rt * Math.pow(2, 1 - eBias);
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e += eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (;mLen >= 8; buffer[offset + i] = 255 & m, i += d, m /= 256, mLen -= 8) ;
      e = e << mLen | m;
      eLen += mLen;
      for (;eLen > 0; buffer[offset + i] = 255 & e, i += d, e /= 256, eLen -= 8) ;
      buffer[offset + i - d] |= 128 * s;
    };
  }, {} ],
  api: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "509f8fI4GlNsKM6Ga/nWU+B", "api");
    "use strict";
    exports.__esModule = true;
    exports["default"] = void 0;
    var _axios = _interopRequireDefault(require("axios"));
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }
      info.done ? resolve(value) : Promise.resolve(value).then(_next, _throw);
    }
    function _asyncToGenerator(fn) {
      return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
          var gen = fn.apply(self, args);
          function _next(value) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }
          function _throw(err) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }
          _next(void 0);
        });
      };
    }
    var BaseUrl = "https://37526sxcj546.vicp.fun";
    var service = _axios["default"].create({
      timeout: 3e4
    });
    function get(_x) {
      return _get.apply(this, arguments);
    }
    function _get() {
      _get = _asyncToGenerator(regeneratorRuntime.mark(function _callee(url) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
           case 0:
            _context.prev = 0;
            _context.next = 3;
            return service.get(url);

           case 3:
            return _context.abrupt("return", _context.sent);

           case 6:
            _context.prev = 6;
            _context.t0 = _context["catch"](0);
            _context.t0.response && console.log(_context.t0.response.data.msg);

           case 9:
           case "end":
            return _context.stop();
          }
        }, _callee, null, [ [ 0, 6 ] ]);
      }));
      return _get.apply(this, arguments);
    }
    function post(_x2, _x3) {
      return _post.apply(this, arguments);
    }
    function _post() {
      _post = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(url, data) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
           case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return service.post(url, data);

           case 3:
            return _context2.abrupt("return", _context2.sent);

           case 6:
            _context2.prev = 6;
            _context2.t0 = _context2["catch"](0);
            _context2.t0.response ? console.log(_context2.t0.response.data.msg) : console.log(_context2.t0.message);

           case 9:
           case "end":
            return _context2.stop();
          }
        }, _callee2, null, [ [ 0, 6 ] ]);
      }));
      return _post.apply(this, arguments);
    }
    function post2(url, data) {
      try {
        return service.post(url, data);
      } catch (error) {
        throw error;
      }
    }
    var _default = {
      get: get,
      post: post,
      post2: post2,
      BaseUrl: BaseUrl
    };
    exports["default"] = _default;
    module.exports = exports["default"];
    cc._RF.pop();
  }, {
    axios: "axios"
  } ],
  axios: [ function(require, module, exports) {
    (function(global, Buffer) {
      "use strict";
      cc._RF.push(module, "900c09dNn5KfZBdXvPOec/J", "axios");
      "use strict";
      !function(e, t) {
        "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).axios = t();
      }(void 0, function() {
        function e(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            t && (n = n.filter(function(t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })), r.push.apply(r, n);
          }
          return r;
        }
        function t(t) {
          for (var r = 1; r < arguments.length; r++) {
            var n = null != arguments[r] ? arguments[r] : {};
            r % 2 ? e(Object(n), !0).forEach(function(e) {
              u(t, e, n[e]);
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : e(Object(n)).forEach(function(e) {
              Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(n, e));
            });
          }
          return t;
        }
        function r() {
          r = function r() {
            return e;
          };
          var e = {}, t = Object.prototype, n = t.hasOwnProperty, o = "function" == typeof Symbol ? Symbol : {}, i = o.iterator || "@@iterator", a = o.asyncIterator || "@@asyncIterator", s = o.toStringTag || "@@toStringTag";
          function u(e, t, r) {
            return Object.defineProperty(e, t, {
              value: r,
              enumerable: !0,
              configurable: !0,
              writable: !0
            }), e[t];
          }
          try {
            u({}, "");
          } catch (e) {
            u = function u(e, t, r) {
              return e[t] = r;
            };
          }
          function c(e, t, r, n) {
            var o = t && t.prototype instanceof h ? t : h, i = Object.create(o.prototype), a = new R(n || []);
            return i._invoke = function(e, t, r) {
              var n = "suspendedStart";
              return function(o, i) {
                if ("executing" === n) throw new Error("Generator is already running");
                if ("completed" === n) {
                  if ("throw" === o) throw i;
                  return j();
                }
                for (r.method = o, r.arg = i; ;) {
                  var a = r.delegate;
                  if (a) {
                    var s = E(a, r);
                    if (s) {
                      if (s === l) continue;
                      return s;
                    }
                  }
                  if ("next" === r.method) r.sent = r._sent = r.arg; else if ("throw" === r.method) {
                    if ("suspendedStart" === n) throw n = "completed", r.arg;
                    r.dispatchException(r.arg);
                  } else "return" === r.method && r.abrupt("return", r.arg);
                  n = "executing";
                  var u = f(e, t, r);
                  if ("normal" === u.type) {
                    if (n = r.done ? "completed" : "suspendedYield", u.arg === l) continue;
                    return {
                      value: u.arg,
                      done: r.done
                    };
                  }
                  "throw" === u.type && (n = "completed", r.method = "throw", r.arg = u.arg);
                }
              };
            }(e, r, a), i;
          }
          function f(e, t, r) {
            try {
              return {
                type: "normal",
                arg: e.call(t, r)
              };
            } catch (e) {
              return {
                type: "throw",
                arg: e
              };
            }
          }
          e.wrap = c;
          var l = {};
          function h() {}
          function d() {}
          function p() {}
          var v = {};
          u(v, i, function() {
            return this;
          });
          var y = Object.getPrototypeOf, m = y && y(y(A([])));
          m && m !== t && n.call(m, i) && (v = m);
          var g = p.prototype = h.prototype = Object.create(v);
          function b(e) {
            [ "next", "throw", "return" ].forEach(function(t) {
              u(e, t, function(e) {
                return this._invoke(t, e);
              });
            });
          }
          function w(e, t) {
            function r(o, i, a, s) {
              var u = f(e[o], e, i);
              if ("throw" !== u.type) {
                var c = u.arg, l = c.value;
                return l && "object" == typeof l && n.call(l, "__await") ? t.resolve(l.__await).then(function(e) {
                  r("next", e, a, s);
                }, function(e) {
                  r("throw", e, a, s);
                }) : t.resolve(l).then(function(e) {
                  c.value = e, a(c);
                }, function(e) {
                  return r("throw", e, a, s);
                });
              }
              s(u.arg);
            }
            var o;
            this._invoke = function(e, n) {
              function i() {
                return new t(function(t, o) {
                  r(e, n, t, o);
                });
              }
              return o = o ? o.then(i, i) : i();
            };
          }
          function E(e, t) {
            var r = e.iterator[t.method];
            if (void 0 === r) {
              if (t.delegate = null, "throw" === t.method) {
                if (e.iterator["return"] && (t.method = "return", t.arg = void 0, E(e, t), "throw" === t.method)) return l;
                t.method = "throw", t.arg = new TypeError("The iterator does not provide a 'throw' method");
              }
              return l;
            }
            var n = f(r, e.iterator, t.arg);
            if ("throw" === n.type) return t.method = "throw", t.arg = n.arg, t.delegate = null, 
            l;
            var o = n.arg;
            return o ? o.done ? (t[e.resultName] = o.value, t.next = e.nextLoc, "return" !== t.method && (t.method = "next", 
            t.arg = void 0), t.delegate = null, l) : o : (t.method = "throw", t.arg = new TypeError("iterator result is not an object"), 
            t.delegate = null, l);
          }
          function O(e) {
            var t = {
              tryLoc: e[0]
            };
            1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), 
            this.tryEntries.push(t);
          }
          function S(e) {
            var t = e.completion || {};
            t.type = "normal", delete t.arg, e.completion = t;
          }
          function R(e) {
            this.tryEntries = [ {
              tryLoc: "root"
            } ], e.forEach(O, this), this.reset(!0);
          }
          function A(e) {
            if (e) {
              var t = e[i];
              if (t) return t.call(e);
              if ("function" == typeof e.next) return e;
              if (!isNaN(e.length)) {
                var r = -1, o = function t() {
                  for (;++r < e.length; ) if (n.call(e, r)) return t.value = e[r], t.done = !1, t;
                  return t.value = void 0, t.done = !0, t;
                };
                return o.next = o;
              }
            }
            return {
              next: j
            };
          }
          function j() {
            return {
              value: void 0,
              done: !0
            };
          }
          return d.prototype = p, u(g, "constructor", p), u(p, "constructor", d), d.displayName = u(p, s, "GeneratorFunction"), 
          e.isGeneratorFunction = function(e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === d || "GeneratorFunction" === (t.displayName || t.name));
          }, e.mark = function(e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, p) : (e.__proto__ = p, u(e, s, "GeneratorFunction")), 
            e.prototype = Object.create(g), e;
          }, e.awrap = function(e) {
            return {
              __await: e
            };
          }, b(w.prototype), u(w.prototype, a, function() {
            return this;
          }), e.AsyncIterator = w, e.async = function(t, r, n, o, i) {
            void 0 === i && (i = Promise);
            var a = new w(c(t, r, n, o), i);
            return e.isGeneratorFunction(r) ? a : a.next().then(function(e) {
              return e.done ? e.value : a.next();
            });
          }, b(g), u(g, s, "Generator"), u(g, i, function() {
            return this;
          }), u(g, "toString", function() {
            return "[object Generator]";
          }), e.keys = function(e) {
            var t = [];
            for (var r in e) t.push(r);
            return t.reverse(), function r() {
              for (;t.length; ) {
                var n = t.pop();
                if (n in e) return r.value = n, r.done = !1, r;
              }
              return r.done = !0, r;
            };
          }, e.values = A, R.prototype = {
            constructor: R,
            reset: function reset(e) {
              if (this.prev = 0, this.next = 0, this.sent = this._sent = void 0, this.done = !1, 
              this.delegate = null, this.method = "next", this.arg = void 0, this.tryEntries.forEach(S), 
              !e) for (var t in this) "t" === t.charAt(0) && n.call(this, t) && !isNaN(+t.slice(1)) && (this[t] = void 0);
            },
            stop: function stop() {
              this.done = !0;
              var e = this.tryEntries[0].completion;
              if ("throw" === e.type) throw e.arg;
              return this.rval;
            },
            dispatchException: function dispatchException(e) {
              if (this.done) throw e;
              var t = this;
              function r(r, n) {
                return a.type = "throw", a.arg = e, t.next = r, n && (t.method = "next", t.arg = void 0), 
                !!n;
              }
              for (var o = this.tryEntries.length - 1; o >= 0; --o) {
                var i = this.tryEntries[o], a = i.completion;
                if ("root" === i.tryLoc) return r("end");
                if (i.tryLoc <= this.prev) {
                  var s = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc");
                  if (s && u) {
                    if (this.prev < i.catchLoc) return r(i.catchLoc, !0);
                    if (this.prev < i.finallyLoc) return r(i.finallyLoc);
                  } else if (s) {
                    if (this.prev < i.catchLoc) return r(i.catchLoc, !0);
                  } else {
                    if (!u) throw new Error("try statement without catch or finally");
                    if (this.prev < i.finallyLoc) return r(i.finallyLoc);
                  }
                }
              }
            },
            abrupt: function abrupt(e, t) {
              for (var r = this.tryEntries.length - 1; r >= 0; --r) {
                var o = this.tryEntries[r];
                if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
                  var i = o;
                  break;
                }
              }
              i && ("break" === e || "continue" === e) && i.tryLoc <= t && t <= i.finallyLoc && (i = null);
              var a = i ? i.completion : {};
              return a.type = e, a.arg = t, i ? (this.method = "next", this.next = i.finallyLoc, 
              l) : this.complete(a);
            },
            complete: function complete(e, t) {
              if ("throw" === e.type) throw e.arg;
              return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, 
              this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), 
              l;
            },
            finish: function finish(e) {
              for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                var r = this.tryEntries[t];
                if (r.finallyLoc === e) return this.complete(r.completion, r.afterLoc), S(r), l;
              }
            },
            catch: function _catch(e) {
              for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                var r = this.tryEntries[t];
                if (r.tryLoc === e) {
                  var n = r.completion;
                  if ("throw" === n.type) {
                    var o = n.arg;
                    S(r);
                  }
                  return o;
                }
              }
              throw new Error("illegal catch attempt");
            },
            delegateYield: function delegateYield(e, t, r) {
              return this.delegate = {
                iterator: A(e),
                resultName: t,
                nextLoc: r
              }, "next" === this.method && (this.arg = void 0), l;
            }
          }, e;
        }
        function n(e) {
          return n = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e;
          } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
          }, n(e);
        }
        function o(e, t, r, n, o, i, a) {
          try {
            var s = e[i](a), u = s.value;
          } catch (e) {
            return void r(e);
          }
          s.done ? t(u) : Promise.resolve(u).then(n, o);
        }
        function i(e, t) {
          if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
        }
        function a(e, t) {
          for (var r = 0; r < t.length; r++) {
            var n = t[r];
            n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), 
            Object.defineProperty(e, n.key, n);
          }
        }
        function s(e, t, r) {
          return t && a(e.prototype, t), r && a(e, r), Object.defineProperty(e, "prototype", {
            writable: !1
          }), e;
        }
        function u(e, t, r) {
          return t in e ? Object.defineProperty(e, t, {
            value: r,
            enumerable: !0,
            configurable: !0,
            writable: !0
          }) : e[t] = r, e;
        }
        function c(e, t) {
          return l(e) || function(e, t) {
            var r = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (null == r) return;
            var n, o, i = [], a = !0, s = !1;
            try {
              for (r = r.call(e); !(a = (n = r.next()).done) && (i.push(n.value), !t || i.length !== t); a = !0) ;
            } catch (e) {
              s = !0, o = e;
            } finally {
              try {
                a || null == r["return"] || r["return"]();
              } finally {
                if (s) throw o;
              }
            }
            return i;
          }(e, t) || d(e, t) || v();
        }
        function f(e) {
          return function(e) {
            if (Array.isArray(e)) return p(e);
          }(e) || h(e) || d(e) || function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
          }();
        }
        function l(e) {
          if (Array.isArray(e)) return e;
        }
        function h(e) {
          if ("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"]) return Array.from(e);
        }
        function d(e, t) {
          if (e) {
            if ("string" == typeof e) return p(e, t);
            var r = Object.prototype.toString.call(e).slice(8, -1);
            return "Object" === r && e.constructor && (r = e.constructor.name), "Map" === r || "Set" === r ? Array.from(e) : "Arguments" === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? p(e, t) : void 0;
          }
        }
        function p(e, t) {
          (null == t || t > e.length) && (t = e.length);
          for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
          return n;
        }
        function v() {
          throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }
        function y(e, t) {
          return function() {
            return e.apply(t, arguments);
          };
        }
        var m, g = Object.prototype.toString, b = Object.getPrototypeOf, w = (m = Object.create(null), 
        function(e) {
          var t = g.call(e);
          return m[t] || (m[t] = t.slice(8, -1).toLowerCase());
        }), E = function E(e) {
          return e = e.toLowerCase(), function(t) {
            return w(t) === e;
          };
        }, O = function O(e) {
          return function(t) {
            return n(t) === e;
          };
        }, S = Array.isArray, R = O("undefined");
        var A = E("ArrayBuffer");
        var j = O("string"), x = O("function"), T = O("number"), P = function P(e) {
          return null !== e && "object" === n(e);
        }, N = function N(e) {
          if ("object" !== w(e)) return !1;
          var t = b(e);
          return !(null !== t && t !== Object.prototype && null !== Object.getPrototypeOf(t) || Symbol.toStringTag in e || Symbol.iterator in e);
        }, k = E("Date"), _ = E("File"), L = E("Blob"), C = E("FileList"), F = E("URLSearchParams");
        function U(e, t) {
          var r, o, i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, a = i.allOwnKeys, s = void 0 !== a && a;
          if (null != e) if ("object" !== n(e) && (e = [ e ]), S(e)) for (r = 0, o = e.length; r < o; r++) t.call(null, e[r], r, e); else {
            var u, c = s ? Object.getOwnPropertyNames(e) : Object.keys(e), f = c.length;
            for (r = 0; r < f; r++) u = c[r], t.call(null, e[u], u, e);
          }
        }
        function D(e, t) {
          t = t.toLowerCase();
          for (var r, n = Object.keys(e), o = n.length; o-- > 0; ) if (t === (r = n[o]).toLowerCase()) return r;
          return null;
        }
        var B = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : "undefined" != typeof window ? window : global, I = function I(e) {
          return !R(e) && e !== B;
        };
        var q, z = (q = "undefined" != typeof Uint8Array && b(Uint8Array), function(e) {
          return q && e instanceof q;
        }), M = E("HTMLFormElement"), H = function(e) {
          var t = Object.prototype.hasOwnProperty;
          return function(e, r) {
            return t.call(e, r);
          };
        }(), J = E("RegExp"), G = function G(e, t) {
          var r = Object.getOwnPropertyDescriptors(e), n = {};
          U(r, function(r, o) {
            var i;
            !1 !== (i = t(r, o, e)) && (n[o] = i || r);
          }), Object.defineProperties(e, n);
        }, W = "abcdefghijklmnopqrstuvwxyz", K = "0123456789", V = {
          DIGIT: K,
          ALPHA: W,
          ALPHA_DIGIT: W + W.toUpperCase() + K
        };
        var X = E("AsyncFunction"), $ = {
          isArray: S,
          isArrayBuffer: A,
          isBuffer: function isBuffer(e) {
            return null !== e && !R(e) && null !== e.constructor && !R(e.constructor) && x(e.constructor.isBuffer) && e.constructor.isBuffer(e);
          },
          isFormData: function isFormData(e) {
            var t;
            return e && ("function" == typeof FormData && e instanceof FormData || x(e.append) && ("formdata" === (t = w(e)) || "object" === t && x(e.toString) && "[object FormData]" === e.toString()));
          },
          isArrayBufferView: function isArrayBufferView(e) {
            return "undefined" != typeof ArrayBuffer && ArrayBuffer.isView ? ArrayBuffer.isView(e) : e && e.buffer && A(e.buffer);
          },
          isString: j,
          isNumber: T,
          isBoolean: function isBoolean(e) {
            return !0 === e || !1 === e;
          },
          isObject: P,
          isPlainObject: N,
          isUndefined: R,
          isDate: k,
          isFile: _,
          isBlob: L,
          isRegExp: J,
          isFunction: x,
          isStream: function isStream(e) {
            return P(e) && x(e.pipe);
          },
          isURLSearchParams: F,
          isTypedArray: z,
          isFileList: C,
          forEach: U,
          merge: function e() {
            for (var t = I(this) && this || {}, r = t.caseless, n = {}, o = function o(t, _o) {
              var i = r && D(n, _o) || _o;
              N(n[i]) && N(t) ? n[i] = e(n[i], t) : N(t) ? n[i] = e({}, t) : S(t) ? n[i] = t.slice() : n[i] = t;
            }, i = 0, a = arguments.length; i < a; i++) arguments[i] && U(arguments[i], o);
            return n;
          },
          extend: function extend(e, t, r) {
            var n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {}, o = n.allOwnKeys;
            return U(t, function(t, n) {
              r && x(t) ? e[n] = y(t, r) : e[n] = t;
            }, {
              allOwnKeys: o
            }), e;
          },
          trim: function trim(e) {
            return e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
          },
          stripBOM: function stripBOM(e) {
            return 65279 === e.charCodeAt(0) && (e = e.slice(1)), e;
          },
          inherits: function inherits(e, t, r, n) {
            e.prototype = Object.create(t.prototype, n), e.prototype.constructor = e, Object.defineProperty(e, "super", {
              value: t.prototype
            }), r && Object.assign(e.prototype, r);
          },
          toFlatObject: function toFlatObject(e, t, r, n) {
            var o, i, a, s = {};
            if (t = t || {}, null == e) return t;
            do {
              for (i = (o = Object.getOwnPropertyNames(e)).length; i-- > 0; ) a = o[i], n && !n(a, e, t) || s[a] || (t[a] = e[a], 
              s[a] = !0);
              e = !1 !== r && b(e);
            } while (e && (!r || r(e, t)) && e !== Object.prototype);
            return t;
          },
          kindOf: w,
          kindOfTest: E,
          endsWith: function endsWith(e, t, r) {
            e = String(e), (void 0 === r || r > e.length) && (r = e.length), r -= t.length;
            var n = e.indexOf(t, r);
            return -1 !== n && n === r;
          },
          toArray: function toArray(e) {
            if (!e) return null;
            if (S(e)) return e;
            var t = e.length;
            if (!T(t)) return null;
            for (var r = new Array(t); t-- > 0; ) r[t] = e[t];
            return r;
          },
          forEachEntry: function forEachEntry(e, t) {
            for (var r, n = (e && e[Symbol.iterator]).call(e); (r = n.next()) && !r.done; ) {
              var o = r.value;
              t.call(e, o[0], o[1]);
            }
          },
          matchAll: function matchAll(e, t) {
            for (var r, n = []; null !== (r = e.exec(t)); ) n.push(r);
            return n;
          },
          isHTMLForm: M,
          hasOwnProperty: H,
          hasOwnProp: H,
          reduceDescriptors: G,
          freezeMethods: function freezeMethods(e) {
            G(e, function(t, r) {
              if (x(e) && -1 !== [ "arguments", "caller", "callee" ].indexOf(r)) return !1;
              var n = e[r];
              x(n) && (t.enumerable = !1, "writable" in t ? t.writable = !1 : t.set || (t.set = function() {
                throw Error("Can not rewrite read-only method '" + r + "'");
              }));
            });
          },
          toObjectSet: function toObjectSet(e, t) {
            var r = {}, n = function n(e) {
              e.forEach(function(e) {
                r[e] = !0;
              });
            };
            return S(e) ? n(e) : n(String(e).split(t)), r;
          },
          toCamelCase: function toCamelCase(e) {
            return e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(e, t, r) {
              return t.toUpperCase() + r;
            });
          },
          noop: function noop() {},
          toFiniteNumber: function toFiniteNumber(e, t) {
            return e = +e, Number.isFinite(e) ? e : t;
          },
          findKey: D,
          global: B,
          isContextDefined: I,
          ALPHABET: V,
          generateString: function generateString() {
            for (var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 16, t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : V.ALPHA_DIGIT, r = "", n = t.length; e--; ) r += t[Math.random() * n | 0];
            return r;
          },
          isSpecCompliantForm: function isSpecCompliantForm(e) {
            return !!(e && x(e.append) && "FormData" === e[Symbol.toStringTag] && e[Symbol.iterator]);
          },
          toJSONObject: function toJSONObject(e) {
            var t = new Array(10);
            return function e(r, n) {
              if (P(r)) {
                if (t.indexOf(r) >= 0) return;
                if (!("toJSON" in r)) {
                  t[n] = r;
                  var o = S(r) ? [] : {};
                  return U(r, function(t, r) {
                    var i = e(t, n + 1);
                    !R(i) && (o[r] = i);
                  }), t[n] = void 0, o;
                }
              }
              return r;
            }(e, 0);
          },
          isAsyncFn: X,
          isThenable: function isThenable(e) {
            return e && (P(e) || x(e)) && x(e.then) && x(e["catch"]);
          }
        };
        function Q(e, t, r, n, o) {
          Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, 
          this.message = e, this.name = "AxiosError", t && (this.code = t), r && (this.config = r), 
          n && (this.request = n), o && (this.response = o);
        }
        $.inherits(Q, Error, {
          toJSON: function toJSON() {
            return {
              message: this.message,
              name: this.name,
              description: this.description,
              number: this.number,
              fileName: this.fileName,
              lineNumber: this.lineNumber,
              columnNumber: this.columnNumber,
              stack: this.stack,
              config: $.toJSONObject(this.config),
              code: this.code,
              status: this.response && this.response.status ? this.response.status : null
            };
          }
        });
        var Y = Q.prototype, Z = {};
        [ "ERR_BAD_OPTION_VALUE", "ERR_BAD_OPTION", "ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK", "ERR_FR_TOO_MANY_REDIRECTS", "ERR_DEPRECATED", "ERR_BAD_RESPONSE", "ERR_BAD_REQUEST", "ERR_CANCELED", "ERR_NOT_SUPPORT", "ERR_INVALID_URL" ].forEach(function(e) {
          Z[e] = {
            value: e
          };
        }), Object.defineProperties(Q, Z), Object.defineProperty(Y, "isAxiosError", {
          value: !0
        }), Q.from = function(e, t, r, n, o, i) {
          var a = Object.create(Y);
          return $.toFlatObject(e, a, function(e) {
            return e !== Error.prototype;
          }, function(e) {
            return "isAxiosError" !== e;
          }), Q.call(a, e.message, t, r, n, o), a.cause = e, a.name = e.name, i && Object.assign(a, i), 
          a;
        };
        function ee(e) {
          return $.isPlainObject(e) || $.isArray(e);
        }
        function te(e) {
          return $.endsWith(e, "[]") ? e.slice(0, -2) : e;
        }
        function re(e, t, r) {
          return e ? e.concat(t).map(function(e, t) {
            return e = te(e), !r && t ? "[" + e + "]" : e;
          }).join(r ? "." : "") : t;
        }
        var ne = $.toFlatObject($, {}, null, function(e) {
          return /^is[A-Z]/.test(e);
        });
        function oe(e, t, r) {
          if (!$.isObject(e)) throw new TypeError("target must be an object");
          t = t || new FormData();
          var o = (r = $.toFlatObject(r, {
            metaTokens: !0,
            dots: !1,
            indexes: !1
          }, !1, function(e, t) {
            return !$.isUndefined(t[e]);
          })).metaTokens, i = r.visitor || f, a = r.dots, s = r.indexes, u = (r.Blob || "undefined" != typeof Blob && Blob) && $.isSpecCompliantForm(t);
          if (!$.isFunction(i)) throw new TypeError("visitor must be a function");
          function c(e) {
            if (null === e) return "";
            if ($.isDate(e)) return e.toISOString();
            if (!u && $.isBlob(e)) throw new Q("Blob is not supported. Use a Buffer instead.");
            return $.isArrayBuffer(e) || $.isTypedArray(e) ? u && "function" == typeof Blob ? new Blob([ e ]) : Buffer.from(e) : e;
          }
          function f(e, r, i) {
            var u = e;
            if (e && !i && "object" === n(e)) if ($.endsWith(r, "{}")) r = o ? r : r.slice(0, -2), 
            e = JSON.stringify(e); else if ($.isArray(e) && function(e) {
              return $.isArray(e) && !e.some(ee);
            }(e) || ($.isFileList(e) || $.endsWith(r, "[]")) && (u = $.toArray(e))) return r = te(r), 
            u.forEach(function(e, n) {
              !$.isUndefined(e) && null !== e && t.append(!0 === s ? re([ r ], n, a) : null === s ? r : r + "[]", c(e));
            }), !1;
            return !!ee(e) || (t.append(re(i, r, a), c(e)), !1);
          }
          var l = [], h = Object.assign(ne, {
            defaultVisitor: f,
            convertValue: c,
            isVisitable: ee
          });
          if (!$.isObject(e)) throw new TypeError("data must be an object");
          return function e(r, n) {
            if (!$.isUndefined(r)) {
              if (-1 !== l.indexOf(r)) throw Error("Circular reference detected in " + n.join("."));
              l.push(r), $.forEach(r, function(r, o) {
                !0 === (!($.isUndefined(r) || null === r) && i.call(t, r, $.isString(o) ? o.trim() : o, n, h)) && e(r, n ? n.concat(o) : [ o ]);
              }), l.pop();
            }
          }(e), t;
        }
        function ie(e) {
          var t = {
            "!": "%21",
            "'": "%27",
            "(": "%28",
            ")": "%29",
            "~": "%7E",
            "%20": "+",
            "%00": "\0"
          };
          return encodeURIComponent(e).replace(/[!'()~]|%20|%00/g, function(e) {
            return t[e];
          });
        }
        function ae(e, t) {
          this._pairs = [], e && oe(e, this, t);
        }
        var se = ae.prototype;
        function ue(e) {
          return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
        }
        function ce(e, t, r) {
          if (!t) return e;
          var n, o = r && r.encode || ue, i = r && r.serialize;
          if (n = i ? i(t, r) : $.isURLSearchParams(t) ? t.toString() : new ae(t, r).toString(o)) {
            var a = e.indexOf("#");
            -1 !== a && (e = e.slice(0, a)), e += (-1 === e.indexOf("?") ? "?" : "&") + n;
          }
          return e;
        }
        se.append = function(e, t) {
          this._pairs.push([ e, t ]);
        }, se.toString = function(e) {
          var t = e ? function(t) {
            return e.call(this, t, ie);
          } : ie;
          return this._pairs.map(function(e) {
            return t(e[0]) + "=" + t(e[1]);
          }, "").join("&");
        };
        var fe, le = function() {
          function e() {
            i(this, e), this.handlers = [];
          }
          return s(e, [ {
            key: "use",
            value: function value(e, t, r) {
              return this.handlers.push({
                fulfilled: e,
                rejected: t,
                synchronous: !!r && r.synchronous,
                runWhen: r ? r.runWhen : null
              }), this.handlers.length - 1;
            }
          }, {
            key: "eject",
            value: function value(e) {
              this.handlers[e] && (this.handlers[e] = null);
            }
          }, {
            key: "clear",
            value: function value() {
              this.handlers && (this.handlers = []);
            }
          }, {
            key: "forEach",
            value: function value(e) {
              $.forEach(this.handlers, function(t) {
                null !== t && e(t);
              });
            }
          } ]), e;
        }(), he = {
          silentJSONParsing: !0,
          forcedJSONParsing: !0,
          clarifyTimeoutError: !1
        }, de = {
          isBrowser: !0,
          classes: {
            URLSearchParams: "undefined" != typeof URLSearchParams ? URLSearchParams : ae,
            FormData: "undefined" != typeof FormData ? FormData : null,
            Blob: "undefined" != typeof Blob ? Blob : null
          },
          protocols: [ "http", "https", "file", "blob", "url", "data" ]
        }, pe = "undefined" != typeof window && "undefined" != typeof document, ve = (fe = "undefined" != typeof navigator && navigator.product, 
        pe && [ "ReactNative", "NativeScript", "NS" ].indexOf(fe) < 0), ye = "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && "function" == typeof self.importScripts, me = t(t({}, Object.freeze({
          __proto__: null,
          hasBrowserEnv: pe,
          hasStandardBrowserWebWorkerEnv: ye,
          hasStandardBrowserEnv: ve
        })), de);
        function ge(e) {
          function t(e, r, n, o) {
            var i = e[o++];
            if ("__proto__" === i) return !0;
            var a = Number.isFinite(+i), s = o >= e.length;
            return i = !i && $.isArray(n) ? n.length : i, s ? ($.hasOwnProp(n, i) ? n[i] = [ n[i], r ] : n[i] = r, 
            !a) : (n[i] && $.isObject(n[i]) || (n[i] = []), t(e, r, n[i], o) && $.isArray(n[i]) && (n[i] = function(e) {
              var t, r, n = {}, o = Object.keys(e), i = o.length;
              for (t = 0; t < i; t++) n[r = o[t]] = e[r];
              return n;
            }(n[i])), !a);
          }
          if ($.isFormData(e) && $.isFunction(e.entries)) {
            var r = {};
            return $.forEachEntry(e, function(e, n) {
              t(function(e) {
                return $.matchAll(/\w+|\[(\w*)]/g, e).map(function(e) {
                  return "[]" === e[0] ? "" : e[1] || e[0];
                });
              }(e), n, r, 0);
            }), r;
          }
          return null;
        }
        var be = {
          transitional: he,
          adapter: [ "xhr", "http" ],
          transformRequest: [ function(e, t) {
            var r, n = t.getContentType() || "", o = n.indexOf("application/json") > -1, i = $.isObject(e);
            if (i && $.isHTMLForm(e) && (e = new FormData(e)), $.isFormData(e)) return o ? JSON.stringify(ge(e)) : e;
            if ($.isArrayBuffer(e) || $.isBuffer(e) || $.isStream(e) || $.isFile(e) || $.isBlob(e)) return e;
            if ($.isArrayBufferView(e)) return e.buffer;
            if ($.isURLSearchParams(e)) return t.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), 
            e.toString();
            if (i) {
              if (n.indexOf("application/x-www-form-urlencoded") > -1) return function(e, t) {
                return oe(e, new me.classes.URLSearchParams(), Object.assign({
                  visitor: function visitor(e, t, r, n) {
                    return me.isNode && $.isBuffer(e) ? (this.append(t, e.toString("base64")), !1) : n.defaultVisitor.apply(this, arguments);
                  }
                }, t));
              }(e, this.formSerializer).toString();
              if ((r = $.isFileList(e)) || n.indexOf("multipart/form-data") > -1) {
                var a = this.env && this.env.FormData;
                return oe(r ? {
                  "files[]": e
                } : e, a && new a(), this.formSerializer);
              }
            }
            return i || o ? (t.setContentType("application/json", !1), function(e, t, r) {
              if ($.isString(e)) try {
                return (t || JSON.parse)(e), $.trim(e);
              } catch (e) {
                if ("SyntaxError" !== e.name) throw e;
              }
              return (r || JSON.stringify)(e);
            }(e)) : e;
          } ],
          transformResponse: [ function(e) {
            var t = this.transitional || be.transitional, r = t && t.forcedJSONParsing, n = "json" === this.responseType;
            if (e && $.isString(e) && (r && !this.responseType || n)) {
              var o = !(t && t.silentJSONParsing) && n;
              try {
                return JSON.parse(e);
              } catch (e) {
                if (o) {
                  if ("SyntaxError" === e.name) throw Q.from(e, Q.ERR_BAD_RESPONSE, this, null, this.response);
                  throw e;
                }
              }
            }
            return e;
          } ],
          timeout: 0,
          xsrfCookieName: "XSRF-TOKEN",
          xsrfHeaderName: "X-XSRF-TOKEN",
          maxContentLength: -1,
          maxBodyLength: -1,
          env: {
            FormData: me.classes.FormData,
            Blob: me.classes.Blob
          },
          validateStatus: function validateStatus(e) {
            return e >= 200 && e < 300;
          },
          headers: {
            common: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": void 0
            }
          }
        };
        $.forEach([ "delete", "get", "head", "post", "put", "patch" ], function(e) {
          be.headers[e] = {};
        });
        var we = be, Ee = $.toObjectSet([ "age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent" ]), Oe = Symbol("internals");
        function Se(e) {
          return e && String(e).trim().toLowerCase();
        }
        function Re(e) {
          return !1 === e || null == e ? e : $.isArray(e) ? e.map(Re) : String(e);
        }
        function Ae(e, t, r, n, o) {
          return $.isFunction(n) ? n.call(this, t, r) : (o && (t = r), $.isString(t) ? $.isString(n) ? -1 !== t.indexOf(n) : $.isRegExp(n) ? n.test(t) : void 0 : void 0);
        }
        var je = function(e, t) {
          function r(e) {
            i(this, r), e && this.set(e);
          }
          return s(r, [ {
            key: "set",
            value: function value(e, t, r) {
              var n = this;
              function o(e, t, r) {
                var o = Se(t);
                if (!o) throw new Error("header name must be a non-empty string");
                var i = $.findKey(n, o);
                (!i || void 0 === n[i] || !0 === r || void 0 === r && !1 !== n[i]) && (n[i || t] = Re(e));
              }
              var i, a, s, u, c, f = function f(e, t) {
                return $.forEach(e, function(e, r) {
                  return o(e, r, t);
                });
              };
              return $.isPlainObject(e) || e instanceof this.constructor ? f(e, t) : $.isString(e) && (e = e.trim()) && !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim()) ? f((c = {}, 
              (i = e) && i.split("\n").forEach(function(e) {
                u = e.indexOf(":"), a = e.substring(0, u).trim().toLowerCase(), s = e.substring(u + 1).trim(), 
                !a || c[a] && Ee[a] || ("set-cookie" === a ? c[a] ? c[a].push(s) : c[a] = [ s ] : c[a] = c[a] ? c[a] + ", " + s : s);
              }), c), t) : null != e && o(t, e, r), this;
            }
          }, {
            key: "get",
            value: function value(e, t) {
              if (e = Se(e)) {
                var r = $.findKey(this, e);
                if (r) {
                  var n = this[r];
                  if (!t) return n;
                  if (!0 === t) return function(e) {
                    for (var t, r = Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g; t = n.exec(e); ) r[t[1]] = t[2];
                    return r;
                  }(n);
                  if ($.isFunction(t)) return t.call(this, n, r);
                  if ($.isRegExp(t)) return t.exec(n);
                  throw new TypeError("parser must be boolean|regexp|function");
                }
              }
            }
          }, {
            key: "has",
            value: function value(e, t) {
              if (e = Se(e)) {
                var r = $.findKey(this, e);
                return !(!r || void 0 === this[r] || t && !Ae(0, this[r], r, t));
              }
              return !1;
            }
          }, {
            key: "delete",
            value: function value(e, t) {
              var r = this, n = !1;
              function o(e) {
                if (e = Se(e)) {
                  var o = $.findKey(r, e);
                  !o || t && !Ae(0, r[o], o, t) || (delete r[o], n = !0);
                }
              }
              return $.isArray(e) ? e.forEach(o) : o(e), n;
            }
          }, {
            key: "clear",
            value: function value(e) {
              for (var t = Object.keys(this), r = t.length, n = !1; r--; ) {
                var o = t[r];
                e && !Ae(0, this[o], o, e, !0) || (delete this[o], n = !0);
              }
              return n;
            }
          }, {
            key: "normalize",
            value: function value(e) {
              var t = this, r = {};
              return $.forEach(this, function(n, o) {
                var i = $.findKey(r, o);
                if (i) return t[i] = Re(n), void delete t[o];
                var a = e ? function(e) {
                  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, function(e, t, r) {
                    return t.toUpperCase() + r;
                  });
                }(o) : String(o).trim();
                a !== o && delete t[o], t[a] = Re(n), r[a] = !0;
              }), this;
            }
          }, {
            key: "concat",
            value: function value() {
              for (var e, t = arguments.length, r = new Array(t), n = 0; n < t; n++) r[n] = arguments[n];
              return (e = this.constructor).concat.apply(e, [ this ].concat(r));
            }
          }, {
            key: "toJSON",
            value: function value(e) {
              var t = Object.create(null);
              return $.forEach(this, function(r, n) {
                null != r && !1 !== r && (t[n] = e && $.isArray(r) ? r.join(", ") : r);
              }), t;
            }
          }, {
            key: Symbol.iterator,
            value: function value() {
              return Object.entries(this.toJSON())[Symbol.iterator]();
            }
          }, {
            key: "toString",
            value: function value() {
              return Object.entries(this.toJSON()).map(function(e) {
                var t = c(e, 2);
                return t[0] + ": " + t[1];
              }).join("\n");
            }
          }, {
            key: Symbol.toStringTag,
            get: function get() {
              return "AxiosHeaders";
            }
          } ], [ {
            key: "from",
            value: function value(e) {
              return e instanceof this ? e : new this(e);
            }
          }, {
            key: "concat",
            value: function value(e) {
              for (var t = new this(e), r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), o = 1; o < r; o++) n[o - 1] = arguments[o];
              return n.forEach(function(e) {
                return t.set(e);
              }), t;
            }
          }, {
            key: "accessor",
            value: function value(e) {
              var t = (this[Oe] = this[Oe] = {
                accessors: {}
              }).accessors, r = this.prototype;
              function n(e) {
                var n = Se(e);
                t[n] || (!function(e, t) {
                  var r = $.toCamelCase(" " + t);
                  [ "get", "set", "has" ].forEach(function(n) {
                    Object.defineProperty(e, n + r, {
                      value: function value(e, r, o) {
                        return this[n].call(this, t, e, r, o);
                      },
                      configurable: !0
                    });
                  });
                }(r, e), t[n] = !0);
              }
              return $.isArray(e) ? e.forEach(n) : n(e), this;
            }
          } ]), r;
        }();
        je.accessor([ "Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization" ]), 
        $.reduceDescriptors(je.prototype, function(e, t) {
          var r = e.value, n = t[0].toUpperCase() + t.slice(1);
          return {
            get: function get() {
              return r;
            },
            set: function set(e) {
              this[n] = e;
            }
          };
        }), $.freezeMethods(je);
        var xe = je;
        function Te(e, t) {
          var r = this || we, n = t || r, o = xe.from(n.headers), i = n.data;
          return $.forEach(e, function(e) {
            i = e.call(r, i, o.normalize(), t ? t.status : void 0);
          }), o.normalize(), i;
        }
        function Pe(e) {
          return !(!e || !e.__CANCEL__);
        }
        function Ne(e, t, r) {
          Q.call(this, null == e ? "canceled" : e, Q.ERR_CANCELED, t, r), this.name = "CanceledError";
        }
        $.inherits(Ne, Q, {
          __CANCEL__: !0
        });
        var ke = me.hasStandardBrowserEnv ? {
          write: function write(e, t, r, n, o, i) {
            var a = [ e + "=" + encodeURIComponent(t) ];
            $.isNumber(r) && a.push("expires=" + new Date(r).toGMTString()), $.isString(n) && a.push("path=" + n), 
            $.isString(o) && a.push("domain=" + o), !0 === i && a.push("secure"), document.cookie = a.join("; ");
          },
          read: function read(e) {
            var t = document.cookie.match(new RegExp("(^|;\\s*)(" + e + ")=([^;]*)"));
            return t ? decodeURIComponent(t[3]) : null;
          },
          remove: function remove(e) {
            this.write(e, "", Date.now() - 864e5);
          }
        } : {
          write: function write() {},
          read: function read() {
            return null;
          },
          remove: function remove() {}
        };
        function _e(e, t) {
          return e && !/^([a-z][a-z\d+\-.]*:)?\/\//i.test(t) ? function(e, t) {
            return t ? e.replace(/\/?\/$/, "") + "/" + t.replace(/^\/+/, "") : e;
          }(e, t) : t;
        }
        var Le = me.hasStandardBrowserEnv ? function() {
          var e, t = /(msie|trident)/i.test(navigator.userAgent), r = document.createElement("a");
          function n(e) {
            var n = e;
            return t && (r.setAttribute("href", n), n = r.href), r.setAttribute("href", n), 
            {
              href: r.href,
              protocol: r.protocol ? r.protocol.replace(/:$/, "") : "",
              host: r.host,
              search: r.search ? r.search.replace(/^\?/, "") : "",
              hash: r.hash ? r.hash.replace(/^#/, "") : "",
              hostname: r.hostname,
              port: r.port,
              pathname: "/" === r.pathname.charAt(0) ? r.pathname : "/" + r.pathname
            };
          }
          return e = n(window.location.href), function(t) {
            var r = $.isString(t) ? n(t) : t;
            return r.protocol === e.protocol && r.host === e.host;
          };
        }() : function() {
          return !0;
        };
        function Ce(e, t) {
          var r = 0, n = function(e, t) {
            e = e || 10;
            var r, n = new Array(e), o = new Array(e), i = 0, a = 0;
            return t = void 0 !== t ? t : 1e3, function(s) {
              var u = Date.now(), c = o[a];
              r || (r = u), n[i] = s, o[i] = u;
              for (var f = a, l = 0; f !== i; ) l += n[f++], f %= e;
              if ((i = (i + 1) % e) === a && (a = (a + 1) % e), !(u - r < t)) {
                var h = c && u - c;
                return h ? Math.round(1e3 * l / h) : void 0;
              }
            };
          }(50, 250);
          return function(o) {
            var i = o.loaded, a = o.lengthComputable ? o.total : void 0, s = i - r, u = n(s);
            r = i;
            var c = {
              loaded: i,
              total: a,
              progress: a ? i / a : void 0,
              bytes: s,
              rate: u || void 0,
              estimated: u && a && i <= a ? (a - i) / u : void 0,
              event: o
            };
            c[t ? "download" : "upload"] = !0, e(c);
          };
        }
        var Fe = {
          http: null,
          xhr: "undefined" != typeof XMLHttpRequest && function(e) {
            return new Promise(function(t, r) {
              var n, o, i, a = e.data, s = xe.from(e.headers).normalize(), u = e.responseType, c = e.withXSRFToken;
              function p() {
                e.cancelToken && e.cancelToken.unsubscribe(n), e.signal && e.signal.removeEventListener("abort", n);
              }
              if ($.isFormData(a)) if (me.hasStandardBrowserEnv || me.hasStandardBrowserWebWorkerEnv) s.setContentType(!1); else if (!1 !== (o = s.getContentType())) {
                var y = o ? o.split(";").map(function(e) {
                  return e.trim();
                }).filter(Boolean) : [], m = l(i = y) || h(i) || d(i) || v(), g = m[0], b = m.slice(1);
                s.setContentType([ g || "multipart/form-data" ].concat(f(b)).join("; "));
              }
              var w = new XMLHttpRequest();
              if (e.auth) {
                var E = e.auth.username || "", O = e.auth.password ? unescape(encodeURIComponent(e.auth.password)) : "";
                s.set("Authorization", "Basic " + btoa(E + ":" + O));
              }
              var S = _e(e.baseURL, e.url);
              function R() {
                if (w) {
                  var n = xe.from("getAllResponseHeaders" in w && w.getAllResponseHeaders());
                  !function(e, t, r) {
                    var n = r.config.validateStatus;
                    r.status && n && !n(r.status) ? t(new Q("Request failed with status code " + r.status, [ Q.ERR_BAD_REQUEST, Q.ERR_BAD_RESPONSE ][Math.floor(r.status / 100) - 4], r.config, r.request, r)) : e(r);
                  }(function(e) {
                    t(e), p();
                  }, function(e) {
                    r(e), p();
                  }, {
                    data: u && "text" !== u && "json" !== u ? w.response : w.responseText,
                    status: w.status,
                    statusText: w.statusText,
                    headers: n,
                    config: e,
                    request: w
                  }), w = null;
                }
              }
              if (w.open(e.method.toUpperCase(), ce(S, e.params, e.paramsSerializer), !0), w.timeout = e.timeout, 
              "onloadend" in w ? w.onloadend = R : w.onreadystatechange = function() {
                w && 4 === w.readyState && (0 !== w.status || w.responseURL && 0 === w.responseURL.indexOf("file:")) && setTimeout(R);
              }, w.onabort = function() {
                w && (r(new Q("Request aborted", Q.ECONNABORTED, e, w)), w = null);
              }, w.onerror = function() {
                r(new Q("Network Error", Q.ERR_NETWORK, e, w)), w = null;
              }, w.ontimeout = function() {
                var t = e.timeout ? "timeout of " + e.timeout + "ms exceeded" : "timeout exceeded", n = e.transitional || he;
                e.timeoutErrorMessage && (t = e.timeoutErrorMessage), r(new Q(t, n.clarifyTimeoutError ? Q.ETIMEDOUT : Q.ECONNABORTED, e, w)), 
                w = null;
              }, me.hasStandardBrowserEnv && (c && $.isFunction(c) && (c = c(e)), c || !1 !== c && Le(S))) {
                var A = e.xsrfHeaderName && e.xsrfCookieName && ke.read(e.xsrfCookieName);
                A && s.set(e.xsrfHeaderName, A);
              }
              void 0 === a && s.setContentType(null), "setRequestHeader" in w && $.forEach(s.toJSON(), function(e, t) {
                w.setRequestHeader(t, e);
              }), $.isUndefined(e.withCredentials) || (w.withCredentials = !!e.withCredentials), 
              u && "json" !== u && (w.responseType = e.responseType), "function" == typeof e.onDownloadProgress && w.addEventListener("progress", Ce(e.onDownloadProgress, !0)), 
              "function" == typeof e.onUploadProgress && w.upload && w.upload.addEventListener("progress", Ce(e.onUploadProgress)), 
              (e.cancelToken || e.signal) && (n = function n(t) {
                w && (r(!t || t.type ? new Ne(null, e, w) : t), w.abort(), w = null);
              }, e.cancelToken && e.cancelToken.subscribe(n), e.signal && (e.signal.aborted ? n() : e.signal.addEventListener("abort", n)));
              var j, x = (j = /^([-+\w]{1,25})(:?\/\/|:)/.exec(S)) && j[1] || "";
              x && -1 === me.protocols.indexOf(x) ? r(new Q("Unsupported protocol " + x + ":", Q.ERR_BAD_REQUEST, e)) : w.send(a || null);
            });
          }
        };
        $.forEach(Fe, function(e, t) {
          if (e) {
            try {
              Object.defineProperty(e, "name", {
                value: t
              });
            } catch (e) {}
            Object.defineProperty(e, "adapterName", {
              value: t
            });
          }
        });
        var Ue = function Ue(e) {
          return "- ".concat(e);
        }, De = function De(e) {
          return $.isFunction(e) || null === e || !1 === e;
        }, Be = function Be(e) {
          for (var t, r, n = (e = $.isArray(e) ? e : [ e ]).length, o = {}, i = 0; i < n; i++) {
            var a = void 0;
            if (r = t = e[i], !De(t) && void 0 === (r = Fe[(a = String(t)).toLowerCase()])) throw new Q("Unknown adapter '".concat(a, "'"));
            if (r) break;
            o[a || "#" + i] = r;
          }
          if (!r) {
            var s = Object.entries(o).map(function(e) {
              var t = c(e, 2), r = t[0], n = t[1];
              return "adapter ".concat(r, " ") + (!1 === n ? "is not supported by the environment" : "is not available in the build");
            });
            throw new Q("There is no suitable adapter to dispatch the request " + (n ? s.length > 1 ? "since :\n" + s.map(Ue).join("\n") : " " + Ue(s[0]) : "as no adapter specified"), "ERR_NOT_SUPPORT");
          }
          return r;
        };
        function Ie(e) {
          if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted) throw new Ne(null, e);
        }
        function qe(e) {
          return Ie(e), e.headers = xe.from(e.headers), e.data = Te.call(e, e.transformRequest), 
          -1 !== [ "post", "put", "patch" ].indexOf(e.method) && e.headers.setContentType("application/x-www-form-urlencoded", !1), 
          Be(e.adapter || we.adapter)(e).then(function(t) {
            return Ie(e), t.data = Te.call(e, e.transformResponse, t), t.headers = xe.from(t.headers), 
            t;
          }, function(t) {
            return Pe(t) || (Ie(e), t && t.response && (t.response.data = Te.call(e, e.transformResponse, t.response), 
            t.response.headers = xe.from(t.response.headers))), Promise.reject(t);
          });
        }
        var ze = function ze(e) {
          return e instanceof xe ? e.toJSON() : e;
        };
        function Me(e, t) {
          t = t || {};
          var r = {};
          function n(e, t, r) {
            return $.isPlainObject(e) && $.isPlainObject(t) ? $.merge.call({
              caseless: r
            }, e, t) : $.isPlainObject(t) ? $.merge({}, t) : $.isArray(t) ? t.slice() : t;
          }
          function o(e, t, r) {
            return $.isUndefined(t) ? $.isUndefined(e) ? void 0 : n(void 0, e, r) : n(e, t, r);
          }
          function i(e, t) {
            if (!$.isUndefined(t)) return n(void 0, t);
          }
          function a(e, t) {
            return $.isUndefined(t) ? $.isUndefined(e) ? void 0 : n(void 0, e) : n(void 0, t);
          }
          function s(r, o, i) {
            return i in t ? n(r, o) : i in e ? n(void 0, r) : void 0;
          }
          var u = {
            url: i,
            method: i,
            data: i,
            baseURL: a,
            transformRequest: a,
            transformResponse: a,
            paramsSerializer: a,
            timeout: a,
            timeoutMessage: a,
            withCredentials: a,
            withXSRFToken: a,
            adapter: a,
            responseType: a,
            xsrfCookieName: a,
            xsrfHeaderName: a,
            onUploadProgress: a,
            onDownloadProgress: a,
            decompress: a,
            maxContentLength: a,
            maxBodyLength: a,
            beforeRedirect: a,
            transport: a,
            httpAgent: a,
            httpsAgent: a,
            cancelToken: a,
            socketPath: a,
            responseEncoding: a,
            validateStatus: s,
            headers: function headers(e, t) {
              return o(ze(e), ze(t), !0);
            }
          };
          return $.forEach(Object.keys(Object.assign({}, e, t)), function(n) {
            var i = u[n] || o, a = i(e[n], t[n], n);
            $.isUndefined(a) && i !== s || (r[n] = a);
          }), r;
        }
        var He = "1.6.7", Je = {};
        [ "object", "boolean", "number", "function", "string", "symbol" ].forEach(function(e, t) {
          Je[e] = function(r) {
            return n(r) === e || "a" + (t < 1 ? "n " : " ") + e;
          };
        });
        var Ge = {};
        Je.transitional = function(e, t, r) {
          function n(e, t) {
            return "[Axios v1.6.7] Transitional option '" + e + "'" + t + (r ? ". " + r : "");
          }
          return function(r, o, i) {
            if (!1 === e) throw new Q(n(o, " has been removed" + (t ? " in " + t : "")), Q.ERR_DEPRECATED);
            return t && !Ge[o] && (Ge[o] = !0, console.warn(n(o, " has been deprecated since v" + t + " and will be removed in the near future"))), 
            !e || e(r, o, i);
          };
        };
        var We = {
          assertOptions: function assertOptions(e, t, r) {
            if ("object" !== n(e)) throw new Q("options must be an object", Q.ERR_BAD_OPTION_VALUE);
            for (var o = Object.keys(e), i = o.length; i-- > 0; ) {
              var a = o[i], s = t[a];
              if (s) {
                var u = e[a], c = void 0 === u || s(u, a, e);
                if (!0 !== c) throw new Q("option " + a + " must be " + c, Q.ERR_BAD_OPTION_VALUE);
              } else if (!0 !== r) throw new Q("Unknown option " + a, Q.ERR_BAD_OPTION);
            }
          },
          validators: Je
        }, Ke = We.validators, Ve = function() {
          function e(t) {
            i(this, e), this.defaults = t, this.interceptors = {
              request: new le(),
              response: new le()
            };
          }
          var t, n;
          return s(e, [ {
            key: "request",
            value: (t = r().mark(function e(t, n) {
              var o, i;
              return r().wrap(function(e) {
                for (;;) switch (e.prev = e.next) {
                 case 0:
                  return e.prev = 0, e.next = 3, this._request(t, n);

                 case 3:
                  return e.abrupt("return", e.sent);

                 case 6:
                  throw e.prev = 6, e.t0 = e["catch"](0), e.t0 instanceof Error && (Error.captureStackTrace ? Error.captureStackTrace(o = {}) : o = new Error(), 
                  i = o.stack ? o.stack.replace(/^.+\n/, "") : "", e.t0.stack ? i && !String(e.t0.stack).endsWith(i.replace(/^.+\n.+\n/, "")) && (e.t0.stack += "\n" + i) : e.t0.stack = i), 
                  e.t0;

                 case 10:
                 case "end":
                  return e.stop();
                }
              }, e, this, [ [ 0, 6 ] ]);
            }), n = function n() {
              var e = this, r = arguments;
              return new Promise(function(n, i) {
                var a = t.apply(e, r);
                function s(e) {
                  o(a, n, i, s, u, "next", e);
                }
                function u(e) {
                  o(a, n, i, s, u, "throw", e);
                }
                s(void 0);
              });
            }, function(e, t) {
              return n.apply(this, arguments);
            })
          }, {
            key: "_request",
            value: function value(e, t) {
              "string" == typeof e ? (t = t || {}).url = e : t = e || {};
              var r = t = Me(this.defaults, t), n = r.transitional, o = r.paramsSerializer, i = r.headers;
              void 0 !== n && We.assertOptions(n, {
                silentJSONParsing: Ke.transitional(Ke["boolean"]),
                forcedJSONParsing: Ke.transitional(Ke["boolean"]),
                clarifyTimeoutError: Ke.transitional(Ke["boolean"])
              }, !1), null != o && ($.isFunction(o) ? t.paramsSerializer = {
                serialize: o
              } : We.assertOptions(o, {
                encode: Ke["function"],
                serialize: Ke["function"]
              }, !0)), t.method = (t.method || this.defaults.method || "get").toLowerCase();
              var a = i && $.merge(i.common, i[t.method]);
              i && $.forEach([ "delete", "get", "head", "post", "put", "patch", "common" ], function(e) {
                delete i[e];
              }), t.headers = xe.concat(a, i);
              var s = [], u = !0;
              this.interceptors.request.forEach(function(e) {
                "function" == typeof e.runWhen && !1 === e.runWhen(t) || (u = u && e.synchronous, 
                s.unshift(e.fulfilled, e.rejected));
              });
              var c, f = [];
              this.interceptors.response.forEach(function(e) {
                f.push(e.fulfilled, e.rejected);
              });
              var l, h = 0;
              if (!u) {
                var d = [ qe.bind(this), void 0 ];
                for (d.unshift.apply(d, s), d.push.apply(d, f), l = d.length, c = Promise.resolve(t); h < l; ) c = c.then(d[h++], d[h++]);
                return c;
              }
              l = s.length;
              var p = t;
              for (h = 0; h < l; ) {
                var v = s[h++], y = s[h++];
                try {
                  p = v(p);
                } catch (e) {
                  y.call(this, e);
                  break;
                }
              }
              try {
                c = qe.call(this, p);
              } catch (e) {
                return Promise.reject(e);
              }
              for (h = 0, l = f.length; h < l; ) c = c.then(f[h++], f[h++]);
              return c;
            }
          }, {
            key: "getUri",
            value: function value(e) {
              return ce(_e((e = Me(this.defaults, e)).baseURL, e.url), e.params, e.paramsSerializer);
            }
          } ]), e;
        }();
        $.forEach([ "delete", "get", "head", "options" ], function(e) {
          Ve.prototype[e] = function(t, r) {
            return this.request(Me(r || {}, {
              method: e,
              url: t,
              data: (r || {}).data
            }));
          };
        }), $.forEach([ "post", "put", "patch" ], function(e) {
          function t(t) {
            return function(r, n, o) {
              return this.request(Me(o || {}, {
                method: e,
                headers: t ? {
                  "Content-Type": "multipart/form-data"
                } : {},
                url: r,
                data: n
              }));
            };
          }
          Ve.prototype[e] = t(), Ve.prototype[e + "Form"] = t(!0);
        });
        var Xe = Ve, $e = function() {
          function e(t) {
            if (i(this, e), "function" != typeof t) throw new TypeError("executor must be a function.");
            var r;
            this.promise = new Promise(function(e) {
              r = e;
            });
            var n = this;
            this.promise.then(function(e) {
              if (n._listeners) {
                for (var t = n._listeners.length; t-- > 0; ) n._listeners[t](e);
                n._listeners = null;
              }
            }), this.promise.then = function(e) {
              var t, r = new Promise(function(e) {
                n.subscribe(e), t = e;
              }).then(e);
              return r.cancel = function() {
                n.unsubscribe(t);
              }, r;
            }, t(function(e, t, o) {
              n.reason || (n.reason = new Ne(e, t, o), r(n.reason));
            });
          }
          return s(e, [ {
            key: "throwIfRequested",
            value: function value() {
              if (this.reason) throw this.reason;
            }
          }, {
            key: "subscribe",
            value: function value(e) {
              this.reason ? e(this.reason) : this._listeners ? this._listeners.push(e) : this._listeners = [ e ];
            }
          }, {
            key: "unsubscribe",
            value: function value(e) {
              if (this._listeners) {
                var t = this._listeners.indexOf(e);
                -1 !== t && this._listeners.splice(t, 1);
              }
            }
          } ], [ {
            key: "source",
            value: function value() {
              var t;
              return {
                token: new e(function(e) {
                  t = e;
                }),
                cancel: t
              };
            }
          } ]), e;
        }();
        var Qe = {
          Continue: 100,
          SwitchingProtocols: 101,
          Processing: 102,
          EarlyHints: 103,
          Ok: 200,
          Created: 201,
          Accepted: 202,
          NonAuthoritativeInformation: 203,
          NoContent: 204,
          ResetContent: 205,
          PartialContent: 206,
          MultiStatus: 207,
          AlreadyReported: 208,
          ImUsed: 226,
          MultipleChoices: 300,
          MovedPermanently: 301,
          Found: 302,
          SeeOther: 303,
          NotModified: 304,
          UseProxy: 305,
          Unused: 306,
          TemporaryRedirect: 307,
          PermanentRedirect: 308,
          BadRequest: 400,
          Unauthorized: 401,
          PaymentRequired: 402,
          Forbidden: 403,
          NotFound: 404,
          MethodNotAllowed: 405,
          NotAcceptable: 406,
          ProxyAuthenticationRequired: 407,
          RequestTimeout: 408,
          Conflict: 409,
          Gone: 410,
          LengthRequired: 411,
          PreconditionFailed: 412,
          PayloadTooLarge: 413,
          UriTooLong: 414,
          UnsupportedMediaType: 415,
          RangeNotSatisfiable: 416,
          ExpectationFailed: 417,
          ImATeapot: 418,
          MisdirectedRequest: 421,
          UnprocessableEntity: 422,
          Locked: 423,
          FailedDependency: 424,
          TooEarly: 425,
          UpgradeRequired: 426,
          PreconditionRequired: 428,
          TooManyRequests: 429,
          RequestHeaderFieldsTooLarge: 431,
          UnavailableForLegalReasons: 451,
          InternalServerError: 500,
          NotImplemented: 501,
          BadGateway: 502,
          ServiceUnavailable: 503,
          GatewayTimeout: 504,
          HttpVersionNotSupported: 505,
          VariantAlsoNegotiates: 506,
          InsufficientStorage: 507,
          LoopDetected: 508,
          NotExtended: 510,
          NetworkAuthenticationRequired: 511
        };
        Object.entries(Qe).forEach(function(e) {
          var t = c(e, 2), r = t[0], n = t[1];
          Qe[n] = r;
        });
        var Ye = Qe;
        var Ze = function e(t) {
          var r = new Xe(t), n = y(Xe.prototype.request, r);
          return $.extend(n, Xe.prototype, r, {
            allOwnKeys: !0
          }), $.extend(n, r, null, {
            allOwnKeys: !0
          }), n.create = function(r) {
            return e(Me(t, r));
          }, n;
        }(we);
        return Ze.Axios = Xe, Ze.CanceledError = Ne, Ze.CancelToken = $e, Ze.isCancel = Pe, 
        Ze.VERSION = He, Ze.toFormData = oe, Ze.AxiosError = Q, Ze.Cancel = Ze.CanceledError, 
        Ze.all = function(e) {
          return Promise.all(e);
        }, Ze.spread = function(e) {
          return function(t) {
            return e.apply(null, t);
          };
        }, Ze.isAxiosError = function(e) {
          return $.isObject(e) && !0 === e.isAxiosError;
        }, Ze.mergeConfig = Me, Ze.AxiosHeaders = xe, Ze.formToJSON = function(e) {
          return ge($.isHTMLForm(e) ? new FormData(e) : e);
        }, Ze.getAdapter = Be, Ze.HttpStatusCode = Ye, Ze["default"] = Ze, Ze;
      });
      cc._RF.pop();
    }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {}, require("buffer").Buffer);
  }, {
    buffer: 2
  } ],
  layout: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "643521LNbZFKJuS3vLXNI0o", "layout");
    "use strict";
    var _wallet = _interopRequireDefault(require("./wallet"));
    var _api = _interopRequireDefault(require("api"));
    var _taproot = _interopRequireDefault(require("taproot"));
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }
      info.done ? resolve(value) : Promise.resolve(value).then(_next, _throw);
    }
    function _asyncToGenerator(fn) {
      return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
          var gen = fn.apply(self, args);
          function _next(value) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }
          function _throw(err) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }
          _next(void 0);
        });
      };
    }
    var seedMap = {
      0: {
        name: "zero",
        src: "land-zero",
        grow: 0
      },
      1: {
        name: "flower",
        src: "img6",
        grow: 60,
        yield: 100
      },
      2: {
        name: "tomato",
        src: "img14",
        grow: 60,
        yield: 100
      },
      3: {
        name: "wheat",
        src: "img11",
        grow: 60,
        yield: 300
      },
      4: {
        name: "corn",
        src: "img12",
        grow: 60,
        yield: 400
      }
    };
    var kids = [ "ord0726e221275bf170ef640676d22851338173c35", "ord0726e221275bf170ef640676d22851338173c35", "ord0726e221275bf170ef640676d22851338173c35", "ord0726e221275bf170ef640676d22851338173c35" ];
    cc.Class({
      extends: cc.Component,
      properties: {
        nodeSize: {
          default: 0,
          type: cc.Integer
        },
        DaiLogNode: {
          default: null,
          type: cc.Node
        },
        kid: {
          default: "",
          type: String
        },
        wallet: {
          default: "",
          type: String
        },
        Interval: {
          default: null,
          type: Object
        },
        landNodes: {
          default: [],
          type: Array
        }
      },
      onLoad: function onLoad() {
        this.nodeSize = this.node.parent.children.length;
        this.hideTransfer();
      },
      onDestroy: function onDestroy() {
        clearInterval(this.Interval);
      },
      showTransfer: function showTransfer() {
        this.node.parent.children[this.nodeSize - 1].active = true;
      },
      hideTransfer: function hideTransfer() {
        this.node.parent.children[this.nodeSize - 1].active = false;
      },
      start: function start() {
        var _this = this;
        this.loadUI();
        this.showUI("wallet");
        this.setBox();
        this.setSeed();
        this.setLands();
        this.setShop();
        this.setPlayer();
        this.node.on("touchstart", function(touch) {
          _this.movePlayer(-126.746, -163.837);
          _this.showUI("wallet");
        }, this);
        this.playBackgroundMusic();
      },
      loadUI: function loadUI() {
        this.setWallet();
        this.setFlowerInfo();
        this.setTomatoInfo();
        this.setWheatInfo();
        this.setCornInfo();
      },
      getNodeIndex: function getNodeIndex(name) {
        switch (name) {
         case "wallet":
          return 0;

         case "flowerInfo":
          return 1;

         case "tomatoInfo":
          return 2;

         case "wheatInfo":
          return 3;

         case "cornInfo":
          return 4;

         case "assets":
          return 5;
        }
      },
      showUI: function showUI(name) {
        var i = this.getNodeIndex(name);
        var node = this.node.children[0].children;
        for (var index = 0; index < node.length; index++) node[index].active = i == index;
      },
      setWallet: function setWallet() {
        var _this2 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
          var node, userNode, wallet, logoNode, sp, labelNode, labelComponent, label, address, balance;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
             case 0:
              node = _this2.node.children[0];
              userNode = new cc.Node();
              userNode.active = false;
              userNode.parent = node;
              wallet = new cc.Node();
              wallet.parent = userNode;
              logoNode = new cc.Node();
              logoNode.x = -145;
              sp = logoNode.addComponent(cc.Sprite);
              cc.resources.load("images/player/img2", cc.SpriteFrame, function(err, frame) {
                if (err) {
                  cc.error(err);
                  return;
                }
                sp.spriteFrame = frame;
              });
              logoNode.parent = userNode;
              labelNode = new cc.Node();
              labelNode.x = 20;
              labelComponent = labelNode.addComponent(cc.Label);
              label = labelComponent;
              _context.next = 17;
              return _wallet["default"].GetAccount();

             case 17:
              address = _context.sent;
              _context.next = 20;
              return _wallet["default"].GetBalance(address);

             case 20:
              balance = _context.sent;
              _this2.wallet = address;
              address = address.substring(0, 11) + "....." + address.substring(address.length - 9, address.length);
              label.string = balance.toFixed(5) + "\u20bf\n" + address;
              label.node.color = new cc.Color(0, 0, 0, 255);
              label.fontSize = 20;
              label.lineHeight = 35;
              label.verticalAlign = "CENTER";
              labelNode.parent = userNode;
              _this2.Interval = setInterval(function() {
                _this2.getLands();
              }, 6e4);

             case 30:
             case "end":
              return _context.stop();
            }
          }, _callee);
        }))();
      },
      setFlowerInfo: function setFlowerInfo() {
        var node = this.node.children[0];
        var infoNode = new cc.Node();
        infoNode.active = false;
        infoNode.parent = node;
        var logoNode = new cc.Node();
        logoNode.x = -130;
        var sp = logoNode.addComponent(cc.Sprite);
        cc.resources.load("images/fram/img6", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          sp.spriteFrame = frame;
        });
        logoNode.parent = infoNode;
        var labelNode = new cc.Node();
        labelNode.x = 25;
        var labelComponent = labelNode.addComponent(cc.Label);
        var label = labelComponent;
        label.string = "Flower\nYield:123\nGrow: 30 minutes";
        label.node.color = new cc.Color(0, 0, 0, 255);
        label.fontSize = 20;
        label.lineHeight = 25;
        label.verticalAlign = "CENTER";
        labelNode.parent = infoNode;
      },
      setTomatoInfo: function setTomatoInfo() {
        var node = this.node.children[0];
        var infoNode = new cc.Node();
        infoNode.active = false;
        infoNode.parent = node;
        var logoNode = new cc.Node();
        logoNode.x = -130;
        var sp = logoNode.addComponent(cc.Sprite);
        cc.resources.load("images/fram/img14", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          sp.spriteFrame = frame;
        });
        logoNode.parent = infoNode;
        var labelNode = new cc.Node();
        labelNode.x = 25;
        var labelComponent = labelNode.addComponent(cc.Label);
        var label = labelComponent;
        label.string = "Tomato\nYield:123\nGrow: 30 minutes";
        label.node.color = new cc.Color(0, 0, 0, 255);
        label.fontSize = 20;
        label.lineHeight = 25;
        label.verticalAlign = "CENTER";
        labelNode.parent = infoNode;
      },
      setWheatInfo: function setWheatInfo() {
        var node = this.node.children[0];
        var infoNode = new cc.Node();
        infoNode.active = false;
        infoNode.parent = node;
        var logoNode = new cc.Node();
        logoNode.x = -130;
        var sp = logoNode.addComponent(cc.Sprite);
        cc.resources.load("images/fram/img11", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          sp.spriteFrame = frame;
        });
        logoNode.parent = infoNode;
        var labelNode = new cc.Node();
        labelNode.x = 25;
        var labelComponent = labelNode.addComponent(cc.Label);
        var label = labelComponent;
        label.string = "Wheat\nYield:123\nGrow: 30 minutes";
        label.node.color = new cc.Color(0, 0, 0, 255);
        label.fontSize = 20;
        label.lineHeight = 25;
        label.verticalAlign = "CENTER";
        labelNode.parent = infoNode;
      },
      setCornInfo: function setCornInfo() {
        var node = this.node.children[0];
        var infoNode = new cc.Node();
        infoNode.active = false;
        infoNode.parent = node;
        var logoNode = new cc.Node();
        logoNode.x = -130;
        var sp = logoNode.addComponent(cc.Sprite);
        cc.resources.load("images/fram/img12", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          sp.spriteFrame = frame;
        });
        logoNode.parent = infoNode;
        var labelNode = new cc.Node();
        labelNode.x = 25;
        var labelComponent = labelNode.addComponent(cc.Label);
        var label = labelComponent;
        label.string = "Corn\nYield:123\nGrow: 30 minutes";
        label.node.color = new cc.Color(0, 0, 0, 255);
        label.fontSize = 20;
        label.lineHeight = 25;
        label.verticalAlign = "CENTER";
        labelNode.parent = infoNode;
      },
      setShop: function setShop() {
        var _this3 = this;
        var shop = new cc.Node("Sprite");
        shop.scaleX = .5;
        shop.scaleY = .5;
        shop.x = -26.544;
        shop.y = 173.834;
        var sp = shop.addComponent(cc.Sprite);
        cc.resources.load("images/fram/img2", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          sp.spriteFrame = frame;
        });
        shop.on("touchstart", function(touch) {
          touch.stopPropagation();
          _this3.movePlayer(shop.x, shop.y - 40);
          _this3.showUI("wallet");
          _this3.showTokenList();
        });
        shop.parent = this.node;
      },
      setBox: function setBox() {
        var _this4 = this;
        var box = new cc.Node("Sprite");
        box.scaleX = .5;
        box.scaleY = .5;
        box.x = -165;
        box.y = 112;
        box.on("touchstart", function(touch) {
          touch.stopPropagation();
          _this4.movePlayer(box.x, box.y);
        });
        var sp = box.addComponent(cc.Sprite);
        cc.resources.load("images/fram/img21", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          sp.spriteFrame = frame;
        });
        box.parent = this.node;
      },
      setSeed: function setSeed() {
        var _this5 = this;
        var seed1 = new cc.Node("Sprite");
        seed1.scaleX = .6;
        seed1.scaleY = .6;
        seed1.x = 114.53;
        seed1.y = -48.353;
        seed1.on("touchstart", function(touch) {
          touch.stopPropagation();
          _this5.movePlayer(seed1.x, seed1.y);
          _this5.showUI("flowerInfo");
        });
        var sp1 = seed1.addComponent(cc.Sprite);
        cc.resources.load("images/fram/img3", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          sp1.spriteFrame = frame;
        });
        seed1.parent = this.node;
        var seed2 = new cc.Node("Sprite");
        seed2.scaleX = .6;
        seed2.scaleY = .6;
        seed2.x = 115.379;
        seed2.y = -86.627;
        seed2.on("touchstart", function(touch) {
          touch.stopPropagation();
          _this5.movePlayer(seed2.x, seed2.y);
          _this5.showUI("tomatoInfo");
        });
        var sp2 = seed2.addComponent(cc.Sprite);
        cc.resources.load("images/fram/img27", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          sp2.spriteFrame = frame;
        });
        seed2.parent = this.node;
        var seed3 = new cc.Node("Sprite");
        seed3.scaleX = .6;
        seed3.scaleY = .6;
        seed3.x = 111.53;
        seed3.y = -126.353;
        seed3.on("touchstart", function(touch) {
          touch.stopPropagation();
          _this5.movePlayer(seed3.x, seed3.y);
          _this5.showUI("wheatInfo");
        });
        var sp3 = seed3.addComponent(cc.Sprite);
        cc.resources.load("images/fram/img22", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          sp3.spriteFrame = frame;
        });
        seed3.parent = this.node;
        var seed4 = new cc.Node("Sprite");
        seed4.scaleX = .6;
        seed4.scaleY = .6;
        seed4.x = 114.53;
        seed4.y = -167.353;
        seed4.on("touchstart", function(touch) {
          touch.stopPropagation();
          _this5.movePlayer(seed4.x, seed4.y);
          _this5.showUI("cornInfo");
        });
        var sp4 = seed4.addComponent(cc.Sprite);
        cc.resources.load("images/fram/img15", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          sp4.spriteFrame = frame;
        });
        seed4.parent = this.node;
      },
      setLands: function setLands() {
        var _this6 = this;
        var lands = cc.sys.localStorage.getItem("lands");
        lands ? lands = JSON.parse(lands) : cc.error("\u672a\u83b7\u53d6\u5230\u571f\u5730\u4fe1\u606f");
        cc.log(lands);
        var land1 = new cc.Node("land1");
        land1.scaleX = .5;
        land1.scaleY = .5;
        land1.x = -87.5;
        land1.y = 72.5;
        land1.on("touchstart", function(touch) {
          touch.stopPropagation();
          _this6.movePlayer(land1.x, land1.y);
          _this6.showUI("wallet");
          var lands = cc.sys.localStorage.getItem("lands");
          if (!lands) {
            cc.error("\u672a\u83b7\u53d6\u5230\u571f\u5730\u4fe1\u606f");
            return;
          }
          lands = JSON.parse(lands);
          var data = lands[0];
          if (0 == data.seedIndex) {
            cc.log("\u7a7a\u5730,\u53ef\u79cd\u690d");
            var cache = cc.sys.localStorage.getItem(_this6.wallet + "cache");
            if (cache) {
              cache = JSON.parse(cache);
              if (cache[0] && "sowing" == cache[0].op) {
                console.log("\u6b63\u5728\u64ad\u79cd...");
                _this6.showDaiLog({
                  op: "txid",
                  data: {
                    name: "Sowing...",
                    txid: cache[0].txid
                  }
                });
                return;
              }
            }
            _this6.showDaiLog({
              op: "sowing",
              landIndex: 0
            });
          } else if (data.unix >= seedMap[data.seedIndex].grow) {
            cc.log("\u53ef\u6536\u83b7");
            var _cache = cc.sys.localStorage.getItem(_this6.wallet + "cache");
            if (_cache) {
              _cache = JSON.parse(_cache);
              if (_cache[0] && "harvest" == _cache[0].op) {
                console.log("\u6b63\u5728\u6536\u83b7...");
                _this6.showDaiLog({
                  op: "txid",
                  data: {
                    name: "Harvest...",
                    txid: _cache[0].txid
                  }
                });
                return;
              }
            }
            _this6.showDaiLog({
              op: "harvest",
              data: {
                name: seedMap[data.seedIndex].name,
                yield: seedMap[data.seedIndex]["yield"],
                landIndex: 0
              }
            });
          } else {
            cc.log("\u6b63\u5728\u751f\u957f");
            _this6.showDaiLog({
              op: "grow",
              data: {
                produce: data,
                seed: seedMap[data.seedIndex]
              }
            });
          }
        });
        this.setLand(land1);
        this.setChild(land1, seedMap[lands[0].seedIndex].src);
        var land2 = new cc.Node("land2");
        land2.scaleX = .5;
        land2.scaleY = .5;
        land2.x = -47.393;
        land2.y = 72.5;
        land2.on("touchstart", function(touch) {
          touch.stopPropagation();
          _this6.movePlayer(land2.x, land2.y);
          _this6.showUI("wallet");
          var lands = cc.sys.localStorage.getItem("lands");
          if (!lands) {
            cc.error("\u672a\u83b7\u53d6\u5230\u571f\u5730\u4fe1\u606f");
            return;
          }
          lands = JSON.parse(lands);
          var data = lands[1];
          if (0 == data.seedIndex) {
            cc.log("\u7a7a\u5730,\u53ef\u79cd\u690d");
            var cache = cc.sys.localStorage.getItem(_this6.wallet + "cache");
            if (cache) {
              cache = JSON.parse(cache);
              if (cache[1] && "sowing" == cache[1].op) {
                console.log("\u6b63\u5728\u64ad\u79cd...");
                _this6.showDaiLog({
                  op: "txid",
                  data: {
                    name: "Sowing...",
                    txid: cache[1].txid
                  }
                });
                return;
              }
            }
            _this6.showDaiLog({
              op: "sowing",
              landIndex: 1
            });
          } else if (data.unix >= seedMap[data.seedIndex].grow) {
            cc.log("\u53ef\u6536\u83b7");
            var _cache2 = cc.sys.localStorage.getItem(_this6.wallet + "cache");
            if (_cache2) {
              _cache2 = JSON.parse(_cache2);
              if (_cache2[1] && "harvest" == _cache2[1].op) {
                console.log("\u6b63\u5728\u6536\u83b7...");
                _this6.showDaiLog({
                  op: "txid",
                  data: {
                    name: "Harvest...",
                    txid: _cache2[1].txid
                  }
                });
                return;
              }
            }
            _this6.showDaiLog({
              op: "harvest",
              data: {
                name: seedMap[data.seedIndex].name,
                yield: seedMap[data.seedIndex]["yield"],
                landIndex: 1
              }
            });
          } else {
            cc.log("\u6b63\u5728\u751f\u957f");
            _this6.showDaiLog({
              op: "grow",
              data: {
                produce: data,
                seed: seedMap[data.seedIndex]
              }
            });
          }
        });
        this.setLand(land2);
        this.setChild(land2, seedMap[lands[1].seedIndex].src);
        var land3 = new cc.Node("land3");
        land3.scaleX = .5;
        land3.scaleY = .5;
        land3.x = -5.932;
        land3.y = 72.5;
        land3.on("touchstart", function(touch) {
          touch.stopPropagation();
          _this6.movePlayer(land3.x, land3.y);
          _this6.showUI("wallet");
          var lands = cc.sys.localStorage.getItem("lands");
          if (!lands) {
            cc.error("\u672a\u83b7\u53d6\u5230\u571f\u5730\u4fe1\u606f");
            return;
          }
          lands = JSON.parse(lands);
          var data = lands[2];
          if (0 == data.seedIndex) {
            cc.log("\u7a7a\u5730,\u53ef\u79cd\u690d");
            var cache = cc.sys.localStorage.getItem(_this6.wallet + "cache");
            if (cache) {
              cache = JSON.parse(cache);
              if (cache[2] && "sowing" == cache[2].op) {
                console.log("\u6b63\u5728\u64ad\u79cd...");
                _this6.showDaiLog({
                  op: "txid",
                  data: {
                    name: "Sowing...",
                    txid: cache[2].txid
                  }
                });
                return;
              }
            }
            _this6.showDaiLog({
              op: "sowing",
              landIndex: 2
            });
          } else if (data.unix >= seedMap[data.seedIndex].grow) {
            cc.log("\u53ef\u6536\u83b7");
            var _cache3 = cc.sys.localStorage.getItem(_this6.wallet + "cache");
            if (_cache3) {
              _cache3 = JSON.parse(_cache3);
              if (_cache3[2] && "harvest" == _cache3[2].op) {
                console.log("\u6b63\u5728\u6536\u83b7...");
                _this6.showDaiLog({
                  op: "txid",
                  data: {
                    name: "Harvest...",
                    txid: _cache3[2].txid
                  }
                });
                return;
              }
            }
            _this6.showDaiLog({
              op: "harvest",
              data: {
                name: seedMap[data.seedIndex].name,
                yield: seedMap[data.seedIndex]["yield"],
                landIndex: 2
              }
            });
          } else {
            cc.log("\u6b63\u5728\u751f\u957f");
            _this6.showDaiLog({
              op: "grow",
              data: {
                produce: data,
                seed: seedMap[data.seedIndex]
              }
            });
          }
        });
        this.setLand(land3);
        this.setChild(land3, seedMap[lands[2].seedIndex].src);
        var land4 = new cc.Node("land4");
        land4.scaleX = .5;
        land4.scaleY = .5;
        land4.x = -87.5;
        land4.y = 33.224;
        land4.on("touchstart", function(touch) {
          touch.stopPropagation();
          _this6.movePlayer(land4.x, land4.y);
          _this6.showUI("wallet");
          var lands = cc.sys.localStorage.getItem("lands");
          if (!lands) {
            cc.error("\u672a\u83b7\u53d6\u5230\u571f\u5730\u4fe1\u606f");
            return;
          }
          lands = JSON.parse(lands);
          var data = lands[3];
          if (0 == data.seedIndex) {
            cc.log("\u7a7a\u5730,\u53ef\u79cd\u690d");
            var cache = cc.sys.localStorage.getItem(_this6.wallet + "cache");
            if (cache) {
              cache = JSON.parse(cache);
              if (cache[3] && "sowing" == cache[3].op) {
                console.log("\u6b63\u5728\u64ad\u79cd...");
                _this6.showDaiLog({
                  op: "txid",
                  data: {
                    name: "Sowing...",
                    txid: cache[3].txid
                  }
                });
                return;
              }
            }
            _this6.showDaiLog({
              op: "sowing",
              landIndex: 3
            });
          } else if (data.unix >= seedMap[data.seedIndex].grow) {
            cc.log("\u53ef\u6536\u83b7");
            var _cache4 = cc.sys.localStorage.getItem(_this6.wallet + "cache");
            if (_cache4) {
              _cache4 = JSON.parse(_cache4);
              if (_cache4[3] && "harvest" == _cache4[3].op) {
                console.log("\u6b63\u5728\u6536\u83b7...");
                _this6.showDaiLog({
                  op: "txid",
                  data: {
                    name: "Harvest...",
                    txid: _cache4[3].txid
                  }
                });
                return;
              }
            }
            _this6.showDaiLog({
              op: "harvest",
              data: {
                name: seedMap[data.seedIndex].name,
                yield: seedMap[data.seedIndex]["yield"],
                landIndex: 3
              }
            });
          } else {
            cc.log("\u6b63\u5728\u751f\u957f");
            _this6.showDaiLog({
              op: "grow",
              data: {
                produce: data,
                seed: seedMap[data.seedIndex]
              }
            });
          }
        });
        this.setLand(land4);
        this.setChild(land4, seedMap[lands[3].seedIndex].src);
        var land5 = new cc.Node("land5");
        land5.scaleX = .5;
        land5.scaleY = .5;
        land5.x = -46.517;
        land5.y = 33.224;
        land5.on("touchstart", function(touch) {
          touch.stopPropagation();
          _this6.movePlayer(land5.x, land5.y);
          _this6.showUI("wallet");
          var lands = cc.sys.localStorage.getItem("lands");
          if (!lands) {
            cc.error("\u672a\u83b7\u53d6\u5230\u571f\u5730\u4fe1\u606f");
            return;
          }
          lands = JSON.parse(lands);
          var data = lands[4];
          if (0 == data.seedIndex) {
            cc.log("\u7a7a\u5730,\u53ef\u79cd\u690d");
            var cache = cc.sys.localStorage.getItem(_this6.wallet + "cache");
            if (cache) {
              cache = JSON.parse(cache);
              if (cache[4] && "sowing" == cache[4].op) {
                console.log("\u6b63\u5728\u64ad\u79cd...");
                _this6.showDaiLog({
                  op: "txid",
                  data: {
                    name: "Sowing...",
                    txid: cache[4].txid
                  }
                });
                return;
              }
            }
            _this6.showDaiLog({
              op: "sowing",
              landIndex: 4
            });
          } else if (data.unix >= seedMap[data.seedIndex].grow) {
            cc.log("\u53ef\u6536\u83b7");
            var _cache5 = cc.sys.localStorage.getItem(_this6.wallet + "cache");
            if (_cache5) {
              _cache5 = JSON.parse(_cache5);
              if (_cache5[4] && "harvest" == _cache5[4].op) {
                console.log("\u6b63\u5728\u6536\u83b7...");
                _this6.showDaiLog({
                  op: "txid",
                  data: {
                    name: "Harvest...",
                    txid: _cache5[4].txid
                  }
                });
                return;
              }
            }
            _this6.showDaiLog({
              op: "harvest",
              data: {
                name: seedMap[data.seedIndex].name,
                yield: seedMap[data.seedIndex]["yield"],
                landIndex: 4
              }
            });
          } else {
            cc.log("\u6b63\u5728\u751f\u957f");
            _this6.showDaiLog({
              op: "grow",
              data: {
                produce: data,
                seed: seedMap[data.seedIndex]
              }
            });
          }
        });
        this.setLand(land5);
        this.setChild(land5, seedMap[lands[4].seedIndex].src);
        var land6 = new cc.Node("land6");
        land6.scaleX = .5;
        land6.scaleY = .5;
        land6.x = -6.668;
        land6.y = 33.224;
        land6.on("touchstart", function(touch) {
          touch.stopPropagation();
          _this6.movePlayer(land6.x, land6.y);
          _this6.showUI("wallet");
          var lands = cc.sys.localStorage.getItem("lands");
          if (!lands) {
            cc.error("\u672a\u83b7\u53d6\u5230\u571f\u5730\u4fe1\u606f");
            return;
          }
          lands = JSON.parse(lands);
          var data = lands[5];
          if (0 == data.seedIndex) {
            cc.log("\u7a7a\u5730,\u53ef\u79cd\u690d");
            var cache = cc.sys.localStorage.getItem(_this6.wallet + "cache");
            if (cache) {
              cache = JSON.parse(cache);
              if (cache[5] && "sowing" == cache[5].op) {
                console.log("\u6b63\u5728\u6536\u83b7...");
                _this6.showDaiLog({
                  op: "txid",
                  data: {
                    name: "Sowing...",
                    txid: cache[5].txid
                  }
                });
                return;
              }
            }
            _this6.showDaiLog({
              op: "sowing",
              landIndex: 5
            });
          } else if (data.unix >= seedMap[data.seedIndex].grow) {
            cc.log("\u53ef\u6536\u83b7");
            var _cache6 = cc.sys.localStorage.getItem(_this6.wallet + "cache");
            if (_cache6) {
              _cache6 = JSON.parse(_cache6);
              if (_cache6[5] && "harvest" == _cache6[5].op) {
                console.log("\u6b63\u5728\u6536\u83b7...");
                _this6.showDaiLog({
                  op: "txid",
                  data: {
                    name: "Harvest...",
                    txid: _cache6[5].txid
                  }
                });
                return;
              }
            }
            _this6.showDaiLog({
              op: "harvest",
              data: {
                name: seedMap[data.seedIndex].name,
                yield: seedMap[data.seedIndex]["yield"],
                landIndex: 5
              }
            });
          } else {
            cc.log("\u6b63\u5728\u751f\u957f");
            _this6.showDaiLog({
              op: "grow",
              data: {
                produce: data,
                seed: seedMap[data.seedIndex]
              }
            });
          }
        });
        this.setLand(land6);
        this.setChild(land6, seedMap[lands[5].seedIndex].src);
        this.landNodes = [ land1, land2, land3, land4, land5, land6 ];
      },
      showTokenList: function showTokenList() {
        var _this7 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
          var node, dailog, sp, label2Node, label2, close, csp, balanceList;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
             case 0:
              node = new cc.Node();
              node.parent = _this7.node;
              node.setContentSize(375, 667);
              node.on("touchstart", function(touch) {
                touch.stopPropagation();
              });
              _this7.DaiLogNode = node;
              dailog = new cc.Node();
              dailog.angle = .5;
              dailog.scaleX = .5;
              dailog.scaleY = .5;
              sp = dailog.addComponent(cc.Sprite);
              cc.resources.load("images/bg.shop-dialog", cc.SpriteFrame, function(err, frame) {
                if (err) {
                  cc.error(err);
                  return;
                }
                sp.spriteFrame = frame;
              });
              dailog.parent = node;
              label2Node = new cc.Node();
              label2Node.x = 0;
              label2Node.y = 125;
              label2 = label2Node.addComponent(cc.Label);
              label2.string = "BALANCES";
              label2.node.color = new cc.Color(29, 46, 80, 255);
              label2.fontSize = 20;
              label2.lineHeight = 35;
              label2.verticalAlign = "CENTER";
              label2Node.parent = node;
              close = new cc.Node();
              close.x = 215;
              close.y = 265;
              csp = close.addComponent(cc.Sprite);
              cc.resources.load("images/seed/close", cc.SpriteFrame, function(err, frame) {
                if (err) {
                  cc.error(err);
                  return;
                }
                csp.spriteFrame = frame;
              });
              close.on("touchstart", function(touch) {
                touch.stopPropagation();
                _this7.DaiLogNode.destroy();
              });
              close.parent = dailog;
              _context2.next = 31;
              return _this7.getBalance(kids);

             case 31:
              balanceList = _context2.sent;
              cc.log(balanceList);
              _this7.setFlowerBalance(node, kids[0], balanceList[kids[0]]);
              _this7.setTomatoBalance(node, kids[1], balanceList[kids[1]]);
              _this7.setWheatBalance(node, kids[2], balanceList[kids[2]]);
              _this7.setCornBalance(node, kids[3], balanceList[kids[3]]);

             case 37:
             case "end":
              return _context2.stop();
            }
          }, _callee2);
        }))();
      },
      setFlowerBalance: function setFlowerBalance(node, kid, balance) {
        var _this8 = this;
        var lineNode = new cc.Node();
        lineNode.y = 70;
        lineNode.x = -98;
        lineNode.parent = node;
        var flower = new cc.Node();
        flower.scaleX = .5;
        flower.scaleY = .5;
        var fsp = flower.addComponent(cc.Sprite);
        cc.resources.load("images/seed/flower", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          fsp.spriteFrame = frame;
        });
        flower.parent = lineNode;
        var labelNode = new cc.Node();
        labelNode.x = 95;
        var label = labelNode.addComponent(cc.Label);
        label.string = balance;
        label.node.color = new cc.Color(181, 129, 98, 255);
        label.fontSize = 20;
        label.lineHeight = 35;
        label.verticalAlign = "CENTER";
        labelNode.parent = lineNode;
        var labelBtnNode = new cc.Node();
        labelBtnNode.x = 190;
        var btnLabel = labelBtnNode.addComponent(cc.Label);
        btnLabel.string = "transfer";
        btnLabel.node.color = new cc.Color(0, 0, 0, 255);
        btnLabel.fontSize = 20;
        btnLabel.lineHeight = 35;
        btnLabel.verticalAlign = "CENTER";
        labelBtnNode.on("touchstart", function(touch) {
          touch.stopPropagation();
          cc.log("transfer flower token");
          _this8.DaiLogNode.destroy();
          cc.sys.localStorage.setItem("kid", kid);
          _this8.showTransfer();
        });
        labelBtnNode.parent = lineNode;
      },
      setTomatoBalance: function setTomatoBalance(node, kid, balance) {
        var _this9 = this;
        var lineNode = new cc.Node();
        lineNode.y = 10;
        lineNode.x = -98;
        lineNode.parent = node;
        var tomato = new cc.Node();
        tomato.scaleX = .5;
        tomato.scaleY = .5;
        var fsp = tomato.addComponent(cc.Sprite);
        cc.resources.load("images/seed/tomato", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          fsp.spriteFrame = frame;
        });
        tomato.parent = lineNode;
        var labelNode = new cc.Node();
        labelNode.x = 95;
        var label = labelNode.addComponent(cc.Label);
        label.string = balance;
        label.node.color = new cc.Color(181, 129, 98, 255);
        label.fontSize = 20;
        label.lineHeight = 35;
        label.verticalAlign = "CENTER";
        labelNode.parent = lineNode;
        var labelBtnNode = new cc.Node();
        labelBtnNode.x = 190;
        var btnLabel = labelBtnNode.addComponent(cc.Label);
        btnLabel.string = "transfer";
        btnLabel.node.color = new cc.Color(0, 0, 0, 255);
        btnLabel.fontSize = 20;
        btnLabel.lineHeight = 35;
        btnLabel.verticalAlign = "CENTER";
        labelBtnNode.on("touchstart", function(touch) {
          touch.stopPropagation();
          cc.log("transfer tomato token");
          _this9.DaiLogNode.destroy();
          cc.sys.localStorage.setItem("kid", kid);
          _this9.showTransfer();
        });
        labelBtnNode.parent = lineNode;
      },
      setWheatBalance: function setWheatBalance(node, kid, balance) {
        var _this10 = this;
        var lineNode = new cc.Node();
        lineNode.y = -50;
        lineNode.x = -98;
        lineNode.parent = node;
        var wheat = new cc.Node();
        wheat.scaleX = .5;
        wheat.scaleY = .5;
        var fsp = wheat.addComponent(cc.Sprite);
        cc.resources.load("images/seed/wheat", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          fsp.spriteFrame = frame;
        });
        wheat.parent = lineNode;
        var labelNode = new cc.Node();
        labelNode.x = 95;
        var label = labelNode.addComponent(cc.Label);
        label.string = balance;
        label.node.color = new cc.Color(181, 129, 98, 255);
        label.fontSize = 20;
        label.lineHeight = 35;
        label.verticalAlign = "CENTER";
        labelNode.parent = lineNode;
        var labelBtnNode = new cc.Node();
        labelBtnNode.x = 190;
        var btnLabel = labelBtnNode.addComponent(cc.Label);
        btnLabel.string = "transfer";
        btnLabel.node.color = new cc.Color(0, 0, 0, 255);
        btnLabel.fontSize = 20;
        btnLabel.lineHeight = 35;
        btnLabel.verticalAlign = "CENTER";
        labelBtnNode.on("touchstart", function(touch) {
          touch.stopPropagation();
          cc.log("transfer wheat token");
          _this10.DaiLogNode.destroy();
          cc.sys.localStorage.setItem("kid", kid);
          _this10.showTransfer();
        });
        labelBtnNode.parent = lineNode;
      },
      setCornBalance: function setCornBalance(node, kid, balance) {
        var _this11 = this;
        var lineNode = new cc.Node();
        lineNode.y = -110;
        lineNode.x = -98;
        lineNode.parent = node;
        var corn = new cc.Node();
        corn.scaleX = .5;
        corn.scaleY = .5;
        var fsp = corn.addComponent(cc.Sprite);
        cc.resources.load("images/seed/corn", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          fsp.spriteFrame = frame;
        });
        corn.parent = lineNode;
        var labelNode = new cc.Node();
        labelNode.x = 95;
        var label = labelNode.addComponent(cc.Label);
        label.string = balance;
        label.node.color = new cc.Color(181, 129, 98, 255);
        label.fontSize = 20;
        label.lineHeight = 35;
        label.verticalAlign = "CENTER";
        labelNode.parent = lineNode;
        var labelBtnNode = new cc.Node();
        labelBtnNode.x = 190;
        var btnLabel = labelBtnNode.addComponent(cc.Label);
        btnLabel.string = "transfer";
        btnLabel.node.color = new cc.Color(0, 0, 0, 255);
        btnLabel.fontSize = 20;
        btnLabel.lineHeight = 35;
        btnLabel.verticalAlign = "CENTER";
        labelBtnNode.on("touchstart", function(touch) {
          touch.stopPropagation();
          cc.log("transfer corn token");
          _this11.DaiLogNode.destroy();
          cc.sys.localStorage.setItem("kid", kid);
          _this11.showTransfer();
        });
        labelBtnNode.parent = lineNode;
      },
      showDaiLog: function showDaiLog(data) {
        var _this12 = this;
        var node = new cc.Node();
        node.parent = this.node;
        node.setContentSize(375, 667);
        node.on("touchstart", function(touch) {
          touch.stopPropagation();
        });
        this.DaiLogNode = node;
        var dailog = new cc.Node();
        dailog.scaleX = .5;
        dailog.scaleY = .5;
        var sp = dailog.addComponent(cc.Sprite);
        cc.resources.load("images/bg.msg-dialog", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          sp.spriteFrame = frame;
        });
        dailog.parent = node;
        var close = new cc.Node();
        close.x = 220;
        close.y = 175;
        close.on("touchstart", function(touch) {
          touch.stopPropagation();
          _this12.DaiLogNode.destroy();
        });
        var csp = close.addComponent(cc.Sprite);
        cc.resources.load("images/seed/close", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          csp.spriteFrame = frame;
        });
        close.parent = dailog;
        switch (data.op) {
         case "sowing":
          this.setSeedList(dailog, data.landIndex);
          break;

         case "grow":
          this.setGrow(dailog, data.data);
          break;

         case "harvest":
          this.setHarvest(dailog, data.data);
          break;

         case "txid":
          this.setTxHash(dailog, data.data);
        }
      },
      setSeedList: function setSeedList(node, landIndex) {
        var _this13 = this;
        var seedIndex = 0;
        var check = null;
        var flower = new cc.Node();
        flower.x = -140;
        flower.y = 140;
        flower.scaleX = 1.2;
        flower.scaleY = 1.2;
        var fsp = flower.addComponent(cc.Sprite);
        cc.resources.load("images/seed/flower", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          fsp.spriteFrame = frame;
        });
        flower.on("touchstart", function(touch) {
          check.active = true;
          check.x = flower.x;
          check.y = flower.y;
          seedIndex = 1;
        });
        flower.parent = node;
        var tomato = new cc.Node();
        tomato.x = 40;
        tomato.y = 136;
        tomato.scaleX = 1.2;
        tomato.scaleY = 1.2;
        var tsp = tomato.addComponent(cc.Sprite);
        cc.resources.load("images/seed/tomato", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          tsp.spriteFrame = frame;
        });
        tomato.on("touchstart", function(touch) {
          check.active = true;
          check.x = tomato.x;
          check.y = tomato.y;
          seedIndex = 2;
        });
        tomato.parent = node;
        var wheat = new cc.Node();
        wheat.x = -140;
        wheat.y = 0;
        wheat.scaleX = 1.2;
        wheat.scaleY = 1.2;
        var wsp = wheat.addComponent(cc.Sprite);
        cc.resources.load("images/seed/wheat", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          wsp.spriteFrame = frame;
        });
        wheat.on("touchstart", function(touch) {
          check.active = true;
          check.x = wheat.x;
          check.y = wheat.y;
          seedIndex = 3;
        });
        wheat.parent = node;
        var corn = new cc.Node();
        corn.x = 40;
        corn.scaleX = 1.2;
        corn.scaleY = 1.2;
        var csp = corn.addComponent(cc.Sprite);
        cc.resources.load("images/seed/corn", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          csp.spriteFrame = frame;
        });
        corn.on("touchstart", function(touch) {
          check.active = true;
          check.x = corn.x;
          check.y = corn.y;
          seedIndex = 4;
        });
        corn.parent = node;
        check = new cc.Node();
        check.active = false;
        var sp = check.addComponent(cc.Sprite);
        cc.resources.load("images/seed/success", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          sp.spriteFrame = frame;
        });
        check.parent = node;
        var btn = new cc.Node();
        btn.x = -45;
        btn.y = -145;
        btn.scaleY = .8;
        btn.setContentSize(200, 40);
        var bsp = btn.addComponent(cc.Sprite);
        cc.resources.load("images/ui/img3", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          bsp.spriteFrame = frame;
        });
        btn.on("touchstart", function(touch) {
          cc.log("\u571f\u5730\u7f16\u53f7:", landIndex, "\u79cd\u690d:", seedIndex);
          if (0 == seedIndex) return;
          _this13.Send({
            kid: _this13.kid,
            method: "sowing",
            params: [ landIndex + 1, seedIndex ]
          });
        });
        btn.parent = node;
        var labelNode = new cc.Node();
        var label = labelNode.addComponent(cc.Label);
        label.string = "SOWING";
        label.node.color = new cc.Color(0, 0, 0, 255);
        label.verticalAlign = "CENTER";
        labelNode.parent = btn;
      },
      setGrow: function setGrow(node, data) {
        var lNode = new cc.Node();
        lNode.x = -80;
        var clabel = lNode.addComponent(cc.Label);
        clabel.fontSize = 45;
        clabel.string = "Name: " + data.seed.name + "\nYield: " + data.seed["yield"] + "\nMature time: " + (Number(data.seed.grow) + Number(data.produce.unix));
        clabel.node.color = new cc.Color(0, 0, 0, 255);
        clabel.verticalAlign = "CENTER";
        clabel.lineHeight = 80;
        lNode.parent = node;
      },
      setHarvest: function setHarvest(node, data) {
        var _this14 = this;
        var lNode = new cc.Node();
        lNode.x = -45;
        lNode.y = 80;
        var clabel = lNode.addComponent(cc.Label);
        clabel.fontSize = 45;
        clabel.string = "Name: " + data.name + "\nYield: " + data["yield"];
        clabel.node.color = new cc.Color(0, 0, 0, 255);
        clabel.verticalAlign = "CENTER";
        clabel.lineHeight = 80;
        lNode.parent = node;
        var btn = new cc.Node();
        btn.x = -45;
        btn.y = -95;
        btn.scaleY = .8;
        btn.setContentSize(200, 40);
        var bsp = btn.addComponent(cc.Sprite);
        cc.resources.load("images/ui/img3", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          bsp.spriteFrame = frame;
        });
        btn.on("touchstart", function(touch) {
          cc.log("\u6536\u83b7\u571f\u5730", data.landIndex);
          _this14.Send({
            kid: _this14.kid,
            method: "harvest",
            params: [ data.landIndex + 1 ]
          });
        });
        btn.parent = node;
        var labelNode = new cc.Node();
        var label = labelNode.addComponent(cc.Label);
        label.string = "HARVEST";
        label.node.color = new cc.Color(0, 0, 0, 255);
        label.verticalAlign = "CENTER";
        labelNode.parent = btn;
      },
      setTxHash: function setTxHash(node, data) {
        var _this15 = this;
        var lNode = new cc.Node();
        lNode.x = -45;
        lNode.y = 80;
        var clabel = lNode.addComponent(cc.Label);
        clabel.fontSize = 45;
        clabel.string = data.name;
        clabel.node.color = new cc.Color(0, 0, 0, 255);
        clabel.verticalAlign = "CENTER";
        clabel.lineHeight = 80;
        lNode.parent = node;
        var btn = new cc.Node();
        btn.x = -45;
        btn.y = -95;
        btn.scaleY = .8;
        btn.setContentSize(200, 40);
        var bsp = btn.addComponent(cc.Sprite);
        cc.resources.load("images/ui/img3", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          bsp.spriteFrame = frame;
        });
        btn.on("touchstart", function(touch) {
          _this15.goView(data.txid);
        });
        btn.parent = node;
        var labelNode = new cc.Node();
        var label = labelNode.addComponent(cc.Label);
        label.string = "Explorer";
        label.node.color = new cc.Color(0, 0, 0, 255);
        label.verticalAlign = "CENTER";
        labelNode.parent = btn;
      },
      setLand: function setLand(node) {
        var sp = node.addComponent(cc.Sprite);
        cc.resources.load("images/fram/land-zero", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          sp.spriteFrame = frame;
        });
        node.parent = this.node;
      },
      setPlayer: function setPlayer() {
        var player = new cc.Node("player");
        player.scaleX = .6;
        player.scaleY = .6;
        player.x = -126.746;
        player.y = -163.837;
        var sp = player.addComponent(cc.Sprite);
        cc.resources.load("images/player/img1", cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          sp.spriteFrame = frame;
        });
        player.parent = this.node;
      },
      movePlayer: function movePlayer(gX, gY) {
        var x = this.node.children[this.node.children.length - 1].x;
        var y = this.node.children[this.node.children.length - 1].y;
        if (x == gX && y == gY) return;
        var tw = cc.tween(this.node.children[this.node.children.length - 1]).to(.6, {
          position: cc.v2(gX, gY)
        });
        tw.start();
      },
      setChild: function setChild(pNode, img) {
        var sp = null;
        if (0 == pNode.children.length) {
          var node = new cc.Node("Sprite");
          sp = node.addComponent(cc.Sprite);
          node.parent = pNode;
        } else sp = pNode.children[0].getComponent(cc.Sprite);
        cc.resources.load("images/fram/" + img, cc.SpriteFrame, function(err, frame) {
          if (err) {
            cc.error(err);
            return;
          }
          sp.spriteFrame = frame;
        });
      },
      getBalance: function getBalance(kids) {
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
          var address, result;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
             case 0:
              _context3.next = 2;
              return _wallet["default"].GetAccount();

             case 2:
              address = _context3.sent;
              _context3.next = 5;
              return _api["default"].post(_api["default"].BaseUrl + "/api/batch_balance", {
                owner: address,
                kids: kids
              });

             case 5:
              result = _context3.sent;
              return _context3.abrupt("return", result.data);

             case 7:
             case "end":
              return _context3.stop();
            }
          }, _callee3);
        }))();
      },
      playBackgroundMusic: function playBackgroundMusic() {
        var _this16 = this;
        cc.resources.load("bgm", cc.AudioClip, function(err, audioClip) {
          var audioSource = _this16.addComponent(cc.AudioSource);
          audioSource.clip = audioClip;
          audioSource.play();
          audioSource.schedule(function() {
            audioSource.isPlaying || audioSource.play();
          }, 10);
        });
      },
      Send: function Send(inc) {
        var _this17 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
          var r, fees, fee, tapScript, amount, pTxid, hex, result;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) switch (_context4.prev = _context4.next) {
             case 0:
              console.log(inc);
              _context4.prev = 1;
              r = new _taproot["default"](inc, _wallet["default"].GetNetWork());
              _context4.next = 5;
              return r.getFeeRate();

             case 5:
              fees = _context4.sent;
              fee = fees["fastestFee"];
              console.log(fee);
              tapScript = r.gen_TapScript(fee);
              amount = Number(tapScript.fee);
              console.log("relayer address->>>> ", tapScript.address);
              console.log("fee->>>> ", amount);
              _context4.next = 14;
              return _wallet["default"].Send(tapScript.address, amount);

             case 14:
              pTxid = _context4.sent;
              if (!pTxid) {
                _context4.next = 22;
                break;
              }
              _context4.next = 18;
              return r.gen_TxHex(pTxid, 0, amount);

             case 18:
              hex = _context4.sent;
              console.log(hex);
              result = r.Broadcast(hex);
              result.then(function(res) {
                console.log(res.data);
                _this17.setCache(inc, res.data);
                setTimeout(function() {
                  _this17.goView(res.data);
                }, 1500);
              })["catch"](function(err) {
                console.log(err);
              });

             case 22:
              _context4.next = 27;
              break;

             case 24:
              _context4.prev = 24;
              _context4.t0 = _context4["catch"](1);
              cc.log(_context4.t0);

             case 27:
             case "end":
              return _context4.stop();
            }
          }, _callee4, null, [ [ 1, 24 ] ]);
        }))();
      },
      setCache: function setCache(inc, txid) {
        inc.params[0] -= 1;
        var cache = cc.sys.localStorage.getItem(this.wallet + "cache");
        cache && (cache = JSON.parse(cache));
        if ("object" == typeof cache && null != cache && void 0 != cache) {
          var _Object$assign;
          cache = Object.assign(cache, (_Object$assign = {}, _Object$assign[inc.params[0]] = {
            op: inc.method,
            txid: txid
          }, _Object$assign));
        } else {
          var _cache7;
          cache = (_cache7 = {}, _cache7[inc.params[0]] = {
            op: inc.method,
            txid: txid
          }, _cache7);
        }
        cc.log(cache);
        cc.sys.localStorage.setItem(this.wallet + "cache", JSON.stringify(cache));
      },
      getLands: function getLands() {
        var _this18 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
          var result;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) switch (_context5.prev = _context5.next) {
             case 0:
              console.log(_this18.wallet);
              _context5.next = 3;
              return _api["default"].get(_api["default"].BaseUrl + "/api/lands/" + _this18.wallet);

             case 3:
              result = _context5.sent;
              if (result) {
                cc.sys.localStorage.setItem("lands", result.data);
                _this18.refresh(result.data);
              } else cc.log("\u83b7\u53d6\u571f\u5730\u51fa\u9519");

             case 5:
             case "end":
              return _context5.stop();
            }
          }, _callee5);
        }))();
      },
      refresh: function refresh(lands) {
        lands = JSON.parse(lands);
        for (var index = 0; index < this.landNodes.length; index++) {
          var land = this.landNodes[index];
          this.setChild(land, seedMap[lands[index].seedIndex].src);
        }
      },
      goView: function goView(txid) {
        "mainnet" == _wallet["default"].GetNetWork() ? window.location.href = "https://mempool.space/tx/" + txid : window.location.href = "https://mempool.space/testnet/tx/" + txid;
      }
    });
    cc._RF.pop();
  }, {
    "./wallet": "wallet",
    api: "api",
    taproot: "taproot"
  } ],
  started: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ffafbbx/pFFvrdNXaFu3bQc", "started");
    "use strict";
    var _wallet = _interopRequireDefault(require("./wallet"));
    var _api = _interopRequireDefault(require("api"));
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }
      info.done ? resolve(value) : Promise.resolve(value).then(_next, _throw);
    }
    function _asyncToGenerator(fn) {
      return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
          var gen = fn.apply(self, args);
          function _next(value) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }
          function _throw(err) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }
          _next(void 0);
        });
      };
    }
    cc.Class({
      extends: cc.Component,
      properties: {
        wallet: {
          default: "",
          type: String
        }
      },
      onLoad: function onLoad() {
        var _this = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
             case 0:
              _this.loadScripts();
              _context.next = 3;
              return _wallet["default"].Connect();

             case 3:
              _this.wallet = _context.sent;
              _this.wallet && _this.getLands();

             case 5:
             case "end":
              return _context.stop();
            }
          }, _callee);
        }))();
      },
      start: function start() {
        var _this2 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
             case 0:
              _this2.node.on("touchstart", function() {
                var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(event) {
                  return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) switch (_context2.prev = _context2.next) {
                     case 0:
                      cc.log("start");
                      if (!_this2.wallet) {
                        _context2.next = 5;
                        break;
                      }
                      cc.director.loadScene("farm");
                      _context2.next = 9;
                      break;

                     case 5:
                      _context2.next = 7;
                      return _wallet["default"].Connect();

                     case 7:
                      _this2.wallet = _context2.sent;
                      _this2.wallet && _this2.getLands();

                     case 9:
                     case "end":
                      return _context2.stop();
                    }
                  }, _callee2);
                }));
                return function(_x) {
                  return _ref.apply(this, arguments);
                };
              }(), _this2);

             case 1:
             case "end":
              return _context3.stop();
            }
          }, _callee3);
        }))();
      },
      loadScripts: function loadScripts() {
        var cUtils = document.createElement("script");
        cUtils.src = "https://unpkg.com/@cmdcode/crypto-utils";
        document.head.appendChild(cUtils);
        var tapScript = document.createElement("script");
        tapScript.src = "https://unpkg.com/@cmdcode/tapscript";
        document.head.appendChild(tapScript);
      },
      getLands: function getLands() {
        var _this3 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
          var result;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) switch (_context4.prev = _context4.next) {
             case 0:
              console.log(_this3.wallet);
              _context4.next = 3;
              return _api["default"].get(_api["default"].BaseUrl + "/api/lands/" + _this3.wallet);

             case 3:
              result = _context4.sent;
              result ? cc.sys.localStorage.setItem("lands", result.data) : cc.log("\u83b7\u53d6\u571f\u5730\u51fa\u9519");

             case 5:
             case "end":
              return _context4.stop();
            }
          }, _callee4);
        }))();
      }
    });
    cc._RF.pop();
  }, {
    "./wallet": "wallet",
    api: "api"
  } ],
  taproot: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0ac2fzU9nNFv52vwtjgjX7n", "taproot");
    "use strict";
    exports.__esModule = true;
    exports["default"] = void 0;
    var _regeneratorRuntime = _interopRequireDefault(require("regenerator-runtime"));
    var _api = _interopRequireDefault(require("api"));
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }
      info.done ? resolve(value) : Promise.resolve(value).then(_next, _throw);
    }
    function _asyncToGenerator(fn) {
      return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
          var gen = fn.apply(self, args);
          function _next(value) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }
          function _throw(err) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }
          _next(void 0);
        });
      };
    }
    var ec = new TextEncoder();
    var serviceFee = 2500;
    var Relayer = function() {
      function Relayer(data, network) {
        void 0 === network && (network = "mainnet");
        this.network = void 0;
        this.secret = void 0;
        this.seckey = void 0;
        this.pubkey = void 0;
        this.data = void 0;
        this.tapScript = void 0;
        if ("object" != typeof data) throw new Error("data is not object");
        this.network = network;
        this.data = JSON.stringify(data);
        this.secret = window.crypto_utils.util.random(32).hex;
        this.seckey = window.crypto_utils.keys.get_seckey(this.secret);
        this.pubkey = window.crypto_utils.keys.get_pubkey(this.seckey, true);
      }
      var _proto = Relayer.prototype;
      _proto.gen_TapScript = function gen_TapScript(feeRate) {
        void 0 === feeRate && (feeRate = 1);
        var marker = ec.encode("ord");
        var op = ec.encode("send");
        var data = ec.encode(this.data);
        var script = [ this.pubkey, "OP_CHECKSIG", "OP_0", "OP_IF", marker, "01", op, "OP_0", data, "OP_ENDIF" ];
        var tapleaf = window.tapscript.Tap.encodeScript(script);
        var _window$tapscript$Tap = window.tapscript.Tap.getPubKey(this.pubkey, {
          target: tapleaf
        }), tpubkey = _window$tapscript$Tap[0], cblock = _window$tapscript$Tap[1];
        var address = window.tapscript.Address.p2tr.fromPubKey(tpubkey, this.network);
        var txsize = 200 + this.data.length / 2;
        var fee = Math.round(feeRate * txsize) + serviceFee;
        this.tapScript = {
          script: script,
          tapleaf: tapleaf,
          tpubkey: tpubkey,
          cblock: cblock,
          address: address,
          fee: fee
        };
        return this.tapScript;
      };
      _proto.gen_TxHex = function() {
        var _gen_TxHex = _asyncToGenerator(_regeneratorRuntime["default"].mark(function _callee(txid, vout, value) {
          var tAddress, tx_data, sig, isValid, txHex;
          return _regeneratorRuntime["default"].wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
             case 0:
              if (this.tapScript) {
                _context.next = 2;
                break;
              }
              throw new Error("Build tapscript first");

             case 2:
              tAddress = this.getTargetAddr();
              _context.next = 5;
              return window.tapscript.Tx.create({
                version: 2,
                vin: [ {
                  txid: txid,
                  vout: vout,
                  prevout: {
                    value: value,
                    scriptPubKey: window.tapscript.Address.toScriptPubKey(this.tapScript.address)
                  },
                  witness: []
                } ],
                vout: [ {
                  value: 2500,
                  scriptPubKey: window.tapscript.Address.toScriptPubKey(tAddress)
                } ]
              });

             case 5:
              tx_data = _context.sent;
              _context.next = 8;
              return window.tapscript.Signer.taproot.sign(this.seckey, tx_data, 0, {
                extension: this.tapScript.tapleaf
              });

             case 8:
              sig = _context.sent;
              tx_data.vin[0].witness = [ sig, this.tapScript.script, this.tapScript.cblock ];
              isValid = window.tapscript.Signer.taproot.verify(tx_data, 0, {
                pubkey: this.pubkey,
                throws: true
              });
              if (isValid) {
                _context.next = 13;
                break;
              }
              throw new Error("invalid transactions");

             case 13:
              _context.next = 15;
              return window.tapscript.Tx.encode(tx_data).hex;

             case 15:
              txHex = _context.sent;
              return _context.abrupt("return", txHex);

             case 17:
             case "end":
              return _context.stop();
            }
          }, _callee, this);
        }));
        function gen_TxHex(_x, _x2, _x3) {
          return _gen_TxHex.apply(this, arguments);
        }
        return gen_TxHex;
      }();
      _proto.getLastVout = function() {
        var _getLastVout = _asyncToGenerator(_regeneratorRuntime["default"].mark(function _callee2(address) {
          var lastVoutTx, url, response, txList, i, tx, index, output;
          return _regeneratorRuntime["default"].wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
             case 0:
              lastVoutTx = null;
              url = "https://mempool.space/testnet/api/address/" + address + "/txs";
              _context2.t0 = this.network;
              _context2.next = "testnet" === _context2.t0 ? 5 : "mainnet" === _context2.t0 ? 7 : 9;
              break;

             case 5:
              url = "https://mempool.space/testnet/api/address/" + address + "/txs";
              return _context2.abrupt("break", 9);

             case 7:
              url = "https://mempool.space/api/address/" + address + "/txs";
              return _context2.abrupt("break", 9);

             case 9:
              _context2.next = 11;
              return _api["default"].get(url);

             case 11:
              response = _context2.sent;
              if (!response) {
                _context2.next = 32;
                break;
              }
              txList = response.data;
              if (!txList) {
                _context2.next = 32;
                break;
              }
              i = 0;

             case 16:
              if (!(i < txList.length)) {
                _context2.next = 32;
                break;
              }
              tx = txList[i];
              index = 0;

             case 19:
              if (!(index < tx.vout.length)) {
                _context2.next = 27;
                break;
              }
              output = tx.vout[index];
              if (!(output["scriptpubkey_address"] == address)) {
                _context2.next = 24;
                break;
              }
              lastVoutTx = {
                txid: tx["txid"],
                vout: index,
                amount: output["value"]
              };
              return _context2.abrupt("break", 27);

             case 24:
              index++;
              _context2.next = 19;
              break;

             case 27:
              if (!lastVoutTx) {
                _context2.next = 29;
                break;
              }
              return _context2.abrupt("break", 32);

             case 29:
              i++;
              _context2.next = 16;
              break;

             case 32:
              return _context2.abrupt("return", lastVoutTx);

             case 33:
             case "end":
              return _context2.stop();
            }
          }, _callee2, this);
        }));
        function getLastVout(_x4) {
          return _getLastVout.apply(this, arguments);
        }
        return getLastVout;
      }();
      _proto.getFeeRate = function() {
        var _getFeeRate = _asyncToGenerator(_regeneratorRuntime["default"].mark(function _callee3() {
          var response, fees;
          return _regeneratorRuntime["default"].wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
             case 0:
              response = null;
              _context3.t0 = this.network;
              _context3.next = "testnet" === _context3.t0 ? 4 : "mainnet" === _context3.t0 ? 8 : 12;
              break;

             case 4:
              _context3.next = 6;
              return _api["default"].get("https://mempool.space/testnet/api/v1/fees/recommended");

             case 6:
              response = _context3.sent;
              return _context3.abrupt("break", 12);

             case 8:
              _context3.next = 10;
              return _api["default"].get("https://mempool.space/api/v1/fees/recommended");

             case 10:
              response = _context3.sent;
              return _context3.abrupt("break", 12);

             case 12:
              fees = response.data;
              return _context3.abrupt("return", fees);

             case 14:
             case "end":
              return _context3.stop();
            }
          }, _callee3, this);
        }));
        function getFeeRate() {
          return _getFeeRate.apply(this, arguments);
        }
        return getFeeRate;
      }();
      _proto.Broadcast = function Broadcast(data) {
        var response = null;
        switch (this.network) {
         case "testnet":
          response = _api["default"].post2("https://mempool.space/testnet/api/tx", data);
          break;

         case "mainnet":
          response = _api["default"].post2("https://mempool.space/api/tx", data);
        }
        return response;
      };
      _proto.getTargetAddr = function getTargetAddr() {
        switch (this.network) {
         case "mainnet":
          return "3LAoUiU2X2cKRURL3hTHMufHM15Xrk2K9s";

         case "testnet":
          return "2N4vkrW97TmqdtdkHvMpfuRMqJF17CSvbFC";

         default:
          throw new Error("Unsupported networks");
        }
      };
      return Relayer;
    }();
    var _default = Relayer;
    exports["default"] = _default;
    module.exports = exports["default"];
    cc._RF.pop();
  }, {
    api: "api",
    "regenerator-runtime": void 0
  } ],
  tips: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4b8f76610pH0rbgfIa1toZr", "tips");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      start: function start() {
        this.node.on("touchstart", function(touch) {
          touch.stopPropagation();
        });
      }
    });
    cc._RF.pop();
  }, {} ],
  transfer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5acd155JtJPF7yPDJVCrjsY", "transfer");
    "use strict";
    var _wallet = _interopRequireDefault(require("./wallet"));
    var _taproot = _interopRequireDefault(require("taproot"));
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }
      info.done ? resolve(value) : Promise.resolve(value).then(_next, _throw);
    }
    function _asyncToGenerator(fn) {
      return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
          var gen = fn.apply(self, args);
          function _next(value) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }
          function _throw(err) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }
          _next(void 0);
        });
      };
    }
    cc.Class({
      extends: cc.Component,
      properties: {
        nodeSize: {
          default: 0,
          type: Number
        },
        kid: {
          default: null,
          type: String
        },
        to: {
          default: null,
          type: String
        },
        amount: {
          default: null,
          type: String
        }
      },
      onLoad: function onLoad() {
        var _this = this;
        this.nodeSize = this.node.children.length;
        this.node.children[this.nodeSize - 3].on("text-changed", function(input) {
          _this.to = input.string;
        });
        this.node.children[this.nodeSize - 2].on("text-changed", function(input) {
          _this.amount = input.string;
        });
        this.node.children[this.nodeSize - 1].on("touchstart", function() {
          if (NaN == Number(_this.amount)) return;
          _this.Send();
          cc.log(_this.kid, _this.to, _this.amount);
          _this.node.active = false;
        });
        this.node.children[2].on("touchstart", function() {
          _this.node.active = false;
        });
        this.node.on("touchstart", function(touch) {
          touch.stopPropagation();
        });
      },
      start: function start() {},
      onEnable: function onEnable() {
        this.kid = cc.sys.localStorage.getItem("kid");
        if (!this.kid) throw Error("invalid kid");
        this.node.children[this.nodeSize - 3].getComponent(cc.EditBox).string = "";
        this.node.children[this.nodeSize - 2].getComponent(cc.EditBox).string = "";
      },
      Send: function Send() {
        var _this2 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
          var inc, r, fees, fee, tapScript, amount, pTxid, hex, result;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
             case 0:
              inc = {
                kid: _this2.kid,
                method: "transfer",
                params: [ _this2.to, _this2.amount ]
              };
              console.log(inc);
              _context.prev = 2;
              r = new _taproot["default"](inc, _wallet["default"].GetNetWork());
              _context.next = 6;
              return r.getFeeRate();

             case 6:
              fees = _context.sent;
              fee = fees["fastestFee"];
              console.log(fee);
              tapScript = r.gen_TapScript(fee);
              amount = Number(tapScript.fee);
              console.log("relayer address->>>> ", tapScript.address);
              console.log("fee->>>> ", amount);
              _context.next = 15;
              return _wallet["default"].Send(tapScript.address, amount);

             case 15:
              pTxid = _context.sent;
              if (!pTxid) {
                _context.next = 23;
                break;
              }
              _context.next = 19;
              return r.gen_TxHex(pTxid, 0, amount);

             case 19:
              hex = _context.sent;
              console.log(hex);
              result = r.Broadcast(hex);
              result.then(function(res) {
                console.log(res.data);
                "mainnet" == _wallet["default"].GetNetWork() ? window.location.href = "https://mempool.space/tx/" + res.data : window.location.href = "https://mempool.space/testnet/tx/" + res.data;
              })["catch"](function(err) {
                console.log(err);
              });

             case 23:
              _context.next = 28;
              break;

             case 25:
              _context.prev = 25;
              _context.t0 = _context["catch"](2);
              cc.log(_context.t0);

             case 28:
             case "end":
              return _context.stop();
            }
          }, _callee, null, [ [ 2, 25 ] ]);
        }))();
      }
    });
    cc._RF.pop();
  }, {
    "./wallet": "wallet",
    taproot: "taproot"
  } ],
  wallet: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "305f7DVGQpGJa/+XdsXZWcN", "wallet");
    "use strict";
    exports.__esModule = true;
    exports["default"] = void 0;
    var _api = _interopRequireDefault(require("api"));
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }
      info.done ? resolve(value) : Promise.resolve(value).then(_next, _throw);
    }
    function _asyncToGenerator(fn) {
      return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
          var gen = fn.apply(self, args);
          function _next(value) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }
          function _throw(err) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }
          _next(void 0);
        });
      };
    }
    var Wallet = null;
    var walletAddr = null;
    var network = "testnet";
    var _default = {
      GetNetWork: function GetNetWork() {
        return network;
      },
      Connect: function Connect() {
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
          var result;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
             case 0:
              _context.prev = 0;
              Wallet = window.XverseProviders.BitcoinProvider;
              _context.next = 4;
              return Wallet.request("getAccounts", {
                purposes: [ "payment" ],
                message: "Address for receiving payments"
              });

             case 4:
              result = _context.sent;
              if (!result.result) {
                _context.next = 9;
                break;
              }
              if (!(result.result.length > 0)) {
                _context.next = 9;
                break;
              }
              walletAddr = result.result[0].address;
              return _context.abrupt("return", walletAddr);

             case 9:
              if (!result.error) {
                _context.next = 11;
                break;
              }
              throw new Error(result.error.message);

             case 11:
              _context.next = 17;
              break;

             case 13:
              _context.prev = 13;
              _context.t0 = _context["catch"](0);
              alert(_context.t0);
              throw _context.t0;

             case 17:
             case "end":
              return _context.stop();
            }
          }, _callee, null, [ [ 0, 13 ] ]);
        }))();
      },
      GetAccount: function GetAccount() {
        return walletAddr;
      },
      Send: function Send(recipient, amount) {
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
          var result;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
             case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return Wallet.request("sendTransfer", {
                recipients: [ {
                  address: recipient,
                  amount: Number(amount)
                } ]
              });

             case 3:
              result = _context2.sent;
              if (!result.result) {
                _context2.next = 6;
                break;
              }
              return _context2.abrupt("return", result.result.txid);

             case 6:
              if (!result.error) {
                _context2.next = 8;
                break;
              }
              throw new Error(result.error.message);

             case 8:
              _context2.next = 14;
              break;

             case 10:
              _context2.prev = 10;
              _context2.t0 = _context2["catch"](0);
              alert(_context2.t0);
              throw _context2.t0;

             case 14:
             case "end":
              return _context2.stop();
            }
          }, _callee2, null, [ [ 0, 10 ] ]);
        }))();
      },
      GetBalance: function GetBalance(address) {
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
          var response, balance, utxos, _utxos;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
             case 0:
              response = null;
              balance = 0;
              _context3.t0 = network;
              _context3.next = "testnet" === _context3.t0 ? 5 : "mainnet" === _context3.t0 ? 10 : 15;
              break;

             case 5:
              _context3.next = 7;
              return _api["default"].get("https://mempool.space/testnet/api/address/" + address + "/utxo");

             case 7:
              response = _context3.sent;
              if (response) {
                utxos = response.data;
                utxos && utxos.forEach(function(utxo) {
                  balance += utxo.value;
                });
              }
              return _context3.abrupt("break", 15);

             case 10:
              _context3.next = 12;
              return _api["default"].get("https://mempool.space/api/address/" + address + "/utxo");

             case 12:
              response = _context3.sent;
              if (response) {
                _utxos = response.data;
                _utxos && _utxos.forEach(function(utxo) {
                  balance += utxo.value;
                });
              }
              return _context3.abrupt("break", 15);

             case 15:
              return _context3.abrupt("return", balance / 1e8);

             case 16:
             case "end":
              return _context3.stop();
            }
          }, _callee3);
        }))();
      }
    };
    exports["default"] = _default;
    module.exports = exports["default"];
    cc._RF.pop();
  }, {
    api: "api"
  } ]
}, {}, [ "api", "axios", "layout", "started", "taproot", "tips", "transfer", "wallet" ]);