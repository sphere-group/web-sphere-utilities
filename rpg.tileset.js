/****
RPG Tileset File Format
Chad Austin
1.14.99


---- 256 byte header ----

byte signature[4];     // Must be ".rts"
word version;          // Must be 1
word num_tiles;
word tile_width;
word tile_height;
word tile_bpp;         // Must be 32
byte compression;      // 0 (compression not supported)
byte has_obstructions; //
byte reserved[240];


---- Tileset data ----

Each tile is (tile_width * tile_height * (tile_bpp / 8)) bytes.  You read each
like a normal top-down bitmap.


---- Tile information block ----

Every tile has a corresponding 32-byte information block:

struct TILE_INFORMATION_BLOCK
  byte obsolete1_;
  byte animated;
  word nexttile;      // For animated tiles
  word delay;         // number of frames to wait until next tile switch
  byte obsolete2_;
  byte blocked;       // 0 = no obstruction data, 1 = old obstruction data, 2 = new obstruction data
  word num_segments;
  byte reserved[22];
end struct


---- Obstruction data (OBSOLETE) ----

If blocked == 1, then...

There are tile_width * tile_height bytes in the obstruction data area.  Each pixel in the tile
can currently be either blocked (1) or not blocked (0).  Values 2 through 255 are reserved for
future use.

If blocked == 2, then...

There are num_segments obstruction segments within this tile.  Each is defined as such:

word x1;
word y1;
word x2;
word y2;
****/

Sphere.Tileset = function(d) {
	var _ret = null;
	var _hdr = {
		"signature":".rts",
		"version":0,
		"numTiles":0,
		"tile":{
			"width":0,
			"height":0,
			"bpp":0
		},
		"compression":0,
		"hasObstructions":0,
		"reserved":0
	};
	var _bmp = [];
	if (d.substr(0,4)===".rts") {
		_hdr.version = Sphere.util.parseLE(d.substr(4,2));
		_hdr.numTiles = Sphere.util.parseLE(d.substr(6,2));
		_hdr.tile = {
			"width":Sphere.util.parseLE(d.substr(8,2)),
			"height":Sphere.util.parseLE(d.substr(10,2)),
			"bpp":Sphere.util.parseLE(d.substr(12,2))
		};
		_hdr.compression = d.charCodeAt(14)&0xff;
		_hdr.hasObstructions = d.charCodeAt(15)&0xff;
		_hdr.reserved = d.substr(16,240);
		var p = 256, i;
		if (_hdr.version>0) {
			var w = _hdr.tile.width, h = _hdr.tile.height, q, z = (w*h)<<2, r, s;
			i = _hdr.numTiles; q = -1; while (--i>-1) {
				_bmp[++q] = {
					"width":w,
					"height":h,
					"data":[],
					"info":{},
					"blit":Sphere.util.blitRGBA,
				};
				_bmp[q].data = Sphere.util.parseBitmap(d.substr(p,z));
				p += z;
				/*z = w*h; while(--z>-1) {
					_bmp[q].data.push(Sphere.color(d.charCodeAt(p++),d.charCodeAt(p++),d.charCodeAt(p++),d.charCodeAt(p++)));
				}*/
			}
			i = _hdr.numTiles; q = -1; while (--i>-1) {
				r = {
					"obsolete1":d.charCodeAt(p)&0xff,
					"isAnimated":d.charCodeAt(p+1)&0xff,
					"nextTile":Sphere.util.parseLE(d.substr(p+2,2)),
					"delay":Sphere.util.parseLE(d.substr(p+4,2)),
					"obsolete2":d.charCodeAt(p+6)&0xff,
					"blockType":d.charCodeAt(p+7)&0xff,
					"numSegments":Sphere.util.parseLE(d.substr(p+8,2)),
					"nameLength":Sphere.util.parseLE(d.substr(p+10,2)),
					"isTerraformed":d.charCodeAt(p+12)&0xff,
					"reserved":d.substr(p+13,19),
					"obstructions":[]
				};
				r["name"] = d.substr(p+32,r.nameLength);
				p += 32+r.nameLength;
				if (_hdr.hasObstructions) {
					if (r.blockType>1) {
						s = r.numSegments; while (--s>-1) {
							// TODO: add segment to r.obstructions
							r.obstructions.push([
								{
									"x":Sphere.util.parseLE(d.substr(p,2)),
									"y":Sphere.util.parseLE(d.substr(p+2,2))
								},
								{
									"x":Sphere.util.parseLE(d.substr(p+4,2)),
									"y":Sphere.util.parseLE(d.substr(p+6,2))
								}
							]);
							p += 8;
						}
					}
					else {
						// TODO: add blocked data to r.obstructions
						p += z>>2;
					}
				}
				_bmp[++q].info = r;
			}
		}
		else {
		}
		_ret = {
			"header":_hdr,
			"bitmaps":_bmp
		};
	}
	else console.log("Couldn't create tileset from data");
	return _ret;
};