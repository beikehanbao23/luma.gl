'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-disable no-console */


exports.formatTime = formatTime;

var _cookieCutter = require('cookie-cutter');

var _cookieCutter2 = _interopRequireDefault(_cookieCutter);

var _env = require('./env');

var _d3Format = require('d3-format');

var _d3Format2 = _interopRequireDefault(_d3Format);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var formatSI = _d3Format2.default.format('.3s');

// TODO: Currently unused, keeping in case we want it later for log formatting
function formatTime(ms) {
  var formatted = void 0;
  if (ms < 10) {
    formatted = ms.toFixed(2) + 'ms';
  } else if (ms < 100) {
    formatted = ms.toFixed(1) + 'ms';
  } else if (ms < 1000) {
    formatted = (ms / 1000).toFixed(3) + 's';
  } else {
    formatted = (ms / 1000).toFixed(2) + 's';
  }
  return formatted;
}

var DEFAULT_CONFIG = {
  // off by default
  isEnabled: false,
  // logging level
  level: 1,
  // Whether logging is turned on
  isLogEnabled: true,
  // Whether logging prints to console
  isPrintEnabled: true,
  // Whether Probe#run executes code
  isRunEnabled: true
};

var COOKIE_NAME = '__probe__';

function noop() {}

var TO_DISABLE = ['_probe', '_fps', '_externalProbe', '_log', 'run', 'getOption', 'getIterationsPerSecond', 'logIterationsPerSecond'];

