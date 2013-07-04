var Sphere = {};

Sphere.util = {
	"parseLE":function(d){var r=0,i=-1;while(++i<d.length)r+=(d.charCodeAt(i)<<i);return r;}
};

Sphere.color = function(r,g,b,a) {
	return {
		"red":r,
		"green":g,
		"blue":b,
		"alpha":a,
		"toString":function(){return "rgba("+r+","+g+","+b+","+a+")";}
	};
};
