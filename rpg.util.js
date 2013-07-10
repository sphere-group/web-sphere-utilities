var Sphere = {};

Sphere.color = function(r,g,b) {
	var a = arguments.length>3?arguments[3]:255;
	return {
		"red":r,
		"green":g,
		"blue":b,
		"alpha":a,
		"toString":function(){
			//if (a>=255) return "rgb("+r+","+g+","+b+")";
			//else
			return "rgba("+r+","+g+","+b+","+a+")";
		}
	};
};

Sphere.util = {
	"parseLE":function(d){var r=0,i=-1;while(++i<d.length)r+=(d.charCodeAt(i)<<(8*i));return r;},
	"parseBitmap":function(d){
		var _ret = [], q = -1, i = -1; while (i<d.length) {
			_ret[++q] = Sphere.color(d.charCodeAt(++i),d.charCodeAt(++i),d.charCodeAt(++i),d.charCodeAt(++i));
		};
		return _ret;
	},
	"parseString":function(d){var l=this.parseLE(d.substr(0,2));return d.substr(2,l);},
	"blitRGBA":function(c){	// blit RGBA pixel with optional rect clipping
		var w = this.width, h = this.height;
		var y = arguments.length>2?arguments[2]:0,
			x = arguments.length>1?arguments[1]:0;
		var _z = arguments.length>4?y+arguments[4]:y+h,
			_q = arguments.length>3?x+arguments[3]:x+w;
		var i = 0, _h = 0; if (c) while (i<this.data.length) {
			if (i>1&&(i%w)===0) ++_h;
			if ((x+i%w)<_q&&(y+_h)<_z) {
				c.plot(x+i%w, y+_h, this.data[i].toString());
				//console.log(x+i%w, y+_h, this.data[i].toString());
			}
			++i;
		}
		else console.log("Sphere::util.blitRGBA - Couldn't blit "+w+"*"+h+" canvas");
	}
};