var Probe = function () {

  /**
   * @constructor
   * @param {Object} config Optional configuration args; see #configure
   */
  function Probe() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Probe);

    // Data containers
    this._logStore = [];
    this._sampleStore = {};
    this._fpsStore = {};
    this._startStore = {};
    // Timestamps - pegged to an arbitrary time in the past
    this._startTs = (0, _env.timestamp)();
    this._deltaTs = (0, _env.timestamp)();
    // Other systems passing in epoch info require an epoch ts to convert
    this._startEpochTs = Date.now();
    this._iterationsTs = null;
    // Configuration
    this._config = config.ignoreEnvironment ? _extends({}, DEFAULT_CONFIG) : this._getConfigFromEnvironment();
    // Override with new configuration, if any
    this.configure(config);
    // Disable methods if necessary
    if (!this._config.isEnabled) {
      this.disable();
    }
  }

  /**
   * Turn probe on
   * @return {Probe} self, to support chaining
   */


  _createClass(Probe, [{
    key: 'enable',
    value: function enable() {
      // Swap in live methods
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = TO_DISABLE[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var method = _step.value;

          this[method] = Probe.prototype[method];
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return this.configure({ isEnabled: true });
    }

    /**
     * Turn probe off
     * @return {Probe} self, to support chaining
     */

  }, {
    key: 'disable',
    value: function disable() {
      // Swap in noops for live methods
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = TO_DISABLE[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var method = _step2.value;

          this[method] = noop;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return this.configure({ isEnabled: false });
    }

    /**
     * Convenience function: Set probe level
     * @param {Number} level Level to set
     * @return {Probe} self, to support chaining
     */

  }, {
    key: 'setLevel',
    value: function setLevel(level) {
      return this.configure({ level: level });
    }

    /**
     * Configure probe with new values (can include custom key/value pairs).
     * Configuration will be persisted across browser sessions
     * @param {Object} config - named parameters
     * @param {Boolean} config.isEnabled Whether probe is enabled
     * @param {Number} config.level Logging level
     * @param {Boolean} config.isLogEnabled Whether logging prints to console
     * @param {Boolean} config.isRunEnabled Whether #run executes code
     * @return {Probe} self, to support chaining
     */

  }, {
    key: 'configure',
    value: function configure() {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var newConfig = _extends({}, this._config, config);
      this._config = newConfig;
      if (!_env.IS_NODE) {
        var serialized = JSON.stringify(newConfig);
        _cookieCutter2.default.set(COOKIE_NAME, serialized);
      }
      // Support chaining
      return this;
    }

    /**
     * Get a single option from preset configuration. Useful when using Probe to
     * set developer-only switches.
     * @param  {String} key Key to get value for
     * @return {mixed}     Option value, or undefined
     */

  }, {
    key: 'getOption',
    value: function getOption(key) {
      return this._config[key];
    }

    /**
     * Get current log, as an array of log row objects
     * @return {Object[]} Log
     */

  }, {
    key: 'getLog',
    value: function getLog() {
      return this._logStore.slice();
    }

    /**
     * Whether Probe is currently enabled
     * @return {Boolean} isEnabled
     */

  }, {
    key: 'isEnabled',
    value: function isEnabled() {
      return Boolean(this._config.isEnabled);
    }

    /**
     * Reset all internal stores, dropping logs
     */

  }, {
    key: 'reset',
    value: function reset() {
      // Data containers
      this._logStore = [];
      this._sampleStore = {};
      this._fpsStore = {};
      this._startStore = {};
      // Timestamps
      this._startTs = (0, _env.timestamp)();
      this._deltaTs = (0, _env.timestamp)();
      this._iterationsTs = null;
    }

    /**
     * Reset the long timer
     */

  }, {
    key: 'resetStart',
    value: function resetStart() {
      this._startTs = this._deltaTs = (0, _env.timestamp)();
    }

    /**
     * Reset the time since last probe
     */

  }, {
    key: 'resetDelta',
    value: function resetDelta() {
      this._deltaTs = (0, _env.timestamp)();
    }

    /**
     * @return {Number} milliseconds, with fractions
     */

  }, {
    key: 'getTotal',
    value: function getTotal() {
      return (0, _env.timestamp)() - this._startTs;
    }

    /**
     * @return {Number} milliseconds, with fractions
     */

  }, {
    key: 'getDelta',
    value: function getDelta() {
      return (0, _env.timestamp)() - this._deltaTs;
    }
  }, {
    key: '_getElapsedTime',
    value: function _getElapsedTime() {
      var total = (0, _env.timestamp)() - this._startTs;
      var delta = (0, _env.timestamp)() - this._deltaTs;
      // reset delta timer
      this._deltaTs = (0, _env.timestamp)();
      return { total: total, delta: delta };
    }
  }, {
    key: '_log',
    value: function _log(level, name) {
      var meta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var times = this._getElapsedTime();
      var logRow = _extends({ level: level, name: name }, times, meta);
      // duration handling
      if (meta.start) {
        this._startStore[name] = (0, _env.timestamp)();
      } else if (meta.end) {
        // If start isn't found, take the full duration since initialization
        var start = this._startStore[name] || this._startTs;
        logRow.duration = (0, _env.timestamp)() - start;
      }
      this._logStore.push(logRow);
      // Log to console if enabled
      if (this._config.isPrintEnabled) {
        // TODO: Nicer console logging
        _env.logger.debug(JSON.stringify(logRow));
      }
    }
  }, {
    key: '_shouldLog',
    value: function _shouldLog(probeLevel) {
      var _config = this._config;
      var isEnabled = _config.isEnabled;
      var isLogEnabled = _config.isLogEnabled;
      var level = _config.level;

      return isEnabled && isLogEnabled && level >= probeLevel;
    }

    /**
     * Displays a double timing (from "start time" and from last probe).
     */

  }, {
    key: 'probe',
    value: function probe() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this._probe.apply(this, [1].concat(args));
    }
  }, {
    key: 'probe1',
    value: function probe1() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      this._probe.apply(this, [1].concat(args));
    }
  }, {
    key: 'probe2',
    value: function probe2() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      this._probe.apply(this, [2].concat(args));
    }
  }, {
    key: 'probe3',
    value: function probe3() {
      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      this._probe.apply(this, [3].concat(args));
    }
  }, {
    key: '_probe',
    value: function _probe(level, name, meta) {
      if (this._shouldLog(level)) {
        this._log(level, name, meta);
      }
    }

    /**
     * Display an averaged value of the time since last probe.
     * Keyed on the first string argument.
     */

  }, {
    key: 'sample',
    value: function sample() {
      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      this._sample.apply(this, [1].concat(args));
    }
  }, {
    key: 'sample1',
    value: function sample1() {
      for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      this._sample.apply(this, [1].concat(args));
    }
  }, {
    key: 'sample2',
    value: function sample2() {
      for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }

      this._sample.apply(this, [2].concat(args));
    }
  }, {
    key: 'sample3',
    value: function sample3() {
      for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }

      this._sample.apply(this, [3].concat(args));
    }
  }, {
    key: '_sample',
    value: function _sample(level, name, meta) {
      if (this._shouldLog(level)) {
        var samples = this._sampleStore;

        var probeData = samples[name] || (samples[name] = { timeSum: 0, count: 0, averageTime: 0 });
        probeData.timeSum += (0, _env.timestamp)() - this._deltaTs;
        probeData.count += 1;
        probeData.averageTime = probeData.timeSum / probeData.count;

        this._log(level, name, _extends({}, meta, { averageTime: probeData.averageTime }));

        // Weight more heavily on later samples. Otherwise it gets almost
        // impossible to see outliers after a while.
        if (probeData.count === 10) {
          probeData.count = 5;
          probeData.timeSum /= 2;
        }
      }
    }

    /**
     * These functions will average the time between calls and log that value
     * every couple of calls, in effect showing a times per second this
     * function is called - sometimes representing a "frames per second" count.
     */

  }, {
    key: 'fps',
    value: function fps() {
      for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        args[_key9] = arguments[_key9];
      }

      this._fps.apply(this, [1].concat(args));
    }
  }, {
    key: 'fps1',
    value: function fps1() {
      for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
      }

      this._fps.apply(this, [1].concat(args));
    }
  }, {
    key: 'fps2',
    value: function fps2() {
      for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
        args[_key11] = arguments[_key11];
      }

      this._fps.apply(this, [2].concat(args));
    }
  }, {
    key: 'fps3',
    value: function fps3() {
      for (var _len12 = arguments.length, args = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
        args[_key12] = arguments[_key12];
      }

      this._fps.apply(this, [3].concat(args));
    }
  }, {
    key: '_fps',
    value: function _fps(level) {
      var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'default';

      var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var _ref$count = _ref.count;
      var count = _ref$count === undefined ? 10 : _ref$count;

      var meta = _objectWithoutProperties(_ref, ['count']);

      if (this._shouldLog(level)) {
        var fpsLog = this._fpsStore;
        var fpsData = fpsLog[name];
        if (!fpsData) {
          fpsLog[name] = { count: 1, time: (0, _env.timestamp)() };
        } else if (++fpsData.count >= count) {
          var fps = fpsData.count / ((0, _env.timestamp)() - fpsData.time);
          fpsData.count = 0;
          fpsData.time = (0, _env.timestamp)();
          this._log(level, name, _extends({}, meta, { fps: fps }));
        }
      }
    }

    /**
     * Display a measurement from an external source, such as a server,
     * inline with other local measurements in the style of Probe's output.
     */

  }, {
    key: 'externalProbe',
    value: function externalProbe() {
      for (var _len13 = arguments.length, args = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
        args[_key13] = arguments[_key13];
      }

      this._externalProbe.apply(this, [1].concat(args));
    }
  }, {
    key: 'externalProbe1',
    value: function externalProbe1() {
      for (var _len14 = arguments.length, args = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
        args[_key14] = arguments[_key14];
      }

      this._externalProbe.apply(this, [1].concat(args));
    }
  }, {
    key: 'externalProbe2',
    value: function externalProbe2() {
      for (var _len15 = arguments.length, args = Array(_len15), _key15 = 0; _key15 < _len15; _key15++) {
        args[_key15] = arguments[_key15];
      }

      this._externalProbe.apply(this, [2].concat(args));
    }
  }, {
    key: 'externalProbe3',
    value: function externalProbe3() {
      for (var _len16 = arguments.length, args = Array(_len16), _key16 = 0; _key16 < _len16; _key16++) {
        args[_key16] = arguments[_key16];
      }

      this._externalProbe.apply(this, [3].concat(args));
    }
  }, {
    key: '_externalProbe',
    value: function _externalProbe(level, name, timeStart, timeSpent, meta) {
      if (this._shouldLog(level)) {
        // External probes are expected to provide epoch timestamps
        var total = timeStart - this._startEpochTs;
        var delta = timeSpent;
        this._log(level, name, _extends({ total: total, delta: delta }, meta));
      }
    }

    /* Conditionally run a function only when probe is enabled */

  }, {
    key: 'run',
    value: function run(func, arg) {
      var _config2 = this._config;
      var isEnabled = _config2.isEnabled;
      var isRunEnabled = _config2.isRunEnabled;

      if (isEnabled && isRunEnabled) {
        func(arg);
      }
    }
  }, {
    key: 'startIiterations',
    value: function startIiterations() {
      this._iterationsTs = (0, _env.timestamp)();
    }

    /**
     * Get config from persistent store, if available
     * @return {Object} config
     */

  }, {
    key: '_getConfigFromEnvironment',
    value: function _getConfigFromEnvironment() {
      var customConfig = {};
      if (!_env.IS_NODE) {
        var serialized = _cookieCutter2.default.get(COOKIE_NAME);
        if (serialized) {
          customConfig = JSON.parse(serialized);
        }
      }
      return _extends({}, DEFAULT_CONFIG, customConfig);
    }

    /* Count iterations per second. Runs the provided function a
     * specified number of times and normalizes the result to represent
     * iterations per second.
     *
     * TODO/ib Measure one iteration and auto adjust iteration count.
     */

  }, {
    key: 'getIterationsPerSecond',
    value: function getIterationsPerSecond() {
      var iterations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10000;
      var func = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var context = arguments[2];

      if (func) {
        Probe.startIiterations();
        // Keep call overhead minimal, only use Function.call if context supplied
        if (context) {
          for (var i = 0; i < iterations; i++) {
            func.call(context);
          }
        } else {
          for (var _i = 0; _i < iterations; _i++) {
            func();
          }
        }
      }
      var elapsedMillis = (0, _env.timestamp)() - this._iterationsTs;
      var iterationsPerSecond = formatSI(iterations * 1000 / elapsedMillis);
      return iterationsPerSecond;
    }

    /*
     * Print the number of iterations per second measured using the provided
     * function
     */

  }, {
    key: 'logIterationsPerSecond',
    value: function logIterationsPerSecond(testName) {
      var iterations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10000;
      var func = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      var elapsedMs = this.getIterationsPerSecond(iterations, func, context);
      var iterationsPerSecond = formatSI(iterations * 1000 / elapsedMs);
      _env.logger.log(testName + ': ' + iterationsPerSecond + ' iterations/s');
    }

    /**
     * Show current log in a table, if supported by console
     * @param {Number} tail If supplied, show only the last n entries
     */

  }, {
    key: 'table',
    value: function table(tail) {
      if (typeof _env.logger.table === 'function') {
        var rows = tail ? this._logStore.slice(-tail) : this._logStore;
        _env.logger.table(rows);
      }
    }
  }]);

  return Probe;
}();

