/**
 * tagcloud.js
 * Modified by: Maycon Bordin <mayconbordin@gmail.com>
 * Project url: https://github.com/mayconbordin/tagcloud.js
 * =============================================================================
 *
 *	 __                                  ___                         __     
 *	/\ \__                              /\_ \                       /\ \    
 *	\ \ ,_\     __        __       ___  \//\ \      ___    __  __   \_\ \   
 *	 \ \ \/   /'__`\    /'_ `\    /'___\  \ \ \    / __`\ /\ \/\ \  /'_` \  
 *	  \ \ \_ /\ \L\.\_ /\ \L\ \  /\ \__/   \_\ \_ /\ \L\ \\ \ \_\ \/\ \L\ \ 
 *	   \ \__\\ \__/.\_\\ \____ \ \ \____\  /\____\\ \____/ \ \____/\ \___,_\
 *	    \/__/ \/__/\/_/ \/___L\ \ \/____/  \/____/ \/___/   \/___/  \/__,_ /
 *	                      /\____/                                            
 *	                      \_/__/    
 *	                      
 *	tagcloud.js v1.0 written by Anson Parker (http://phasetwo.org/)
 *	This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 2.5 License
 *	Visit http://creativecommons.org/licenses/by-nc-sa/2.5/
 *	See http://phasetwo.org/post/a-better-tag-cloud.html for usage
 *	      
 *
 * =============================================================================
 *
 * @param container: This is the container element the tag cloud will be drawn into. As in the example above, pass a reference to the element itself, and not just the id.
 *
 * @param sortstyle: There are 4 sorting options: "random", "ascending", descending" and "". This determines the order the tags will be drawn in. For example, "ascending" will cause the smallest tags to be drawn first resulting in the larger tags being furtherest from the center of the cloud. Sending through a blank string will render the tags in the order they were added.
 *
 * @param colors: This is a single colour object, or an array of colours. If you pass an array, the each tags colour will be randomly selected from that array. A colour should be passed through as {r:0,g:0,b:0}. The number can be between 0 and 255. The previous example would result in black circles. For red circles you would send {r:255,g:0,b:0} or for a mix of blue and yellow circles, pass through the array [{r:255,g:255,b:0},{r:0,g:0,b:255}].
 *
 * @param highlightcolors: Again, a single colour object, or an array of colours. This is the color or colors the circles will turn when you hover over them with the mouse.
 *
 * @param url: The base url clicking on a tag will link to. The name of the tag will be appended to this stub. So to link to a Technorati tag page you would pass through "http://technorati.com/tag/"
 *
 */
var TagCloud = function(container, options) {
	this.initialize(container, options);
};

