"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// helper functions
var $ = function $(sel) {
  return document.querySelector(sel);
};

var delay = function delay(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};

var showFunction = function showFunction(el) {
  return function () {
    var show = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    return el.classList[show ? 'remove' : 'add']('hidden');
  };
}; // steps


var steps = ['introduction', 'record', 'success'];
var stepEls = steps.map(function (name) {
  return $("#step-".concat(name));
});

var focusStep = function focusStep(n) {
  return stepEls.forEach(function (el, i) {
    return el.classList[i === n ? 'add' : 'remove']('current');
  });
};

focusStep(0); // step 0

var goButton = $('#go');
goButton.addEventListener('click', uiStartRecording);
var types = ['memoir', 'meme'];
var typeRadios = types.map(function (type) {
  return $("#".concat(type));
});

var _iterator = _createForOfIteratorHelper(typeRadios),
    _step;

try {
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    var radio = _step.value;
    radio.addEventListener('change', updateType);
  }
} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}

function updateType() {
  var current = getType();
  $('#name').setAttribute('placeholder', {
    memoir: '我的一位语文老师',
    meme: '唐艳杰'
  }[current]);
  $('label[for=name]').innerText = {
    memoir: '留言对象',
    meme: '模仿对象'
  }[current];
  $('label[for=say]').innerText = {
    memoir: '心里话',
    meme: '要模仿的话'
  }[current];
  $('#name-helper').innerText = {
    memoir: '可以是某一位老师、某一个备课组的老师或年级全体老师，但最好不要出现具体老师的姓名，可以用「我的一位 xx（科目）老师」等代替。',
    meme: '老师的真实姓名'
  }[current];
}

var getType = function getType() {
  return types[typeRadios.findIndex(function (x) {
    return x.checked;
  })];
};

var getRecordTip = function getRecordTip() {
  return "".concat({
    memoir: '致：',
    meme: '模仿：'
  }[getType()]).concat($('#name').value, "\n").concat($('#say').value);
};

try {
  updateType();
} catch (e) {} // step 1


var countdownEl = $('#countdown');
var timeEl = $('#time');
$('#stop').addEventListener('click', uiStopRecording);
$('#play').addEventListener('click', playback);
$('#redo').addEventListener('click', uiStartRecording);
var uploadEl = $('#upload');
uploadEl.addEventListener('click', uiUpload);
$('#back-1').addEventListener('click', function () {
  return focusStep(0);
});
var showCountdown = showFunction(countdownEl);
var showTime = showFunction($('#recording'));
var showStop = showFunction($('#stop'));
var showStart = showFunction($('#stopped'));

var setCountdown = function setCountdown(number) {
  return countdownEl.innerText = number;
};

var setTime = function setTime(number) {
  return timeEl.innerText = number;
};

var timerId;

var doCountdown = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var _i, _arr, i;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            showStop(false);
            showStart(false);
            showTime(false);
            showCountdown(true);
            _i = 0, _arr = [3, 2, 1];

          case 5:
            if (!(_i < _arr.length)) {
              _context.next = 13;
              break;
            }

            i = _arr[_i];
            setCountdown(i);
            _context.next = 10;
            return delay(1000);

          case 10:
            _i++;
            _context.next = 5;
            break;

          case 13:
            showCountdown(false);
            showTime(true);
            showStop(true);

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function doCountdown() {
    return _ref.apply(this, arguments);
  };
}();

var isInvalidName = function isInvalidName(name) {
  return name.length > 5 && !/^[a-zA-Z0-9 ]+$/.test(name) || name.length < 2 || /^[0-9]+$/.test(name);
};

function uiStartRecording() {
  return _uiStartRecording.apply(this, arguments);
}

function _uiStartRecording() {
  _uiStartRecording = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var name, stream, startTime, updateTime;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            name = $('#name').value.trim();

            if (!(getType() === 'meme' && isInvalidName(name))) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt("return", alert("\u300C".concat(name, "\u300D\u4F3C\u4E4E\u4E0D\u662F\u4E00\u4F4D\u8001\u5E08\u7684\u59D3\u540D\u3002")));

          case 3:
            if (!(name === '')) {
              _context2.next = 5;
              break;
            }

            return _context2.abrupt("return", $('#name').focus());

          case 5:
            if (!($('#say').value.trim() === '')) {
              _context2.next = 7;
              break;
            }

            return _context2.abrupt("return", $('#say').focus());

          case 7:
            focusStep(1);
            $('#record-tip').innerText = getRecordTip();
            _context2.prev = 9;
            _context2.next = 12;
            return requestPermissions();

          case 12:
            stream = _context2.sent;
            _context2.next = 18;
            break;

          case 15:
            _context2.prev = 15;
            _context2.t0 = _context2["catch"](9);
            return _context2.abrupt("return", focusStep(0));

          case 18:
            _context2.next = 20;
            return doCountdown();

          case 20:
            startTime = Date.now();

            updateTime = function updateTime() {
              var dt = Math.floor((Date.now() - startTime) / 1000);
              var min = String(Math.floor(dt / 60)).padStart(2, '0');
              var sec = String(dt % 60).padStart(2, '0');
              setTime("".concat(min, ":").concat(sec));
            };

            updateTime();
            $('#recording').classList.remove('stop');
            timerId = setInterval(updateTime, 1000);
            startRecording(stream);

          case 26:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[9, 15]]);
  }));
  return _uiStartRecording.apply(this, arguments);
}

