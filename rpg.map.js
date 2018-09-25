/****
RPG Map File Format
Chad Austin
10.3.1999


---- 256 byte header ----

byte signature[4];          // Must be ".rmp"
word version;               // Must be 1
byte type;                  // obsolete
byte num_layers;
byte reserved;
word num_entities;
word startx;                // In pixel coordinates, not tile
word starty;
byte startlayer;
byte startdirection;        // 0 = north, 1 = northeast, 2 = east, etc. (clockwise)
word num_strings;           // 9
word num_zones;
byte reserved[235];



---- String data ----

There are num_strings strings in the map file:
word string_length;
byte characters[string_length];

Defined strings:
  0 - tileset file (obsolete)
  1 - music file
  2 - script file (obsolete)
  3 - entry script
  4 - exit script
  5 - north script
  6 - east script
  7 - south script
  8 - west script


If the tileset file string has no length, the tileset is stored appended to the
map file.  See rts.txt for a description of the tileset format.


---- Layer data ----

Each layer has its own 30-byte header that goes like this:
word    width;
word    height;
word    flags;            // visible = ~flags & 1, has_parallax = flags & 2
float32 parallax_x;
float32 parallax_y;
float32 scrolling_x;
float32 scrolling_y;
dword   num_segments;
byte    reflective;       // 0 = false, 1 = true
byte    reserved[3];

string name;  // past the layer header is the string, if it exists

Each layer is sequential in the map file.  Each layer is (width * height * 2)
bytes because the actual tile number is a word.  If the high bit of the
scrolling values is set, the number is negative.

After the layer, a set of obstruction line segments is stored.  Each segment
consists of four dwords.

dword x1;
dword y1;
dword x2;
dword y2;



---- Entity header ----

Each entity has a 16-byte information block:
word mapx;         // x-coordinate of entity (pixel coordinates)
word mapy;         // y-coordinate of entity (pixel coordinates)
word layer;        // z-coordinate of entity (layer)
word type;         // 1 = Person, 2 = Trigger
byte reserved[8];



---- Entity data ----

  -- Person (1) --
  string name;            // unique name of person entity
  string spriteset;       // spriteset filename
  
  // scripts
  word num_scripts;  // should be five

  // stores <num_scripts> scripts
  // string 0 = on create
  // string 1 = on destroy
  // string 2 = on activate (touch)
  // string 3 = on activate (talk)
  // string 4 = generate commands

  byte reserved[16];


  -- Trigger (2) --
  string function;        // script to be executed when trigger is activated



---- Zone header ----

Each zone has a 16 byte information header
word x1;			// starting x-coordinate of entity (pixel coordinates)
word y1;			// starting y-coordinate of entity (pixel coordinates)
word x2;			// ending x-coordinate of entity (pixel coordinates)
word y2;			// ending y-coordinate of entity (pixel coordinates)
word layer;			// z-coordinate of entity (layer)
word reactivate_in_num_steps; 	// number of steps required to reactivate
byte reserved[4];

---- Zone data ----

string function;		// script to be executed when the zone is activated



---- Appendix ----

strings are not zero-terminated and defined in the following format:
word length;
byte characters[length];

To convert from tile coordinates to pixel coordinates, multiply them by the
tile dimensions.
****/

