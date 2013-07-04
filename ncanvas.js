function ncanvas(id) {
	var c = document.getElementById(id);
	if (c.getContext) {
		function _plot(q){return function(px,py,col){q.fillStyle=col;q.fillRect(px,py,1,1);};}
		function _clear(){c.width = c.width;}
		function _fill(q){return function(px,py,pw,ph,col){q.fillStyle=col;q.fillRect(px,py,pw,ph);}}
		var _c = c.getContext('2d');
		var ret = {
			"clear":_clear,
			"fillRect":_fill(_c),
			"plot":_plot(_c)
		};
		return ret;
	}
	else {
		console.log("couldn't get context");
		return null;
	}
}