function uiStopRecording() {
  stopRecording();
  showStop(false);
  showStart(true);
  $('#recording').classList.add('stop');
  clearInterval(timerId);
}

function uiUpload() {
  return _uiUpload.apply(this, arguments);
} // step 2


function _uiUpload() {
  _uiUpload = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            uploadEl.disabled = true;
            _context3.prev = 1;
            _context3.next = 4;
            return startUpload();

          case 4:
            focusStep(2);
            _context3.next = 11;
            break;

          case 7:
            _context3.prev = 7;
            _context3.t0 = _context3["catch"](1);
            console.error(_context3.t0);
            alert('上传时出现网络错误，请重试。调试信息：' + _context3.t0);

          case 11:
            _context3.prev = 11;
            uploadEl.disabled = false;
            return _context3.finish(11);

          case 14:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 7, 11, 14]]);
  }));
  return _uiUpload.apply(this, arguments);
}

$('#back').addEventListener('click', function () {
  return focusStep(0);
}); // audio

var mediaState = {};

function requestPermissions() {
  return _requestPermissions.apply(this, arguments);
}

function _requestPermissions() {
  _requestPermissions = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return navigator.mediaDevices.getUserMedia({
              audio: true
            });

          case 3:
            return _context4.abrupt("return", _context4.sent);

          case 6:
            _context4.prev = 6;
            _context4.t0 = _context4["catch"](0);
            console.error(_context4.t0);

            if (!(_context4.t0.name === 'NotAllowedError')) {
              _context4.next = 12;
              break;
            }

            alert('请授权使用麦克风');
            throw _context4.t0;

          case 12:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 6]]);
  }));
  return _requestPermissions.apply(this, arguments);
}

function startRecording(stream) {
  var recorder = mediaState.recorder = new MediaRecorder(stream);
  recorder.start();
  var chunks = mediaState.chunks = [];
  recorder.addEventListener('dataavailable', function (e) {
    chunks.push(e.data);
  });
  recorder.addEventListener('stop', function () {
    var blob = mediaState.blob = new Blob(chunks);
    mediaState.audio = new Audio(URL.createObjectURL(blob));
  });
}

function stopRecording() {
  mediaState.recorder.stop();
}

function playback() {
  mediaState.audio.play();
}

function startUpload() {
  return _startUpload.apply(this, arguments);
} // misc


function _startUpload() {
  _startUpload = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
    var form, xhr, promise;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            form = new FormData();
            form.append('audio', mediaState.blob);
            form.append('name', $('#name').value);
            form.append('say', $('#say').value);
            form.append('type', getType());
            xhr = new XMLHttpRequest();
            xhr.timeout = 30 * 1000;
            promise = new Promise(function (resolve, reject) {
              xhr.addEventListener('load', function () {
                if (xhr.status === 200 || xhr.status === 204) return resolve();
                reject(xhr.status);
              });
              xhr.addEventListener('error', reject);
            });
            xhr.open('POST', new URL('/upload', location.href));
            xhr.send(form);
            _context5.next = 12;
            return promise;

          case 12:
            return _context5.abrupt("return", _context5.sent);

          case 13:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _startUpload.apply(this, arguments);
}

var ripples = [].concat(_toConsumableArray(document.querySelectorAll('[data-ripple]')), _toConsumableArray(document.querySelectorAll('.mdc-button')), _toConsumableArray(document.querySelectorAll('.mdc-fab')));

var _iterator2 = _createForOfIteratorHelper(ripples),
    _step2;

try {
  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
    var el = _step2.value;
    mdc.ripple.MDCRipple.attachTo(el);
  }
} catch (err) {
  _iterator2.e(err);
} finally {
  _iterator2.f();
}

var _iterator3 = _createForOfIteratorHelper(document.querySelectorAll('.mdc-text-field')),
    _step3;

try {
  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
    var _el = _step3.value;
    mdc.textfield.MDCTextField.attachTo(_el);
  }
} catch (err) {
  _iterator3.e(err);
} finally {
  _iterator3.f();
}

