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
		var w, h, q, z, r;
		console.log("Sphere::Font","version",_hdr.version,"#ch",_hdr.numChars);
		if (_hdr.version>1) {
			i = _hdr.numChars; q = -1; while (--i>-1) {
				w = Sphere.util.parseLE(d.substr(p,2));
				h = Sphere.util.parseLE(d.substr(p+2,2));
				r = d.substr(p+4,28);
				p += 32;
				_bmp[++q] = {
					"width":w,
					"height":h,
					"data":[],
					"reserved":r,
					"blit":function(c){
						var w = this.width, h = this.height;
						var i = 0, _h = 0; if (c) while (i<this.data.length) {
							if (i>1&&(i%w)===0) ++_h;
							c.plot(i%w, _h, this.data[i].toString());
							//console.log(i%w,_h,this.data[i].toString());
							++i;
						}
						else console.log("Sphere::Font.blitCharacter - Couldn't blit "+w+"*"+h+" canvas");
					}
				};
				z = w*h; while(--z>-1) {
					_bmp[q].data.push(Sphere.color(d.charCodeAt(p++),d.charCodeAt(p++),d.charCodeAt(p++),d.charCodeAt(p++)));
				}
			}
		}
		else {
		}
		_ret = {
			"header":_hdr,
			"bitmaps":_bmp,
			"drawText":function(c,x,y){
				console.log("Sphere::Font.drawText - not yet implemented");
			}
		};
	}
	return _ret;
};