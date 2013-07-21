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
	function _processLayers() {}
	function _processEntities() {}
	function _processZones() {}
	if (d.substr(0,4)===".rmp") {
		_hdr.version = Sphere.util.parseLE(d.substr(4,2));
		if (_hdr.version>0) {
			_hdr.type = d.charCodeAt(6);
			_hdr.numLayers = d.charCodeAt(7);
			_hdr.numEntities = Sphere.util.parseLE(d.substr(9,2));
			_hdr.start = {
				"x":Sphere.util.parseLE(d.substr(11,2)),
				"y":Sphere.util.parseLE(d.substr(13,2)),
				"z":d.charCodeAt(15),
				"direction":d.charCodeAt(16)
			};
			_hdr.numStrings = Sphere.util.parseLE(d.substr(17,2));
			_hdr.numZones = Sphere.util.parseLE(d.substr(19,2));
			_hdr.reserved = d.substr(21,235);
		}
		else {
		}
		_ret = {
			"header":_hdr
		};
	}
	else console.log("Couldn't create map from data");
	return _ret;
};