TagCloud.prototype = {
	options: {
		sortstyle: "",
		colors: [
			{r:255,g:197,b:145},
			{r:255,g:213,b:122},
			{r:243,g:133,b:99},
			{r:251,g:158,b:126},
			{r:254,g:173,b:120}
		],
		highlightcolors: [{r:172,g:207,b:175}],
		url: 'http://phasetwo.org/pennypacker/tag/',
		width: 600,
		height: 400,
		duration: 20,
		scale: 100
	},
	
	initialize: function(container, options) {
		this.options = Util.mergeObj(this.options, options);

		/* sortstyle can be: 'random','descending' or 'ascending'. Otherwise not sorted. */
		this.sortstyle = this.options.sortstyle;
		this.sortstyle = this.sortstyle.toLowerCase();
		
		this.colors = this.options.colors;
		if (!this.colors.length)
			this.colors = [this.colors];
		
		this.highlights = this.options.highlightcolors;
		if (!this.highlights.length)
			this.highlights = [this.highlights];
		
		this.url = this.options.url;
		this.dom = (typeof container === "string") ? document.getElementById(container) : container;
			
		this.nodes 			= new Array(0);
		this.drawQueue 		= new Array(0);
		this.scale 			= 0;
		this.boundingradius = 0;
		this.drawn 			= new Array(0);
		this.cx 			= this.dom.clientWidth/2;
		this.cy 			= this.dom.clientHeight/2;
		this.gridsize 		= 0;
		this.gpos 			= {};
		this.timeout 		= null;
	
		this.canvas 		= document.createElement('canvas');
		this.canvas.width 	= this.options.width;
		this.canvas.height 	= this.options.height;
		this.dom.appendChild(this.canvas);
	
		if (!this.canvas.getContext) return false;
	
		this.ctx 			= this.canvas.getContext('2d');
	},
	
	addNode: function(name, size) {
		this.nodes.push(new TagCloud.Node(name, size));
	},
	getNode: function(idx) {
		return this.nodes[idx];
	},

	redraw: function() {
		if (this.drawQueue.length && this.timeout) {
			clearTimeout(this.timeout);
			this.drawQueue = new Array(0);
		}
		
		this.boundingradius = 0;
		this.drawn = new Array(0);
		this.gpos = {};
			
		while(this.dom.firstChild.nextSibling)
			this.dom.removeChild(dom.firstChild.nextSibling);
	
		if (this.sortstyle == 'random') {
			var nodepool = this.nodes.slice();
			
			while(nodepool.length)
				this.drawQueue.push( nodepool.splice(Util.randomIndex(nodepool) , 1)[0] );
		} else {
			this.drawQueue = this.nodes.slice();
		}
		
		this._itDraw();
	},
	
	clear: function() {
		if (this.drawQueue.length && this.timeout) {
			clearTimeout(this.timeout);
			this.drawQueue = new Array(0);
		}
		
		this.boundingradius = 0;
		this.drawn = new Array(0);
		this.gpos = {};
		this.nodes = new Array(0);

		while (this.dom.hasChildNodes())
    		this.dom.removeChild(this.dom.lastChild);
	},
	
	draw: function() {
		var thisObj = this;
		document.onmousemove = function(e) {
			thisObj._mpos(e);
		};
		
		var maxsize   = this._findMaxSize();
		this.scale 	  = this.options.scale / (Math.sqrt(maxsize / Math.PI) * 2);
		this.gridsize = Math.sqrt(maxsize / Math.PI) * 2 * this.scale;
	
		if (this.sortstyle.indexOf('asc') == 0) {
			this.nodes.sort(this._sizeSorter);
			this.nodes.reverse();
			this.drawQueue = this.nodes.slice();
		}
		
		if (this.sortstyle.indexOf('desc') == 0) {
			this.nodes.sort(this._sizeSorter);
			this.drawQueue = this.nodes.slice();
		}
		
		if (this.sortstyle == 'random') {
			this.nodes.sort(this._sizeSorter);
			var nodepool = this.nodes.slice();
			
			while(nodepool.length)
				this.drawQueue.push( nodepool.splice(Util.randomIndex(nodepool), 1)[0] );
		}
		
		if (this.drawQueue.length == 0)
			this.drawQueue = this.nodes.slice();

		this._itDraw();
	},
	
	_getGridPos: function(x, y) {
		var gp = this.gpos['' + x + '_' + y];
		return gp || new Array(0);
	},
	
	_addToGridPos: function(x, y, c) {
		var gpos 	 = this.gpos,
			gridsize = this.gridsize;
			
		var gp = gpos[''+Math.floor(x/gridsize)+'_'+Math.floor(y/gridsize)];
		
		if (!gp) {
			gpos[''+Math.floor(x/gridsize)+'_'+Math.floor(y/gridsize)] = new Array(1);
			gpos[''+Math.floor(x/gridsize)+'_'+Math.floor(y/gridsize)][0] = c;
		} else {
			gpos[''+Math.floor(x/gridsize)+'_'+Math.floor(y/gridsize)].push(c);
		}
	},
	
	_findMaxSize: function() {
		var max = 0;
		
		for (var i = 0, j = this.nodes.length; i < j; i++)
			max = (this.nodes[i].size > max) ? this.nodes[i].size : max;
			
		return max;
	},
	
	_itDraw: function() {
		var nd = this.drawQueue.shift();
		
		if (nd) {
			var thisObj = this;
			this._drawCircle(nd);
			this.timeout = setTimeout(function() {
				thisObj._itDraw();
			}, this.options.duration);
		}
		
	},
	
	_drawCircle: function(nd) {
		var d = Math.sqrt(nd.size / Math.PI) * 2 * this.scale;
		var r = Math.round(d/2);
	
		if (this.drawn.length == 0) {
			var cvs = document.createElement('canvas');
			var x = this.cx;
			var y = this.cy;
			this.boundingradius = r;
		} else {
			var rndang   = Math.round(Math.random()*360);
			var sinangle = Math.sin(rndang * Math.PI/180);
			var cosangle = Math.cos(rndang * Math.PI/180);
			var x = this.cx + sinangle * (this.boundingradius + r);
			var y = this.cy + cosangle * (this.boundingradius + r);
			
			var collision = false;
			var checkradius = this.boundingradius + r;
			
			var goodx = x;
			var goody = y;
			
			while (!collision) {
				checkradius -= 4;
				var newx = this.cx + sinangle * checkradius;
				var newy = this.cy + cosangle * checkradius;

				var gx = Math.floor(newx/this.gridsize);
				var gy = Math.floor(newy/this.gridsize);
				
				for (var xp = -1; xp <= 1; xp++) {
					for (var yp = -1; yp <= 1; yp++) {
						var ngp = this._getGridPos(gx+xp, gy+yp);
						
						if (ngp) {
							for (var i = 0; i < ngp.length; i++) {
								var c = ngp[i];
								var dist = Math.pow(newx - c.x, 2) + Math.pow(newy - c.y, 2);
								
								if (dist < Math.pow((r + c.r), 2)) {
									collision = true;
									break;
								}
							}
							if(collision) break;
						}
						if(collision) break;
					}
				}
				
				if(collision == false) {
					goodx = newx;
					goody = newy;
				}
			}
			
			x = goodx;
			y = goody;

			var distfromcenter = Math.sqrt(Math.pow(x - this.cx, 2) + Math.pow(y - this.cy, 2)) + r;
			if(distfromcenter > this.boundingradius) {
				this.boundingradius = distfromcenter;
			}
		}

		var c = new TagCloud.Circle(x, y, r, Util.randomMember(this.colors));
		this._addToGridPos(x, y, c);
		this.drawn.push(c);
		this._renderCircle(c, nd.name);
	},
	
	_overlapping: function(c1, c2) {
		var c1left 	= c1.x-c1.r;
		var c1right = c1.x+c1.r;
		var c1top 	= c1.y-c1.r;
		var c1bot 	= c1.y+c1.r;
		
		var c2left 	= c2.x-c2.r;
		var c2right = c2.x+c2.r;
		var c2top 	= c2.y-c2.r;
		var c2bot 	= c2.y+c2.r;
		
		if ( ((c1left < c2left && c1right > c2left) || (c1left > c2left && c1left < c2right)) 
			&& ((c1top < c2top && c1bot > c2top) || (c1top > c2top && c1top < c2bot)) )
			return true;
			
		return false;
	 },
	 
	 _renderCircle: function(c, name) {
		var cvs = null;
		var thisObj = this;
		
		cvs = document.createElement('canvas');
		cvs.onmouseover = function(e) {
			var evt = e || window.event;
			var ctx = cvs.getContext("2d");
			ctx.clearRect(0, 0, c.r*2, c.r*2);
			var hcolor = Util.randomMember(thisObj.highlights);
			ctx.fillStyle = 'rgb('+hcolor.r+','+hcolor.g+','+hcolor.b+')';
			ctx.arc(c.r,c.r,c.r,0,Math.PI*2,true);
			ctx.fill();
			thisObj._showAbout(name, evt);
		}
		
		cvs.onmouseout = function(e) {
			var ctx = cvs.getContext("2d");
			ctx.clearRect(0, 0, c.r*2, c.r*2);
			ctx.fillStyle = 'rgb('+c.c.r+','+c.c.g+','+c.c.b+')';
			ctx.arc(c.r,c.r,c.r,0,Math.PI*2,true);
			ctx.fill();
			thisObj._hideAbout();
		}
		
		cvs.onclick = function(e) {
			document.location = thisObj.url + name;
		}
		
		cvs.style.cursor = 'pointer';
		cvs.style.left = c.x - c.r + 'px';
		cvs.style.top = c.y - c.r + 'px';
		cvs.style.position='absolute';
		cvs.setAttribute("width",c.r*2+1);
		cvs.setAttribute("height",c.r*2+1);
		this.dom.appendChild(cvs);
		
		var ctx = cvs.getContext("2d");
		ctx.fillOpacity=0.5;
		ctx.fillStyle = 'rgb('+c.c.r+','+c.c.g+','+c.c.b+')';
		ctx.beginPath();
		ctx.arc(c.r,c.r,c.r,0,Math.PI*2,true);
		ctx.fill();
	},
	
	_mpos: function(e) {
		var x = Util.getPageX(e, this.isIE);
		var y = Util.getPageY(e, this.isIE);
	
		var tl = document.getElementById('tagcloud_label');
		if (tl) {
			tl.style.left = x + 5 + 'px';
			tl.style.top  = y + 5 + 'px';
		}
	},
	
	_showAbout: function(name, evt) {
		var tl = document.getElementById('tagcloud_label');
		if (!tl) {
			var tl = document.createElement('div');
			tl.id = 'tagcloud_label';
			tl.style.position = 'absolute';
			tl.style.zIndex = '65535';
			tl.style.display = 'none';
			tl.style.color= '#000';
			tl.style.fontSize='24px';
			tl.style.fontFamily='arial,helvetica,sans-serif';
			document.body.appendChild(tl);
			this._mpos(evt);
		}
		tl.innerHTML = name;
		tl.style.display = 'block';
	},
	
	_hideAbout: function() {
		var tl = document.getElementById('tagcloud_label');
		if (tl) {
			tl.style.display='none';
		}
	},

	_sizeSorter: function(a, b) {
		if (a.size > b.size)
			return -1;
			
		return 1;
	}
};

TagCloud.Circle = function(x, y, r, c) {
	this.x = x;
	this.y = y;
	this.r = r;
	this.c = c;
};

TagCloud.Node = function(name, size) {
	this.size  = size;
	this.name  = name;
};
