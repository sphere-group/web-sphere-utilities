/****
RPG Spriteset File Format
Chad Austin
12.25.1999


---- 128 byte header ----

byte signature[4];   // Must be ".rss"
word version;        // Must be 1 or 2 or 3
word num_images;     // only valid if version = 1 or version = 3
word frame_width;    //
word frame_height;   //
word num_directions; // only valid if version = 2 or version = 3
word base_x1;
word base_y1;
word base_x2;
word base_y2;
byte reserved[106];


== VERSION 1 ==

---- Start spriteset data ----
The spriteset is just a series of RGBA frames, each of which is frame_width *
frame_height * 4 bytes long.

Eight directions of eight frames each:
north
northeast
east
southeast
south
southwest
west
northwest


== VERSION 2 ==

There are num_direction directions stored in the file.  A direction is just a row of sprites.
The first eight directions actually represent directions that the character can walk, in
the following order:

north
northeast
east
southeast
south
southwest
west
northwest

The rest of the directions can represent anything, including emotions or special movement such
as jumping or running.

---- direction header (64 bytes) ----
word num_frames;
byte reserved[62];

---- frame header (32 bytes) ----
word width;  // obsolete
word height; // obsolete
word delay;
byte reserved[26];


== VERSION 3 ==

There are num_images images stored.  Each image is 4 * frame_width * frame_height bytes.
Simple RGBA arrays, folks.  :)

After the frames, num_directions 'directions' are stored.  Each direction is organized as
follows:

word num_frames;
byte reserved[6];

string name;  // see rmp.txt for description of strings

After each direction, num_frames 'frames' are stored.  Each frame is organized as follows:

word frame_index;  // index into frame array
word delay;        // delay value (in map engine frames)
byte reserved[4];
****/

Sphere.Spriteset = function(d) {
	var _ret = null;
	var _hdr = {
		"signature":".rss",
		"version":0,
		"numImages":0,
		"frame":{
			"width":0,
			"height":0
		},
		"numDirections":0,
		"base":[
			{"x":-1,"y":-1},
			{"x":-1,"y":-1}
		],
		"reserved":[]
	};
	var _bmp = [], _dir = [], _fr = [];
	function _processImages(o) {
		var i, q, w = _hdr.frame.width, h =_hdr.frame.height;
		var p = o.offset, z = (w*h)<<2;
		if (o.version>2) {
			_bmp = [];
			i = _hdr.numImages; q = -1; while (--i>-1) {
				_bmp[++q] = {
					"width":w,
					"height":h,
					"data":[],
					"blit":Sphere.util.blitRGBA
				};
				_bmp[q].data = Sphere.util.parseBitmap(o.data.substr(p,z));
				p += z;
			}
		}
		else if (o.version>1) {
		}
		else {
			/*i = 64; q = -1; while (--i>-1) {
				w = Sphere.util.parseLE(o.data.substr(p,2));
				h = Sphere.util.parseLE(o.data.substr(p+2,2));
				r = o.data.substr(p+4,28);
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
			}*/
		}
		return p;
	}
	function _processDirections(o) {
		var i, q, f, n, fi, fd, fr;
		var p = o.offset;
		if (o.version>2) {
			_dir = [];
			i = _hdr.numDirections; q = -1; while (--i>-1) {
				f = Sphere.util.parseLE(o.data.substr(p,2));
				p += 8;
				_dir[++q] = {
					"name":Sphere.util.parseString(o.data.substr(p)),
					"count":f,
					"frames":[]
				};
				p += _dir[q].name.length+2;
				while (--f>-1) {
					fi = Sphere.util.parseLE(o.data.substr(p,2));
					fd = Sphere.util.parseLE(o.data.substr(p+2,2));
					fr = o.data.substr(p+4,4);
					_dir[q].frames.push({
						"index":fi,
						"delay":fd,
						"reserved":fr
					});
					p += 8;
				}
			}
		}
		else if (o.version>1) {
			_dir = [];
			//var _dn = Sphere.Enum.Directions;
			var w, h;
			i = _hdr.numDirections; q= -1; y = -1; while (--i>-1) {
				f = Sphere.util.parseLE(o.data.substr(p,2));
				fr = o.data.substr(p+2,62);
				p += 64;
				_dir[++q] = {
					"name":q<8?Sphere.Enum.Directions[q]:"extra "+q,
					"count":f,
					"frames":[],
					"reserved":fr
				};
				while (--f>-1) {
					w = Sphere.util.parseLE(o.data.substr(p,2))||_hdr.frame.width;
					h = Sphere.util.parseLE(o.data.substr(p+2,2))||_hdr.frame.height;
					z = (w*h)<<2;
					fd = Sphere.util.parseLE(o.data.substr(p+4,2));
					fr = o.data.substr(p+6,26);
					fi = Sphere.util.parseBitmap(o.data.substr(p+32,z));
					_dir[q].frames.push({
						"delay":fd,
						"index":++y,
						"width":w,
						"height":h,
						"blit":Sphere.util.blitRGBA,
						"data":fi
					});
					p += 32+z;
				}
			}
		}
		return p;
	}
	function _processFrames(o) {}
	if (d.substr(0,4)===".rss") {
		_hdr.version = Sphere.util.parseLE(d.substr(4,2));
		_hdr.numImages = Sphere.util.parseLE(d.substr(6,2));
		_hdr.frame.width = Sphere.util.parseLE(d.substr(8,2));
		_hdr.frame.height = Sphere.util.parseLE(d.substr(10,2));
		_hdr.numDirections = Sphere.util.parseLE(d.substr(12,2));
		_hdr.base[0].x = Sphere.util.parseLE(d.substr(14,2));
		_hdr.base[0].y = Sphere.util.parseLE(d.substr(16,2));
		_hdr.base[1].x = Sphere.util.parseLE(d.substr(18,2));
		_hdr.base[1].y = Sphere.util.parseLE(d.substr(20,2));
		_hdr.reserved = d.substr(22,106);
		var p = 128, i;
		var w, h, q, z, r;
		if (_hdr.version>2) {
			p = _processImages({
				"version":_hdr.version,
				"data":d,
				"offset":p
			});
			p = _processDirections({
				"version":_hdr.version,
				"data":d,
				"offset":p
			});
		}
		else if (_hdr.version>1) {
			p = _processDirections({
				"version":_hdr.version,
				"data":d,
				"offset":p
			});
		}
		/*else {
			_processDirections(d,_hdr.version);
		}*/
		_ret = {
			"header":_hdr,
			"bitmaps":_bmp,
			"directions":_dir,
			"blit":function(c,x,y){
				console.log("Sphere::Spriteset.blit - not yet implemented");
			}
		};
		//console.log("==Sphere::Spriteset==");
	}
	else console.log("Couldn't create spriteset from data");
	return _ret;
};