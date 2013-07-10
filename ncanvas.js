function ncanvas(id) {
	var c = document.getElementById(id);
	if (c.getContext) {
		function _plot(q){return function(px,py,col){q.fillStyle=col;q.fillRect(px,py,1,1);};}
		function _clear(){c.width = c.width;}
		function _fill(q){return function(px,py,pw,ph,col){q.fillStyle=col;q.fillRect(px,py,pw,ph);};}
		function _blit(q){return function(src,px,py){q.drawImage(src,px,py);};}
		var _c = c.getContext('2d');
		var ret = {
			get id(){return id;},
			"clear":_clear,
			"fillRect":_fill(_c),
			"plot":_plot(_c),
			"blitImage":_blit(_c),
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