exports.default = Probe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcm9iZS9zcmMvcHJvYmUuanMiXSwibmFtZXMiOlsiZm9ybWF0VGltZSIsImZvcm1hdFNJIiwiZm9ybWF0IiwibXMiLCJmb3JtYXR0ZWQiLCJ0b0ZpeGVkIiwiREVGQVVMVF9DT05GSUciLCJpc0VuYWJsZWQiLCJsZXZlbCIsImlzTG9nRW5hYmxlZCIsImlzUHJpbnRFbmFibGVkIiwiaXNSdW5FbmFibGVkIiwiQ09PS0lFX05BTUUiLCJub29wIiwiVE9fRElTQUJMRSIsIlByb2JlIiwiY29uZmlnIiwiX2xvZ1N0b3JlIiwiX3NhbXBsZVN0b3JlIiwiX2Zwc1N0b3JlIiwiX3N0YXJ0U3RvcmUiLCJfc3RhcnRUcyIsIl9kZWx0YVRzIiwiX3N0YXJ0RXBvY2hUcyIsIkRhdGUiLCJub3ciLCJfaXRlcmF0aW9uc1RzIiwiX2NvbmZpZyIsImlnbm9yZUVudmlyb25tZW50IiwiX2dldENvbmZpZ0Zyb21FbnZpcm9ubWVudCIsImNvbmZpZ3VyZSIsImRpc2FibGUiLCJtZXRob2QiLCJwcm90b3R5cGUiLCJuZXdDb25maWciLCJzZXJpYWxpemVkIiwiSlNPTiIsInN0cmluZ2lmeSIsInNldCIsImtleSIsInNsaWNlIiwiQm9vbGVhbiIsInRvdGFsIiwiZGVsdGEiLCJuYW1lIiwibWV0YSIsInRpbWVzIiwiX2dldEVsYXBzZWRUaW1lIiwibG9nUm93Iiwic3RhcnQiLCJlbmQiLCJkdXJhdGlvbiIsInB1c2giLCJkZWJ1ZyIsInByb2JlTGV2ZWwiLCJhcmdzIiwiX3Byb2JlIiwiX3Nob3VsZExvZyIsIl9sb2ciLCJfc2FtcGxlIiwic2FtcGxlcyIsInByb2JlRGF0YSIsInRpbWVTdW0iLCJjb3VudCIsImF2ZXJhZ2VUaW1lIiwiX2ZwcyIsImZwc0xvZyIsImZwc0RhdGEiLCJ0aW1lIiwiZnBzIiwiX2V4dGVybmFsUHJvYmUiLCJ0aW1lU3RhcnQiLCJ0aW1lU3BlbnQiLCJmdW5jIiwiYXJnIiwiY3VzdG9tQ29uZmlnIiwiZ2V0IiwicGFyc2UiLCJpdGVyYXRpb25zIiwiY29udGV4dCIsInN0YXJ0SWl0ZXJhdGlvbnMiLCJpIiwiY2FsbCIsImVsYXBzZWRNaWxsaXMiLCJpdGVyYXRpb25zUGVyU2Vjb25kIiwidGVzdE5hbWUiLCJlbGFwc2VkTXMiLCJnZXRJdGVyYXRpb25zUGVyU2Vjb25kIiwibG9nIiwidGFpbCIsInRhYmxlIiwicm93cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O3FqQkFBQTs7O1FBUWdCQSxVLEdBQUFBLFU7O0FBUGhCOzs7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQSxJQUFNQyxXQUFXLG1CQUFHQyxNQUFILENBQVUsS0FBVixDQUFqQjs7QUFFQTtBQUNPLFNBQVNGLFVBQVQsQ0FBb0JHLEVBQXBCLEVBQXdCO0FBQzdCLE1BQUlDLGtCQUFKO0FBQ0EsTUFBSUQsS0FBSyxFQUFULEVBQWE7QUFDWEMsZ0JBQWVELEdBQUdFLE9BQUgsQ0FBVyxDQUFYLENBQWY7QUFDRCxHQUZELE1BRU8sSUFBSUYsS0FBSyxHQUFULEVBQWM7QUFDbkJDLGdCQUFlRCxHQUFHRSxPQUFILENBQVcsQ0FBWCxDQUFmO0FBQ0QsR0FGTSxNQUVBLElBQUlGLEtBQUssSUFBVCxFQUFlO0FBQ3BCQyxnQkFBZSxDQUFDRCxLQUFLLElBQU4sRUFBWUUsT0FBWixDQUFvQixDQUFwQixDQUFmO0FBQ0QsR0FGTSxNQUVBO0FBQ0xELGdCQUFlLENBQUNELEtBQUssSUFBTixFQUFZRSxPQUFaLENBQW9CLENBQXBCLENBQWY7QUFDRDtBQUNELFNBQU9ELFNBQVA7QUFDRDs7QUFFRCxJQUFNRSxpQkFBaUI7QUFDckI7QUFDQUMsYUFBVyxLQUZVO0FBR3JCO0FBQ0FDLFNBQU8sQ0FKYztBQUtyQjtBQUNBQyxnQkFBYyxJQU5PO0FBT3JCO0FBQ0FDLGtCQUFnQixJQVJLO0FBU3JCO0FBQ0FDLGdCQUFjO0FBVk8sQ0FBdkI7O0FBYUEsSUFBTUMsY0FBYyxXQUFwQjs7QUFFQSxTQUFTQyxJQUFULEdBQWdCLENBQUU7O0FBRWxCLElBQU1DLGFBQWEsQ0FDakIsUUFEaUIsRUFD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QTJCRCxtQkFBM0I7QUFDRDs7QUFFRDs7Ozs7OzswQkFJTUssSSxFQUFNO0FBQ1YsVUFBSSxPQUFPLFlBQU9DLEtBQWQsS0FBd0IsVUFBNUIsRUFBd0M7QUFDdEMsWUFBTUMsT0FBT0YsT0FBTyxLQUFLeEUsU0FBTCxDQUFldUIsS0FBZixDQUFxQixDQUFDaUQsSUFBdEIsQ0FBUCxHQUFxQyxLQUFLeEUsU0FBdkQ7QUFDQSxvQkFBT3lFLEtBQVAsQ0FBYUMsSUFBYjtBQUNEO0FBQ0Y7Ozs7OztrQkF0WWtCNUUsSyIsImZpbGUiOiJwcm9iZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbmltcG9ydCBjb29raWUgZnJvbSAnY29va2llLWN1dHRlcic7XG5pbXBvcnQge0lTX05PREUsIGxvZ2dlciwgdGltZXN0YW1wfSBmcm9tICcuL2Vudic7XG5pbXBvcnQgZDMgZnJvbSAnZDMtZm9ybWF0JztcblxuY29uc3QgZm9ybWF0U0kgPSBkMy5mb3JtYXQoJy4zcycpO1xuXG4vLyBUT0RPOiBDdXJyZW50bHkgdW51c2VkLCBrZWVwaW5nIGluIGNhc2Ugd2Ugd2FudCBpdCBsYXRlciBmb3IgbG9nIGZvcm1hdHRpbmdcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRUaW1lKG1zKSB7XG4gIGxldCBmb3JtYXR0ZWQ7XG4gIGlmIChtcyA8IDEwKSB7XG4gICAgZm9ybWF0dGVkID0gYCR7bXMudG9GaXhlZCgyKX1tc2A7XG4gIH0gZWxzZSBpZiAobXMgPCAxMDApIHtcbiAgICBmb3JtYXR0ZWQgPSBgJHttcy50b0ZpeGVkKDEpfW1zYDtcbiAgfSBlbHNlIGlmIChtcyA8IDEwMDApIHtcbiAgICBmb3JtYXR0ZWQgPSBgJHsobXMgLyAxMDAwKS50b0ZpeGVkKDMpfXNgO1xuICB9IGVsc2Uge1xuICAgIGZvcm1hdHRlZCA9IGAkeyhtcyAvIDEwMDApLnRvRml4ZWQoMil9c2A7XG4gIH1cbiAgcmV0dXJuIGZvcm1hdHRlZDtcbn1cblxuY29uc3QgREVGQVVMVF9DT05GSUcgPSB7XG4gIC8vIG9mZiBieSBkZWZhdWx0XG4gIGlzRW5hYmxlZDogZmFsc2UsXG4gIC8vIGxvZ2dpbmcgbGV2ZWxcbiAgbGV2ZWw6IDEsXG4gIC8vIFdoZXRoZXIgbG9nZ2luZyBpcyB0dXJuZWQgb25cbiAgaXNMb2dFbmFibGVkOiB0cnVlLFxuICAvLyBXaGV0aGVyIGxvZ2dpbmcgcHJpbnRzIHRvIGNvbnNvbGVcbiAgaXNQcmludEVuYWJsZWQ6IHRydWUsXG4gIC8vIFdoZXRoZXIgUHJvYmUjcnVuIGV4ZWN1dGVzIGNvZGVcbiAgaXNSdW5FbmFibGVkOiB0cnVlXG59O1xuXG5jb25zdCBDT09LSUVfTkFNRSA9ICdfX3Byb2JlX18nO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuY29uc3QgVE9fRElTQUJMRSA9IFtcbiAgJ19wcm9iZScsICdfZnBzJywgJ19leHRlcm5hbFByb2JlJywgJ19sb2cnLCAncnVuJywgJ2dldE9wdGlvbicsXG4gICdnZXRJdGVyYXRpb25zUGVyU2Vjb25kJywgJ2xvZ0l0ZXJhdGlvbnNQZXJTZWNvbmQnXG5dO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9iZSB7XG5cbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIE9wdGlvbmFsIGNvbmZpZ3VyYXRpb24gYXJnczsgc2VlICNjb25maWd1cmVcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvbmZpZyA9IHt9KSB7XG4gICAgLy8gRGF0YSBjb250YWluZXJzXG4gICAgdGhpcy5fbG9nU3RvcmUgPSBbXTtcbiAgICB0aGlzLl9zYW1wbGVTdG9yZSA9IHt9O1xuICAgIHRoaXMuX2Zwc1N0b3JlID0ge307XG4gICAgdGhpcy5fc3RhcnRTdG9yZSA9IHt9O1xuICAgIC8vIFRpbWVzdGFtcHMgLSBwZWdnZWQgdG8gYW4gYXJiaXRyYXJ5IHRpbWUgaW4gdGhlIHBhc3RcbiAgICB0aGlzLl9zdGFydFRzID0gdGltZXN0YW1wKCk7XG4gICAgdGhpcy5fZGVsdGFUcyA9IHRpbWVzdGFtcCgpO1xuICAgIC8vIE90aGVyIHN5c3RlbXMgcGFzc2luZyBpbiBlcG9jaCBpbmZvIHJlcXVpcmUgYW4gZXBvY2ggdHMgdG8gY29udmVydFxuICAgIHRoaXMuX3N0YXJ0RXBvY2hUcyA9IERhdGUubm93KCk7XG4gICAgdGhpcy5faXRlcmF0aW9uc1RzID0gbnVsbDtcbiAgICAvLyBDb25maWd1cmF0aW9uXG4gICAgdGhpcy5fY29uZmlnID0gY29uZmlnLmlnbm9yZUVudmlyb25tZW50ID9cbiAgICAgIHsuLi5ERUZBVUxUX0NPTkZJR30gOlxuICAgICAgdGhpcy5fZ2V0Q29uZmlnRnJvbUVudmlyb25tZW50KCk7XG4gICAgLy8gT3ZlcnJpZGUgd2l0aCBuZXcgY29uZmlndXJhdGlvbiwgaWYgYW55XG4gICAgdGhpcy5jb25maWd1cmUoY29uZmlnKTtcbiAgICAvLyBEaXNhYmxlIG1ldGhvZHMgaWYgbmVjZXNzYXJ5XG4gICAgaWYgKCF0aGlzLl9jb25maWcuaXNFbmFibGVkKSB7XG4gICAgICB0aGlzLmRpc2FibGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHVybiBwcm9iZSBvblxuICAgKiBAcmV0dXJuIHtQcm9iZX0gc2VsZiwgdG8gc3VwcG9ydCBjaGFpbmluZ1xuICAgKi9cbiAgZW5hYmxlKCkge1xuICAgIC8vIFN3YXAgaW4gbGl2ZSBtZXRob2RzXG4gICAgZm9yIChjb25zdCBtZXRob2Qgb2YgVE9fRElTQUJMRSkge1xuICAgICAgdGhpc1ttZXRob2RdID0gUHJvYmUucHJvdG90eXBlW21ldGhvZF07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvbmZpZ3VyZSh7aXNFbmFibGVkOiB0cnVlfSk7XG4gIH1cblxuICAvKipcbiAgICogVHVybiBwcm9iZSBvZmZcbiAgICogQHJldHVybiB7UHJvYmV9IHNlbGYsIHRvIHN1cHBvcnQgY2hhaW5pbmdcbiAgICovXG4gIGRpc2FibGUoKSB7XG4gICAgLy8gU3dhcCBpbiBub29wcyBmb3IgbGl2ZSBtZXRob2RzXG4gICAgZm9yIChjb25zdCBtZXRob2Qgb2YgVE9fRElTQUJMRSkge1xuICAgICAgdGhpc1ttZXRob2RdID0gbm9vcDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29uZmlndXJlKHtpc0VuYWJsZWQ6IGZhbHNlfSk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgZnVuY3Rpb246IFNldCBwcm9iZSBsZXZlbFxuICAgKiBAcGFyYW0ge051bWJlcn0gbGV2ZWwgTGV2ZWwgdG8gc2V0XG4gICAqIEByZXR1cm4ge1Byb2JlfSBzZWxmLCB0byBzdXBwb3J0IGNoYWluaW5nXG4gICAqL1xuICBzZXRMZXZlbChsZXZlbCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZ3VyZSh7bGV2ZWx9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmUgcHJvYmUgd2l0aCBuZXcgdmFsdWVzIChjYW4gaW5jbHVkZSBjdXN0b20ga2V5L3ZhbHVlIHBhaXJzKS5cbiAgICogQ29uZmlndXJhdGlvbiB3aWxsIGJlIHBlcnNpc3RlZCBhY3Jvc3MgYnJvd3NlciBzZXNzaW9uc1xuICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gbmFtZWQgcGFyYW1ldGVyc1xuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGNvbmZpZy5pc0VuYWJsZWQgV2hldGhlciBwcm9iZSBpcyBlbmFibGVkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBjb25maWcubGV2ZWwgTG9nZ2luZyBsZXZlbFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGNvbmZpZy5pc0xvZ0VuYWJsZWQgV2hldGhlciBsb2dnaW5nIHByaW50cyB0byBjb25zb2xlXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gY29uZmlnLmlzUnVuRW5hYmxlZCBXaGV0aGVyICNydW4gZXhlY3V0ZXMgY29kZVxuICAgKiBAcmV0dXJuIHtQcm9iZX0gc2VsZiwgdG8gc3VwcG9ydCBjaGFpbmluZ1xuICAgKi9cbiAgY29uZmlndXJlKGNvbmZpZyA9IHt9KSB7XG4gICAgY29uc3QgbmV3Q29uZmlnID0gey4uLnRoaXMuX2NvbmZpZywgLi4uY29uZmlnfTtcbiAgICB0aGlzLl9jb25maWcgPSBuZXdDb25maWc7XG4gICAgaWYgKCFJU19OT0RFKSB7XG4gICAgICBjb25zdCBzZXJpYWxpemVkID0gSlNPTi5zdHJpbmdpZnkobmV3Q29uZmlnKTtcbiAgICAgIGNvb2tpZS5zZXQoQ09PS0lFX05BTUUsIHNlcmlhbGl6ZWQpO1xuICAgIH1cbiAgICAvLyBTdXBwb3J0IGNoYWluaW5nXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc2luZ2xlIG9wdGlvbiBmcm9tIHByZXNldCBjb25maWd1cmF0aW9uLiBVc2VmdWwgd2hlbiB1c2luZyBQcm9iZSB0b1xuICAgKiBzZXQgZGV2ZWxvcGVyLW9ubHkgc3dpdGNoZXMuXG4gICAqIEBwYXJhbSAge1N0cmluZ30ga2V5IEtleSB0byBnZXQgdmFsdWUgZm9yXG4gICAqIEByZXR1cm4ge21peGVkfSAgICAgT3B0aW9uIHZhbHVlLCBvciB1bmRlZmluZWRcbiAgICovXG4gIGdldE9wdGlvbihrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnW2tleV07XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbG9nLCBhcyBhbiBhcnJheSBvZiBsb2cgcm93IG9iamVjdHNcbiAgICogQHJldHVybiB7T2JqZWN0W119IExvZ1xuICAgKi9cbiAgZ2V0TG9nKCkge1xuICAgIHJldHVybiB0aGlzLl9sb2dTdG9yZS5zbGljZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgUHJvYmUgaXMgY3VycmVudGx5IGVuYWJsZWRcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gaXNFbmFibGVkXG4gICAqL1xuICBpc0VuYWJsZWQoKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5fY29uZmlnLmlzRW5hYmxlZCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgYWxsIGludGVybmFsIHN0b3JlcywgZHJvcHBpbmcgbG9nc1xuICAgKi9cbiAgcmVzZXQoKSB7XG4gICAgLy8gRGF0YSBjb250YWluZXJzXG4gICAgdGhpcy5fbG9nU3RvcmUgPSBbXTtcbiAgICB0aGlzLl9zYW1wbGVTdG9yZSA9IHt9O1xuICAgIHRoaXMuX2Zwc1N0b3JlID0ge307XG4gICAgdGhpcy5fc3RhcnRTdG9yZSA9IHt9O1xuICAgIC8vIFRpbWVzdGFtcHNcbiAgICB0aGlzLl9zdGFydFRzID0gdGltZXN0YW1wKCk7XG4gICAgdGhpcy5fZGVsdGFUcyA9IHRpbWVzdGFtcCgpO1xuICAgIHRoaXMuX2l0ZXJhdGlvbnNUcyA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdGhlIGxvbmcgdGltZXJcbiAgICovXG4gIHJlc2V0U3RhcnQoKSB7XG4gICAgdGhpcy5fc3RhcnRUcyA9IHRoaXMuX2RlbHRhVHMgPSB0aW1lc3RhbXAoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCB0aGUgdGltZSBzaW5jZSBsYXN0IHByb2JlXG4gICAqL1xuICByZXNldERlbHRhKCkge1xuICAgIHRoaXMuX2RlbHRhVHMgPSB0aW1lc3RhbXAoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IG1pbGxpc2Vjb25kcywgd2l0aCBmcmFjdGlvbnNcbiAgICovXG4gIGdldFRvdGFsKCkge1xuICAgIHJldHVybiB0aW1lc3RhbXAoKSAtIHRoaXMuX3N0YXJ0VHM7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7TnVtYmVyfSBtaWxsaXNlY29uZHMsIHdpdGggZnJhY3Rpb25zXG4gICAqL1xuICBnZXREZWx0YSgpIHtcbiAgICByZXR1cm4gdGltZXN0YW1wKCkgLSB0aGlzLl9kZWx0YVRzO1xuICB9XG5cbiAgX2dldEVsYXBzZWRUaW1lKCkge1xuICAgIGNvbnN0IHRvdGFsID0gdGltZXN0YW1wKCkgLSB0aGlzLl9zdGFydFRzO1xuICAgIGNvbnN0IGRlbHRhID0gdGltZXN0YW1wKCkgLSB0aGlzLl9kZWx0YVRzO1xuICAgIC8vIHJlc2V0IGRlbHRhIHRpbWVyXG4gICAgdGhpcy5fZGVsdGFUcyA9IHRpbWVzdGFtcCgpO1xuICAgIHJldHVybiB7dG90YWwsIGRlbHRhfTtcbiAgfVxuXG4gIF9sb2cobGV2ZWwsIG5hbWUsIG1ldGEgPSB7fSkge1xuICAgIGNvbnN0IHRpbWVzID0gdGhpcy5fZ2V0RWxhcHNlZFRpbWUoKTtcbiAgICBjb25zdCBsb2dSb3cgPSB7bGV2ZWwsIG5hbWUsIC4uLnRpbWVzLCAuLi5tZXRhfTtcbiAgICAvLyBkdXJhdGlvbiBoYW5kbGluZ1xuICAgIGlmIChtZXRhLnN0YXJ0KSB7XG4gICAgICB0aGlzLl9zdGFydFN0b3JlW25hbWVdID0gdGltZXN0YW1wKCk7XG4gICAgfSBlbHNlIGlmIChtZXRhLmVuZCkge1xuICAgICAgLy8gSWYgc3RhcnQgaXNuJ3QgZm91bmQsIHRha2UgdGhlIGZ1bGwgZHVyYXRpb24gc2luY2UgaW5pdGlhbGl6YXRpb25cbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5fc3RhcnRTdG9yZVtuYW1lXSB8fCB0aGlzLl9zdGFydFRzO1xuICAgICAgbG9nUm93LmR1cmF0aW9uID0gdGltZXN0YW1wKCkgLSBzdGFydDtcbiAgICB9XG4gICAgdGhpcy5fbG9nU3RvcmUucHVzaChsb2dSb3cpO1xuICAgIC8vIExvZyB0byBjb25zb2xlIGlmIGVuYWJsZWRcbiAgICBpZiAodGhpcy5fY29uZmlnLmlzUHJpbnRFbmFibGVkKSB7XG4gICAgICAvLyBUT0RPOiBOaWNlciBjb25zb2xlIGxvZ2dpbmdcbiAgICAgIGxvZ2dlci5kZWJ1ZyhKU09OLnN0cmluZ2lmeShsb2dSb3cpKTtcbiAgICB9XG4gIH1cblxuICBfc2hvdWxkTG9nKHByb2JlTGV2ZWwpIHtcbiAgICBjb25zdCB7aXNFbmFibGVkLCBpc0xvZ0VuYWJsZWQsIGxldmVsfSA9IHRoaXMuX2NvbmZpZztcbiAgICByZXR1cm4gaXNFbmFibGVkICYmIGlzTG9nRW5hYmxlZCAmJiBsZXZlbCA+PSBwcm9iZUxldmVsO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXlzIGEgZG91YmxlIHRpbWluZyAoZnJvbSBcInN0YXJ0IHRpbWVcIiBhbmQgZnJvbSBsYXN0IHByb2JlKS5cbiAgICovXG4gIHByb2JlKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9wcm9iZSgxLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHByb2JlMSguLi5hcmdzKSB7XG4gICAgdGhpcy5fcHJvYmUoMSwgLi4uYXJncyk7XG4gIH1cblxuICBwcm9iZTIoLi4uYXJncykge1xuICAgIHRoaXMuX3Byb2JlKDIsIC4uLmFyZ3MpO1xuICB9XG5cbiAgcHJvYmUzKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9wcm9iZSgzLCAuLi5hcmdzKTtcbiAgfVxuXG4gIF9wcm9iZShsZXZlbCwgbmFtZSwgbWV0YSkge1xuICAgIGlmICh0aGlzLl9zaG91bGRMb2cobGV2ZWwpKSB7XG4gICAgICB0aGlzLl9sb2cobGV2ZWwsIG5hbWUsIG1ldGEpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwbGF5IGFuIGF2ZXJhZ2VkIHZhbHVlIG9mIHRoZSB0aW1lIHNpbmNlIGxhc3QgcHJvYmUuXG4gICAqIEtleWVkIG9uIHRoZSBmaXJzdCBzdHJpbmcgYXJndW1lbnQuXG4gICAqL1xuICBzYW1wbGUoLi4uYXJncykge1xuICAgIHRoaXMuX3NhbXBsZSgxLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHNhbXBsZTEoLi4uYXJncykge1xuICAgIHRoaXMuX3NhbXBsZSgxLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHNhbXBsZTIoLi4uYXJncykge1xuICAgIHRoaXMuX3NhbXBsZSgyLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHNhbXBsZTMoLi4uYXJncykge1xuICAgIHRoaXMuX3NhbXBsZSgzLCAuLi5hcmdzKTtcbiAgfVxuXG4gIF9zYW1wbGUobGV2ZWwsIG5hbWUsIG1ldGEpIHtcbiAgICBpZiAodGhpcy5fc2hvdWxkTG9nKGxldmVsKSkge1xuICAgICAgY29uc3Qgc2FtcGxlcyA9IHRoaXMuX3NhbXBsZVN0b3JlO1xuXG4gICAgICBjb25zdCBwcm9iZURhdGEgPSBzYW1wbGVzW25hbWVdIHx8IChcbiAgICAgICAgc2FtcGxlc1tuYW1lXSA9IHt0aW1lU3VtOiAwLCBjb3VudDogMCwgYXZlcmFnZVRpbWU6IDB9XG4gICAgICApO1xuICAgICAgcHJvYmVEYXRhLnRpbWVTdW0gKz0gdGltZXN0YW1wKCkgLSB0aGlzLl9kZWx0YVRzO1xuICAgICAgcHJvYmVEYXRhLmNvdW50ICs9IDE7XG4gICAgICBwcm9iZURhdGEuYXZlcmFnZVRpbWUgPSBwcm9iZURhdGEudGltZVN1bSAvIHByb2JlRGF0YS5jb3VudDtcblxuICAgICAgdGhpcy5fbG9nKGxldmVsLCBuYW1lLCB7Li4ubWV0YSwgYXZlcmFnZVRpbWU6IHByb2JlRGF0YS5hdmVyYWdlVGltZX0pO1xuXG4gICAgICAvLyBXZWlnaHQgbW9yZSBoZWF2aWx5IG9uIGxhdGVyIHNhbXBsZXMuIE90aGVyd2lzZSBpdCBnZXRzIGFsbW9zdFxuICAgICAgLy8gaW1wb3NzaWJsZSB0byBzZWUgb3V0bGllcnMgYWZ0ZXIgYSB3aGlsZS5cbiAgICAgIGlmIChwcm9iZURhdGEuY291bnQgPT09IDEwKSB7XG4gICAgICAgIHByb2JlRGF0YS5jb3VudCA9IDU7XG4gICAgICAgIHByb2JlRGF0YS50aW1lU3VtIC89IDI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZXNlIGZ1bmN0aW9ucyB3aWxsIGF2ZXJhZ2UgdGhlIHRpbWUgYmV0d2VlbiBjYWxscyBhbmQgbG9nIHRoYXQgdmFsdWVcbiAgICogZXZlcnkgY291cGxlIG9mIGNhbGxzLCBpbiBlZmZlY3Qgc2hvd2luZyBhIHRpbWVzIHBlciBzZWNvbmQgdGhpc1xuICAgKiBmdW5jdGlvbiBpcyBjYWxsZWQgLSBzb21ldGltZXMgcmVwcmVzZW50aW5nIGEgXCJmcmFtZXMgcGVyIHNlY29uZFwiIGNvdW50LlxuICAgKi9cbiAgZnBzKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9mcHMoMSwgLi4uYXJncyk7XG4gIH1cblxuICBmcHMxKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9mcHMoMSwgLi4uYXJncyk7XG4gIH1cblxuICBmcHMyKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9mcHMoMiwgLi4uYXJncyk7XG4gIH1cblxuICBmcHMzKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9mcHMoMywgLi4uYXJncyk7XG4gIH1cblxuICBfZnBzKGxldmVsLCBuYW1lID0gJ2RlZmF1bHQnLCB7Y291bnQgPSAxMCwgLi4ubWV0YX0gPSB7fSkge1xuICAgIGlmICh0aGlzLl9zaG91bGRMb2cobGV2ZWwpKSB7XG4gICAgICBjb25zdCBmcHNMb2cgPSB0aGlzLl9mcHNTdG9yZTtcbiAgICAgIGNvbnN0IGZwc0RhdGEgPSBmcHNMb2dbbmFtZV07XG4gICAgICBpZiAoIWZwc0RhdGEpIHtcbiAgICAgICAgZnBzTG9nW25hbWVdID0ge2NvdW50OiAxLCB0aW1lOiB0aW1lc3RhbXAoKX07XG4gICAgICB9IGVsc2UgaWYgKCsrZnBzRGF0YS5jb3VudCA+PSBjb3VudCkge1xuICAgICAgICBjb25zdCBmcHMgPSBmcHNEYXRhLmNvdW50IC8gKHRpbWVzdGFtcCgpIC0gZnBzRGF0YS50aW1lKTtcbiAgICAgICAgZnBzRGF0YS5jb3VudCA9IDA7XG4gICAgICAgIGZwc0RhdGEudGltZSA9IHRpbWVzdGFtcCgpO1xuICAgICAgICB0aGlzLl9sb2cobGV2ZWwsIG5hbWUsIHsuLi5tZXRhLCBmcHN9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheSBhIG1lYXN1cmVtZW50IGZyb20gYW4gZXh0ZXJuYWwgc291cmNlLCBzdWNoIGFzIGEgc2VydmVyLFxuICAgKiBpbmxpbmUgd2l0aCBvdGhlciBsb2NhbCBtZWFzdXJlbWVudHMgaW4gdGhlIHN0eWxlIG9mIFByb2JlJ3Mgb3V0cHV0LlxuICAgKi9cbiAgZXh0ZXJuYWxQcm9iZSguLi5hcmdzKSB7XG4gICAgdGhpcy5fZXh0ZXJuYWxQcm9iZSgxLCAuLi5hcmdzKTtcbiAgfVxuXG4gIGV4dGVybmFsUHJvYmUxKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9leHRlcm5hbFByb2JlKDEsIC4uLmFyZ3MpO1xuICB9XG5cbiAgZXh0ZXJuYWxQcm9iZTIoLi4uYXJncykge1xuICAgIHRoaXMuX2V4dGVybmFsUHJvYmUoMiwgLi4uYXJncyk7XG4gIH1cblxuICBleHRlcm5hbFByb2JlMyguLi5hcmdzKSB7XG4gICAgdGhpcy5fZXh0ZXJuYWxQcm9iZSgzLCAuLi5hcmdzKTtcbiAgfVxuXG4gIF9leHRlcm5hbFByb2JlKGxldmVsLCBuYW1lLCB0aW1lU3RhcnQsIHRpbWVTcGVudCwgbWV0YSkge1xuICAgIGlmICh0aGlzLl9zaG91bGRMb2cobGV2ZWwpKSB7XG4gICAgICAvLyBFeHRlcm5hbCBwcm9iZXMgYXJlIGV4cGVjdGVkIHRvIHByb3ZpZGUgZXBvY2ggdGltZXN0YW1wc1xuICAgICAgY29uc3QgdG90YWwgPSB0aW1lU3RhcnQgLSB0aGlzLl9zdGFydEVwb2NoVHM7XG4gICAgICBjb25zdCBkZWx0YSA9IHRpbWVTcGVudDtcbiAgICAgIHRoaXMuX2xvZyhsZXZlbCwgbmFtZSwge3RvdGFsLCBkZWx0YSwgLi4ubWV0YX0pO1xuICAgIH1cbiAgfVxuXG4gIC8qIENvbmRpdGlvbmFsbHkgcnVuIGEgZnVuY3Rpb24gb25seSB3aGVuIHByb2JlIGlzIGVuYWJsZWQgKi9cbiAgcnVuKGZ1bmMsIGFyZykge1xuICAgIGNvbnN0IHtpc0VuYWJsZWQsIGlzUnVuRW5hYmxlZH0gPSB0aGlzLl9jb25maWc7XG4gICAgaWYgKGlzRW5hYmxlZCAmJiBpc1J1bkVuYWJsZWQpIHtcbiAgICAgIGZ1bmMoYXJnKTtcbiAgICB9XG4gIH1cblxuICBzdGFydElpdGVyYXRpb25zKCkge1xuICAgIHRoaXMuX2l0ZXJhdGlvbnNUcyA9IHRpbWVzdGFtcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjb25maWcgZnJvbSBwZXJzaXN0ZW50IHN0b3JlLCBpZiBhdmFpbGFibGVcbiAgICogQHJldHVybiB7T2JqZWN0fSBjb25maWdcbiAgICovXG4gIF9nZXRDb25maWdGcm9tRW52aXJvbm1lbnQoKSB7XG4gICAgbGV0IGN1c3RvbUNvbmZpZyA9IHt9O1xuICAgIGlmICghSVNfTk9ERSkge1xuICAgICAgY29uc3Qgc2VyaWFsaXplZCA9IGNvb2tpZS5nZXQoQ09PS0lFX05BTUUpO1xuICAgICAgaWYgKHNlcmlhbGl6ZWQpIHtcbiAgICAgICAgY3VzdG9tQ29uZmlnID0gSlNPTi5wYXJzZShzZXJpYWxpemVkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsuLi5ERUZBVUxUX0NPTkZJRywgLi4uY3VzdG9tQ29uZmlnfTtcbiAgfVxuXG4gIC8qIENvdW50IGl0ZXJhdGlvbnMgcGVyIHNlY29uZC4gUnVucyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gYVxuICAgKiBzcGVjaWZpZWQgbnVtYmVyIG9mIHRpbWVzIGFuZCBub3JtYWxpemVzIHRoZSByZXN1bHQgdG8gcmVwcmVzZW50XG4gICAqIGl0ZXJhdGlvbnMgcGVyIHNlY29uZC5cbiAgICpcbiAgICogVE9ETy9pYiBNZWFzdXJlIG9uZSBpdGVyYXRpb24gYW5kIGF1dG8gYWRqdXN0IGl0ZXJhdGlvbiBjb3VudC5cbiAgICovXG4gIGdldEl0ZXJhdGlvbnNQZXJTZWNvbmQoaXRlcmF0aW9ucyA9IDEwMDAwLCBmdW5jID0gbnVsbCwgY29udGV4dCkge1xuICAgIGlmIChmdW5jKSB7XG4gICAgICBQcm9iZS5zdGFydElpdGVyYXRpb25zKCk7XG4gICAgICAvLyBLZWVwIGNhbGwgb3ZlcmhlYWQgbWluaW1hbCwgb25seSB1c2UgRnVuY3Rpb24uY2FsbCBpZiBjb250ZXh0IHN1cHBsaWVkXG4gICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZXJhdGlvbnM7IGkrKykge1xuICAgICAgICAgIGZ1bmMuY2FsbChjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYXRpb25zOyBpKyspIHtcbiAgICAgICAgICBmdW5jKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZWxhcHNlZE1pbGxpcyA9IHRpbWVzdGFtcCgpIC0gdGhpcy5faXRlcmF0aW9uc1RzO1xuICAgIGNvbnN0IGl0ZXJhdGlvbnNQZXJTZWNvbmQgPSBmb3JtYXRTSShpdGVyYXRpb25zICogMTAwMCAvIGVsYXBzZWRNaWxsaXMpO1xuICAgIHJldHVybiBpdGVyYXRpb25zUGVyU2Vjb25kO1xuICB9XG5cbiAgLypcbiAgICogUHJpbnQgdGhlIG51bWJlciBvZiBpdGVyYXRpb25zIHBlciBzZWNvbmQgbWVhc3VyZWQgdXNpbmcgdGhlIHByb3ZpZGVkXG4gICAqIGZ1bmN0aW9uXG4gICAqL1xuICBsb2dJdGVyYXRpb25zUGVyU2Vjb25kKFxuICAgIHRlc3ROYW1lLCBpdGVyYXRpb25zID0gMTAwMDAsIGZ1bmMgPSBudWxsLCBjb250ZXh0ID0gbnVsbFxuICApIHtcbiAgICBjb25zdCBlbGFwc2VkTXMgPSB0aGlzLmdldEl0ZXJhdGlvbnNQZXJTZWNvbmQoaXRlcmF0aW9ucywgZnVuYywgY29udGV4dCk7XG4gICAgY29uc3QgaXRlcmF0aW9uc1BlclNlY29uZCA9IGZvcm1hdFNJKGl0ZXJhdGlvbnMgKiAxMDAwIC8gZWxhcHNlZE1zKTtcbiAgICBsb2dnZXIubG9nKGAke3Rlc3ROYW1lfTogJHtpdGVyYXRpb25zUGVyU2Vjb25kfSBpdGVyYXRpb25zL3NgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG93IGN1cnJlbnQgbG9nIGluIGEgdGFibGUsIGlmIHN1cHBvcnRlZCBieSBjb25zb2xlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0YWlsIElmIHN1cHBsaWVkLCBzaG93IG9ubHkgdGhlIGxhc3QgbiBlbnRyaWVzXG4gICAqL1xuICB0YWJsZSh0YWlsKSB7XG4gICAgaWYgKHR5cGVvZiBsb2dnZXIudGFibGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IHJvd3MgPSB0YWlsID8gdGhpcy5fbG9nU3RvcmUuc2xpY2UoLXRhaWwpIDogdGhpcy5fbG9nU3RvcmU7XG4gICAgICBsb2dnZXIudGFibGUocm93cyk7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==