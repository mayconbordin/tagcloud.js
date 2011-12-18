var Util = {
	mergeObj: function(a, b) {
		for (var attrname in b)
			a[attrname] = b[attrname];
		return a;
	},
	setStyles: function(el, styles) {
		for (var style in styles)
			el.style[style] = styles[style];
	},
	getPosition: function(el) {
		var x, y = 0;

		x = el.offsetLeft;
		y = el.offsetTop;
		el = el.offsetParent;
		
		while(el != null) {
			x = parseInt(x) + parseInt(el.offsetLeft);
			y = parseInt(y) + parseInt(el.offsetTop);
			el = el.offsetParent;
		}

		return {top: y, left: x};
	},
	
	/* yahoo event bundled */
	/* Copyright (c) 2006, Yahoo! Inc. All rights reserved.
	   Code licensed under the BSD License: http://developer.yahoo.net/yui/license.txt
	   version: 0.10.0
	*/
	getPageX: function(ev) {
		var x = ev.pageX;
		
		if (!x&&0!==x) {
			x=ev.clientX || 0;
		
			if (this.isIE) {
				x += this._getScrollLeft();
			}
		}
		return x;
	},
	getPageY: function(ev, isIE) {
		var y = ev.pageY;
		
		if(!y && 0 !== y) {
			y = ev.clientY || 0;
			
			if (isIE)
				y += this._getScrollTop();
		}
		return y;
	},
	_getScrollLeft: function() {
		return this._getScroll()[1];
	},
	_getScrollTop: function() {
		return this._getScroll()[0];
	},
	_getScroll: function() {
		var dd = document.documentElement;
		db = document.body;
		
		if (dd&&dd.scrollTop)
			return [dd.scrollTop, dd.scrollLeft];
		else
			return (db) ? [db.scrollTop, db.scrollLeft] : [0,0]
	},
	
	randomMember: function(arr) {
		var arrl = arr.length;
		if (arrl == 1)
			return arr[0];
			
		var idx = Math.round((Math.random() * arrl) - 0.5);
		if (idx >= arrl)
			idx = arrl - 1;
		return arr[idx];
	},
	
	randomIndex: function(arr) {
		var arrl = arr.length;
		if(arrl == 1)
			return 0;
			
		var idx = Math.round((Math.random() * arrl) - 0.5);
		if(idx >= arrl)
			idx = arrl - 1;
			
		return idx;
	}
};
