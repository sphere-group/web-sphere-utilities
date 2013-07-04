/****
RPG Window Style Format
Chad Austin et al.
7.16.03


---- 64 byte header ----

byte signature[4];     // must be ".rws"
word version;          // must be 1 or 2
byte edge_width;       // only valid if version == 1
byte background_mode;  // 0 = tiled, 1 = stretched, 2 = gradient (uses corner_colors), 3 = tiled with gradient, 4 = stretched with gradient
RGBA corner_colors[4]; // upper left, upper right, lower left, lower right
byte edge_offsets[4]; // left, top, right, bottom
byte reserved[36];
****/
/****
---- Version 1 ----

The rest of the file contains nine bitmaps.  Each bitmap is edge_width * edge_width
pixels.  The order of the bitmaps are as follows:

upper-left
top
upper-right
right
lower-right
bottom
lower-left
left
background
****/
/****
---- Version 2 ----

The rest of the file contains nine bitmaps.  The first and second words are the width
and height, respectively.  The rest of the bitmap is width*height RGBA pixels.

The bitmaps are in the same order as version 1.

---- Version 2.1 ----

The new edge_offsets array allows the user to specify an amount (in pixels) by which to
expand the background section of a window style. This way you can have the background
displayed under the edge bitmaps, for better looking windowstyles.

Also, two new background modes are supported: TILED_GRADIENT (tiled background with
gradient on top), and STRETCHED_GRADIENT (stretched background with gradient on top).
****/
Sphere.WindowStyle = function(d) {
	var _ret = null;
	var _hdr = {
		"signature":".rws",
		"version":0,
		"edgeWidth":0,
		"backgroundMode":-1,
		"cornerColors":[],
		"edgeOffsets":[-1,-1,-1,-1],
		"reserved":[]
	};
	if (d.substr(0,4)===".rws") {
		_hdr.version = Sphere.util.parseLE(d.substr(4,2));
		_hdr.edgeWidth = d.charCodeAt(6);
		_hdr.backgroundMode = d.charCodeAt(7);
		var p = 8;
		var i = 0; while (i<4) {
			_hdr.cornerColors[i] = Sphere.color(d.charCodeAt(p++),d.charCodeAt(p++),d.charCodeAt(p++),d.charCodeAt(p++));
			++i;
		}
		if (p!=24) console.log("POST CORNERCOLORS NOT 24");
		var i = 0; while(i<4) {
			_hdr.edgeOffsets[i] = d.charCodeAt(p++);
			++i;
		}
		if (p!=28) console.log("POST EDGEOFFSETS NOT 28");
		p += 36;
		if (p!=64) console.log("POST HEADER NOT 64");
		var _bmp = [];
		var w, h, q, z;
		if (_hdr.version>1) {
			i = 9; q = -1; while (--i>-1) {
				w = Sphere.util.parseLE(d.substr(p,2));
				h = Sphere.util.parseLE(d.substr(p+2,2));
				p += 4;
				_bmp[++q] = {
					"width":w,
					"height":h,
					"data":[],
					"blit":function(c){
						var w = this.width, h = this.height;
						var i = 0, _h = 0; if (c) while (i<this.data.length) {
							if (i>1&&(i%w)===0) ++_h;
							c.plot(i%w, _h, this.data[i].toString());
							//console.log(i%w,_h,this.data[i].toString());
							++i;
						}
						else console.log("Sphere::WindowStyle.blitSection - Couldn't blit "+w+"*"+h+" canvas");
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
			"blit":function(c,x,y,w,h){
				console.log("Sphere::WindowStyle.blit - not yet implemented");
			}
		};
	}
	else console.log("Couldn't create windowstyle from data");
	return _ret;
};