Sphere.Map = function(d) {
	var _ret = null;
	var _hdr = {
		"signature":".rmp",
		"version":0,
		"type":0,
		"numLayers":0,
		"numEntities":0,
		"start":{
			"x":0,
			"y":0,
			"z":-1,
			"direction":-1
		},
		"numStrings":0,	// should be set to 9,
		"numZones":0,
		"reserved":[]
	};
	var _str = [];
	var _lay = [];
	var _ent = [];
	var _zones = [];
	var _ts = null;
	function _processLayers() {}
	function _processEntities() {}
	function _processZones() {}
	if (d.substr(0,4)===".rmp") {
		var _n = 0;
		_hdr.version = Sphere.util.parseLE(d.substr(4,2));
		if (_hdr.version>0) {
			//// HEADER
			_hdr.type = d.charCodeAt(6);
			_hdr.numLayers = d.charCodeAt(7);
			_hdr.numEntities = Sphere.util.parseLE(d.substr(9,2));
			_hdr.start = {
				"x":Sphere.util.parseLE(d.substr(11,2)),
				"y":Sphere.util.parseLE(d.substr(13,2)),
				"z":d.charCodeAt(15),
				"direction":d.charCodeAt(16)
			};
			_hdr.numStrings = Sphere.util.parseLE(d.substr(17,2));	// should be 9
			_hdr.numZones = Sphere.util.parseLE(d.substr(19,2));
			_hdr.reserved = d.substr(21,235);
			//// STRINGS
			_n = 256;
			for (var i=0, l=_hdr.numStrings; i<l; ++i) {
				//var _len = Sphere.util.parseLE(d.substr(_n,2));
				//_n += 2;
				var tmp = Sphere.util.parseString(d.substr(_n));
				//var _s = d.substr(_n,_len);
				//_n += _len;
				_str.push(tmp);
				_n += 2+tmp.length;
				/*_str.push({
					"length":_n,
					"data":_s||""
				});*/
			}
			//// LAYERS
			for (var i=0, l=_hdr.numLayers; i<l; ++i) {
				var _l = {
					"width":Sphere.util.parseLE(d.substr(_n,2)),
					"height":Sphere.util.parseLE(d.substr(_n+2,2)),
					"flags":Sphere.util.parseLE(d.substr(_n+4,2)),
					"parallax":{
						"x":Sphere.util.parseFloat32LE(d.substr(_n+6,4)),
						"y":Sphere.util.parseFloat32LE(d.substr(_n+10,4))
					},
					"scroll":{
						"x":Sphere.util.parseFloat32LE(d.substr(_n+14,4)),
						"y":Sphere.util.parseFloat32LE(d.substr(_n+18,4))
					},
					"numSegments":Sphere.util.parseLE(d.substr(_n+22,4)),
					"reflective":d.charCodeAt(_n+26),
					"reserved":Sphere.util.parseLE(d.substr(_n+27,3)),
					"name":""
				};
				_n += 30;
				_l["name"] = Sphere.util.parseString(d.substr(_n));
				_n += 2+_l["name"].length;
				_l["tiles"] = [];
				var _z = (_l["width"]*_l["height"])<<1;
				for (var j=0; j<_z; j+=2) {
					_l["tiles"].push(Sphere.util.parseLE(d.substr(_n,2)));
					_n += 2;
				}
				//_n += _z;
				_l["obstructions"] = [];
				for (var j=0, n=_l.numSegments; j<n; ++j) {
					_l["obstructions"].push({
						"p1":{
							"x":Sphere.util.parseLE(d.substr(_n,4)),
							"y":Sphere.util.parseLE(d.substr(_n+4,4))
						},
						"p2":{
							"x":Sphere.util.parseLE(d.substr(_n+8,4)),
							"y":Sphere.util.parseLE(d.substr(_n+12,4))
						}
					});
					_n += 16;
				}
				_lay.push(_l);
			}
			//// ENTITIES
			for (var i=0, l=_hdr.numEntities; i<l; ++i) {
				var _e = {
					"map":{
						"x":Sphere.util.parseLE(d.substr(_n,2)),
						"y":Sphere.util.parseLE(d.substr(_n+2,2)),
						"z":Sphere.util.parseLE(d.substr(_n+4,2))
					},
					"type":Sphere.util.parseLE(d.substr(_n+6,2)),
					"reserved":d.substr(_n+8,8),
					"data":null
				};
				_n += 16;
				switch (_e.type) {
					case 1:	// person
						var _len, _name;
						_e.data = {
							"name":"",
							"spriteset":"",
							"scripts":[],
							"reserved":[]
						};
						_e.data["name"] = Sphere.util.parseString(d.substr(_n));
						_n += 2+_e.data["name"].length;
						_e.data["spriteset"] = Sphere.util.parseString(d.substr(_n));
						_n += 2+_e.data["spriteset"].length;
						var _num_scr = Sphere.util.parseLE(d.substr(_n,2));	// should be 5
						_n += 2;
						_e.data["numScripts"] = _num_scr;
						for (var j=0; j<_num_scr; ++j) {
							var _tmp = Sphere.util.parseString(d.substr(_n));
							_e.data["scripts"].push(_tmp);
							_n += 2+_tmp.length;
						}
						_e.data["reserved"] = d.substr(_n,16);
						_n += 16;
						break;
					case 2:	// trigger
						var _len, _name;
						_e.data = {
							"func":null
						};
						_e.data["func"] = Sphere.util.parseString(d.substr(_n));
						_n += 2+_e.data["func"].length;
						break;
					default:
						break;
				}
				_ent.push(_e);
			}
			//// ZONES
			for (var i=0, l=_hdr.numZones; i<l; ++i) {
				var _z = {
					"p1":{
						"x":Sphere.util.parseLE(d.substr(_n,2)),
						"y":Sphere.util.parseLE(d.substr(_n+2,2))
					},
					"p2":{
						"x":Sphere.util.parseLE(d.substr(_n+4,2)),
						"y":Sphere.util.parseLE(d.substr(_n+6,2))
					},
					"layer":Sphere.util.parseLE(d.substr(_n+8,2)),
					"steps":Sphere.util.parseLE(d.substr(_n+10,2)),
					"reserved":d.substr(_n+12,4)
				};
				_n += 16;
				_z["func"] = Sphere.util.parseString(d.substr(_n));
				_n += 2+_z["func"].length;
				_zones.push(_z);
/****
---- Zone header ----

Each zone has a 16 byte information header
word x1;			// starting x-coordinate of entity (pixel coordinates)
word y1;			// starting y-coordinate of entity (pixel coordinates)
word x2;			// ending x-coordinate of entity (pixel coordinates)
word y2;			// ending y-coordinate of entity (pixel coordinates)
word layer;			// z-coordinate of entity (layer)
word reactivate_in_num_steps; 	// number of steps required to reactivate
byte reserved[4];

---- Zone data ----

string function;		// script to be executed when the zone is activated

****/
			}
			if (!_ts&&""==_str[0]) {
				if (Sphere.Tileset) {
					_ts = Sphere.Tileset(d.substr(_n));
				}
			}
		}
		else {
		}
		_ret = {
			"header":_hdr,
			"strings":_str,
			"layers":_lay,
			"entities":_ent,
			"zones":_zones,
			"tileset":_ts
		};
	}
	else console.log("Couldn't create map from data");
	return _ret;
};