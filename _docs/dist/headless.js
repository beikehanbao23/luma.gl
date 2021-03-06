'use strict';

var _isBrowser = require('./utils/is-browser');

var _isBrowser2 = _interopRequireDefault(_isBrowser);

var _globals = require('./globals');

var _globals2 = _interopRequireDefault(_globals);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!_isBrowser2.default) {
  _globals2.default.globals.headlessGL = require('gl');
  _globals2.default.globals.headlessTypes = require('gl/wrap');
  if (!_globals2.default.globals.headlessTypes.WebGLRenderingContext) {
    throw new Error('Could not access headless WebGL type definitions');
  }
}

// Make sure luma.gl initializes with valid types
require('./webgl/webgl-types');

// Now import standard luma.gl package
module.exports = require('./index');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9oZWFkbGVzcy5qcyJdLCJuYW1lcyI6WyJnbG9iYWxzIiwiaGVhZGxlc3NHTCIsInJlcXVpcmUiLCJoZWFkbGVzc1R5cGVzIiwiV2ViR0xSZW5kZXJpbmdDb250ZXh0IiwiRXJyb3IiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQUksb0JBQUosRUFBZ0I7QUFDZCxvQkFBS0EsT0FBTCxDQUFhQyxVQUFiLEdBQTBCQyxRQUFRLElBQVIsQ0FBMUI7QUFDQSxvQkFBS0YsT0FBTCxDQUFhRyxhQUFiLEdBQTZCRCxRQUFRLFNBQVIsQ0FBN0I7QUFDQSxNQUFJLENBQUMsa0JBQUtGLE9BQUwsQ0FBYUcsYUFBYixDQUEyQkMscUJBQWhDLEVBQXVEO0FBQ3JELFVBQU0sSUFBSUMsS0FBSixDQUFVLGtEQUFWLENBQU47QUFDRDtBQUNGOztBQUVEO0FBQ0FILFFBQVEscUJBQVI7O0FBRUE7QUFDQUksT0FBT0MsT0FBUCxHQUFpQkwsUUFBUSxTQUFSLENBQWpCIiwiZmlsZSI6ImhlYWRsZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGlzQnJvd3NlciBmcm9tICcuL3V0aWxzL2lzLWJyb3dzZXInO1xuaW1wb3J0IGx1bWEgZnJvbSAnLi9nbG9iYWxzJztcblxuaWYgKCFpc0Jyb3dzZXIpIHtcbiAgbHVtYS5nbG9iYWxzLmhlYWRsZXNzR0wgPSByZXF1aXJlKCdnbCcpO1xuICBsdW1hLmdsb2JhbHMuaGVhZGxlc3NUeXBlcyA9IHJlcXVpcmUoJ2dsL3dyYXAnKTtcbiAgaWYgKCFsdW1hLmdsb2JhbHMuaGVhZGxlc3NUeXBlcy5XZWJHTFJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBhY2Nlc3MgaGVhZGxlc3MgV2ViR0wgdHlwZSBkZWZpbml0aW9ucycpO1xuICB9XG59XG5cbi8vIE1ha2Ugc3VyZSBsdW1hLmdsIGluaXRpYWxpemVzIHdpdGggdmFsaWQgdHlwZXNcbnJlcXVpcmUoJy4vd2ViZ2wvd2ViZ2wtdHlwZXMnKTtcblxuLy8gTm93IGltcG9ydCBzdGFuZGFyZCBsdW1hLmdsIHBhY2thZ2Vcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9pbmRleCcpO1xuIl19