function ncanvas(id) {
	var c = document.getElementById(id);
	if (!c) {
		//console.log("couldn't find id "+id);
		return null;
	}
	if (c&&c.getContext) {
		function _plot(q){return function(px,py,col){q.fillStyle=col;q.fillRect(px,py,1,1);};}
		function _get(q){return function(pw,ph){return q.createImageData(pw,ph);};}
		function _put(q){return function(da,px,py){q.putImageData(da,px,py);};}
		function _clear(q){return function(){q.clearRect();};}
		function _fill(q){return function(px,py,pw,ph,col){q.fillStyle=col;q.fillRect(px,py,pw,ph);};}
		function _blit(q){return function(src,px,py){q.drawImage(src,px,py);};}
		var _c = c.getContext('2d');
		var ret = {
			get id(){return id;},
			"clear":_clear(_c),
			"fillRect":_fill(_c),
			"plot":_plot(_c),
			"blitImage":_blit(_c),
			"createImageData":_get(_c),
			"putImageData":_put(_c),
			get context(){return _c;},	// raw context
			get width(){return c.width;},
			set width(v){c.width = v;}
		};
		return ret;
	}
	else {
		console.log("couldn't get context");
		return null;
	}
}


