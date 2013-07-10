/****
RPG Font Format
Chad Austin
2000.06.23


--- 256 byte header ----

byte signature[4];   // Must be ".rfn"
word version;        // Must be 1 or 2
word num_chars;
byte reserved[248];


---- Start character data ----

Each character has its own 32-byte header that goes like this:

word width;
word height;
byte reserved[28];

If version is 1, character data is a series (width * height) of bytes representing an
8-bit greyscale image.  Color 255 is opaque, color 0 is transparent.  Version 1 doesn't
inherently have a color associated with it, but it should default to white.  If version
is 2, character data is a series of RGBA pixels.
****/

Sphere.Font = function(d) {
	var _ret = null;
	var _hdr = {
		"signature":".rfn",
		"version":0,
		"numChars":0,
		"reserved":[]
	};
	if (d.substr(0,4)===".rfn") {
		_hdr.version = Sphere.util.parseLE(d.substr(4,2));
		_hdr.numChars = Sphere.util.parseLE(d.substr(6,2));
		var p = 256, i;
		var _bmp = [];
		var w, h, q, z, r, _height = 0;
		//console.log("Sphere::Font","version",_hdr.version,"#ch",_hdr.numChars);
		if (_hdr.version>1) {
			i = _hdr.numChars; q = -1; while (--i>-1) {
				w = Sphere.util.parseLE(d.substr(p,2));
				h = Sphere.util.parseLE(d.substr(p+2,2));
				if (h>_height) _height = h;
				r = d.substr(p+4,28);
				p += 32;
				_bmp[++q] = {
					"width":w,
					"height":h,
					"data":[],
					"reserved":r,
					"blit":Sphere.util.blitRGBA,
				};
				_bmp[q].data = Sphere.util.parseBitmap(d.substr(p,(w*h)<<2));
				p += (w*h)<<2;
				/*z = w*h; while(--z>-1) {
					_bmp[q].data.push(Sphere.color(d.charCodeAt(p++),d.charCodeAt(p++),d.charCodeAt(p++),d.charCodeAt(p++)));
				}*/
			}
		}
		else {
		}
		_ret = {
			"header":_hdr,
			"bitmaps":_bmp,
			"getHeight":function(){return _height;},
			"getStringWidth":function(msg){
				var w = 0, i = msg.length;
				while (--i>-1) w += _bmp[msg.charCodeAt(i)].width;
				return w;
			},
			"drawText":function(c,x,y,msg){
				//console.log("Sphere::Font.drawText - not yet implemented");
				var _x = x, _y = y;
				var i, ch; for (i=0; i<msg.length; ++i) {
					ch = msg.charCodeAt(i);
					_bmp[ch].blit(c,_x,_y);
					_x += _bmp[ch].width;
				}
			}
		};
	}
	return _ret;
};