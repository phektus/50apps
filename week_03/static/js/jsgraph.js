/*
Copyright (c) 2010 Daniel 'Haribo' Evans

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
*/

var jsgraph_graphs = new Array();
var jsgraph_heightSpacing = 10;

var jsgraph_bottomSpace = 13;
var jsgraph_leftSpace = 30;
var jsgraph_rightSpace = 6;
var jsgraph_textcol = "rgb(0,0,0)";
var jsgraph_linecol = "rgb(240,240,240)";
var jsgraph_keyposition = "right";
var jsgraph_barwidth = 1;
var jsgraph_showtime = 1000;

// Shallow merge functon
function jsg_shallow_merge( a, b ) { var c = {}; for( x in a ) { c[x] = a[x] } for( x in b ) { c[x] = b[x] } return c; }

function Point(x, y, colour, label)
{
	this.x = x;
	this.y = y;
	this.colour = colour;
	this.label = label;
}

function Series(name, colour)
{
	this.name = name;
	this.colour = colour;
	this.points = new Array();
}

function Graph(title,canvasN,type)
{
	this.defaultOptions = {
		"type": "bar",
		"barOverlap": false,
		"barWidth": 1,
		"vstep": "auto",
		"vstart": "auto",
		"vfinish": "auto",
		"hstart": "auto",
		"hfinish": "auto",
		"data": null,
		"title": "",
		"xlabel": "",
		"fillColor": "",
		"canvasName": null
	}

	if( typeof( title ) == 'object' && title != null ) {
		this.options = jsg_shallow_merge( this.defaultOptions, title );

	}
	else
	{
		this.options = this.defaultOptions;
		this.options.title = title;
		this.options.canvasName = canvasN;
		this.options.type = type;
	}

	this.series = new Array();
	this.lastSeries = new Series('', 'red');
	this.series[this.series.length] = this.lastSeries;
	this.keypos = jsgraph_keyposition;

	this.start_time = new Date().getTime();

	this.addSeries = function(name, colour)
	{
		this.series[this.series.length] = new Series(name, colour);
		this.lastSeries = this.series[this.series.length-1];
	}

	this.addPoint = function(x, y, label)
	{
		this.lastSeries.points[this.lastSeries.points.length] = new Point(x, y, this.lastSeries.colour, label);
	}

	this.vmin = function()
	{
		if(this.options.vstart != "auto" && !isNaN(this.options.vstart) ) {
			return this.options.vstart;
		}
		var min = 1000000;
		for(q = 0; q < this.series.length; q++)
		{
			var ser = this.series[q];
			for(m = 0; m < ser.points.length; m++)
			{
				if(ser.points[m].y < min)
					min = ser.points[m].y;
			}
		}
		if( this.options.type == "bar" && min > 0) {
			// Hack for bar charts, this could be handled much better.
			min = 0;
		}
		return min;
	}

	this.vmax = function()
	{
		if(this.options.vfinish != "auto" && !isNaN(this.options.vfinish) ) {
			return this.options.vfinish;
		}
		var max = -1000000;
		for(q = 0; q < this.series.length; q++)
		{
			var ser = this.series[q];
			for(m = 0; m < ser.points.length; m++)
			{
				if(ser.points[m].y > max)
					max = ser.points[m].y;
			}
		}
		return max;
	}

	this.min = function()
	{
		if(this.options.hstart != "auto" && !isNaN(this.options.hstart) ) {
			return this.options.hstart;
		}
		var min = 1000000;
		for(q = 0; q < this.series.length; q++)
		{
			var sers = this.series[q];
			for(m = 0; m < sers.points.length; m++)
			{
				if(sers.points[m].x < min)
					min = sers.points[m].x;
			}
		}
		return min;
	}

	this.max = function()
	{
		if(this.options.hfinish != "auto" && !isNaN(this.options.hfinish) ) {
			return this.options.hfinish;
		}
		var max = -1000000;
		for(q = 0; q < this.series.length; q++)
		{
			var ser = this.series[q];
			for(m = 0; m < ser.points.length; m++)
			{
				if(ser.points[m].x > max)
					max = ser.points[m].x;
			}
		}
		return max;
	}

	this.range = function()
	{
		var min = this.min();
		var max = this.max();
		if(max-min == 0)
			return 1;
		return max-min;
	}

	this.vrange = function()
	{
		var min = this.vmin();
		var max = this.vmax();
		if(max-min == 0)
			return 1;
		return max-min;
	}

	this.draw = function()
	{
		var canvas = document.getElementById(this.options.canvasName);
		var cont;
		if(canvas.getContext)
		{
			cont = canvas.getContext('2d');
			//Draw the border of the graph
		}
		else {
			var errorElem = document.createElement("span");
			errorElem.setAttribute("jsgraph-error");
			errorElem.innerHTML = "Your Browser Doesn't support the &lt;canvas&gt; element, You should upgrade your web browser";
			canvas.parentNode.appendChild( errorElem );
		}

		// Clear the canvas
		if( this.options.fillColor != "" ) {
			var origFil = cont.fillStyle;
			cont.fillStyle = this.options.fillColor;
			cont.fillRect(0,0,canvas.width,canvas.height);
			cont.fillStyle = origFil;
		}
		else {
			canvas.width = canvas.width;	
		}

		cont.font = "11px sans-serif";
		cont.textBaseline = "top";


		var vRange = this.vrange();
		var bottomSpace = jsgraph_bottomSpace;

		if(this.options.xlabel != "")
		{
			bottomSpace += 13;
		}

		var vScale = (canvas.height-18-bottomSpace)/this.vrange();
		//var pScale = vScale * Math.min((new Date().getTime()-this.start_time)/1000,1);

		var vMin = this.vmin();
		var leftSpace = jsgraph_leftSpace;
		var rightSpace = jsgraph_rightSpace;

		if(this.keypos != '' && this.lastSeries.name != '')
		{
			cont.textBaseline = "top";
			//Find the widest series name
			var widest = 1;
			for(k = 0; k < this.series.length; k++)
			{
				if(cont.measureText(this.series[k].name).width > widest)
					widest = cont.measureText(this.series[k].name).width;
			}
			if(this.keypos == 'right')
			{
				rightSpace += widest + 22;
				cont.strokeRect(canvas.width-rightSpace + 4,18,widest + 20,((this.series.length+1)*12)+4);
				cont.fillText("Key", canvas.width-rightSpace + 6, 20);
				for(k = 0; k < this.series.length; k++)
				{
					cont.fillText(this.series[k].name, canvas.width-rightSpace + 18, 20 + (12*(k+1)));
					cont.save();
					cont.fillStyle = this.series[k].colour;
					cont.fillRect(canvas.width-rightSpace + 8, 21 + (12*(k+1)), 8,8);
					cont.restore();
				}
			}
		}

		if(leftSpace < cont.measureText(vMin+vRange).width)
			leftSpace = cont.measureText(vMin+vRange).width+2;

		if(this.options.type == "bar")
			var hScale = (canvas.width-leftSpace-rightSpace)/(this.range()+1);
		else
			var hScale = (canvas.width-leftSpace-rightSpace)/(this.range());

		var hMin = this.min();
		var spacing = jsgraph_heightSpacing;

		//Draw title & Labels
		cont.textAlign = "center";
		cont.fillStyle = jsgraph_textcol;
		cont.fillText(this.options.title, (canvas.width-rightSpace-leftSpace)/2,1);

		cont.textBaseline = "bottom";
		cont.fillText(this.options.xlabel,(canvas.width-rightSpace-leftSpace)/2,canvas.height-2);

		cont.textAlign = "left";

		if( this.options.vstep != "auto" && !isNaN( this.options.vstep ) ) {
			spacing = this.options.vstep;
		}
		else {
			while(vRange/spacing >= 10)
			{
				spacing *= 10;
			}
			while(vRange/spacing <= 2)
			{
				if( spacing > 1 )
					spacing *= 0.1;
				else
					spacing *= 0.5;
			}
		}

		for(i = vMin; i <= vMin+vRange; i+= spacing)
		{
			var y = (canvas.height-bottomSpace) - (i)*vScale + (vMin*vScale);
			cont.textBaseline = "middle";
			cont.textAlign = "right";
			cont.fillStyle = jsgraph_textcol;
			cont.fillText(i+'', leftSpace-2, y);
			cont.fillStyle = jsgraph_linecol;
			if(i != vMin && i != vMin + vRange)
			{
				cont.strokeStyle = "rgb(220,220,220)";
				cont.beginPath();
				cont.moveTo(leftSpace, y);
				cont.lineTo(canvas.width-rightSpace, y);
				cont.stroke();
				cont.strokeStyle = "rgb(0,0,0)";
			}
		}

		for(s = 0; s < this.series.length; s++)
		{
			var series = this.series[s];
			cont.beginPath();
			for(p = 0; p < series.points.length; p++)
			{
				var curr = series.points[p];
				//Move point into graph-space
				var height = canvas.height;
				var y = (canvas.height-bottomSpace) - (curr.y)*vScale + (vMin*vScale);
				//var yp = (canvas.height-bottomSpace) - (curr.y)*pScale + (vMin*pScale);
				var x = hScale*(curr.x-hMin)+leftSpace;

				if(this.options.type == "line" || this.options.type == "scatter")
				{
					if(this.options.type == "line")
					{
						//Main line
						cont.lineTo(x,y);
					}
					//Draw anchor for this point
					cont.fillStyle = curr.colour;
					cont.fillRect(x-2,y-2,4,4);
					cont.fillStyle = "rgb(0,0,0)";
				}
				if(this.options.type == "bar")
				{
					cont.fillStyle = curr.colour;
					var barwidth = hScale;
					if(this.options.barWidth != null && this.options.barWidth <= 1)
					{
						barwidth *= this.options.barWidth;
					}
					var baroffs = ( (this.options.barWidth < 1 ) ? ((1 - this.options.barWidth)/2)*hScale : 0 );
					barwidth /= (this.options.barOverlap ? 1 : this.series.length);
					var seriesWidth = (!this.options.barOverlap ? barwidth : 0 );
					cont.fillRect( (x + baroffs ) + seriesWidth*s ,y,barwidth,(curr.y*vScale) );
					cont.fillStyle = "rgb(0,0,0)";
				}
				//Add label for this point
				cont.textBaseline="top";
				cont.textAlign = "center";
				cont.fillStyle = jsgraph_textcol;
				if(curr.label == null)
					cont.fillText(curr.x, x,canvas.height-bottomSpace+2);
				else
					cont.fillText(curr.label, x,canvas.height-bottomSpace+2);
				cont.fillStyle = jsgraph_linecol;
			}
			cont.stroke(); 
		}

		//Draw border of graph
		cont.strokeRect(leftSpace,18,canvas.width-leftSpace-rightSpace,canvas.height-18-bottomSpace);

		//If the graph isn't finish drawing, re-add a timeout
		/*if(new Date().getTime() < this.start_time+jsgraph_showtime)
		{
			setTimeout("this.draw();", 100);
		}*/
	}
	//Add graph to jsgraph_graphs list
	jsgraph_graphs[jsgraph_graphs.length] = this;
}

function log(str)
{
	if(document.getElementById('jsgraph_out'))
		document.getElementById('jsgraph_out').innerHTML += str + "<br>";
}

function jsgraph_begin()
{
	draw();
}

function draw()
{
	for(g = 0; g < jsgraph_graphs.length; g++)
	{
		jsgraph_graphs[g].draw();
	}
}