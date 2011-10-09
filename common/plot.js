/* Touchop - Touchable operators
 *           function plotting
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

function plot(elt_x, elt_y) {
    // remove old plot
    var win = true;
    var path= document.getElementById("plotpath");
    path.setAttribute("d","");

    // build plot function
    if (elt_x==null) {
	var samples= 240;
	var fx= null;
	var fy= function(x) { return eval(computeValue(elt_y)); };
    } else {
	var samples= 16*9*25;
	var init= "t=(t-0.5)*48*3.14159; return";
	var fx= new Function("t", init + computeValue(elt_x));
	var fy= new Function("t", init + computeValue(elt_y));
    }

    win= drawGraph(samples, fx, fy);
}

function drawGraph(samples, fx, fy) {
    var canvasId= "canvas";
    var canvas= document.getElementById(canvasId);

    var size= eval(canvas.getAttributeNS(topns, "size"));
    var xmin= eval(canvas.getAttributeNS(topns, "xmin"));
    var xmax= eval(canvas.getAttributeNS(topns, "xmax"));
    var ymin= eval(canvas.getAttributeNS(topns, "ymin"));
    var ymax= eval(canvas.getAttributeNS(topns, "ymax"));

    var xscale= size/(xmax-xmin);
    var yscale= size/(ymax-ymin);

    // create graph
    var path= document.getElementById("plotpath");
    var d= "";
    var yOld= NaN;
    var xOld= NaN;

    var winList= [];
    var win= false;
    var points= targetPoints(canvas);
    for (var i=0; i<=samples; ++i) {
	if (fx==null) {
	    var x= i*(xmax-xmin)/samples+xmin;
	    var y= fy(x);
	} else {
	    var x= fx(i/samples);
	    var y= fy(i/samples);
	}
	// scale to screen
	x= (x-xmin)*xscale;
	y= yscale*(ymax-y);

	// draw line or move cursor
	if (!isFinite(x) || !isFinite(y) 
	    || Math.abs(y-yOld) > size
	    || Math.abs(x-xOld) > size) {
	    xOld= NaN;
	    yOld= NaN;
	} else {
	    var delim= isFinite(xOld) ? " L" : " M";
	    d= d + delim + " " + x.toFixed(1) + "," + y.toFixed(1);
	    delim= " L";

	    // check if all objective nodes are traversed
	    win= true;
	    for (var j=0; j<points.length; j++) {
		var point= points[j];
		if (isBetween(xOld, yOld, x, y, point[0], point[1])) {
		    winList[j]= true;
		}
		win= win && winList[j];
	    }

	    // store old coordinates
	    yOld= y;
	    xOld= x;
	}
    }
    path.setAttribute("d", d);
    if (win) smile(1.0); else smile(0.0);
}

function targetPoints(canvas) {
    var points= [];
    for (var j=0; j<canvas.childNodes.length; j++) {
	var child= canvas.childNodes[j];
	if (child.nodeName=="svg:circle") {
	    var cx= eval(child.getAttribute("cx"));
	    var cy= eval(child.getAttribute("cy"));
	    points[points.length]= [cx,cy];
	}
    }
    return points;
}

function isBetween(ax, ay, bx, by, cx, cy) {
    var eps=0.1;
    var scale= Math.abs(ax-bx)+Math.abs(ay-by);
    if (scale > eps) {
	var crossproduct = (cy - ay) * (bx - ax) - (cx - ax) * (by - ay);
	if (Math.abs(crossproduct) < 1/scale) {
	    var dotproduct = (cx - ax) * (bx - ax) + (cy - ay)*(by - ay);
	    var scale2= scale*scale;
	    if (dotproduct > -scale2) {
		var squaredlengthba = (bx - ax)*(bx - ax) + (by - ay)*(by - ay);
		if (dotproduct < squaredlengthba + scale2) {
		    return true;
		}
	    }
	}
    } else {
	return Math.abs((ax+bx)/2-cx)+Math.abs((ay+by)/2-cy) < eps;
    }
    return false;
}

// Exactract the formula for the user created value.
function computeValue(obj) {
    // check for redirections
    var use= obj.getAttributeNS(topns, "use");
    if (use!="") {
	obj= document.getElementById("def-"+use);
    }

    // The top:value attribute contains the formula
    var value= obj.getAttributeNS(topns, "value");

    // recurse through child elements to find open arguments
    var args= [];
    for (var i=0; i<obj.childNodes.length; ++i) {
	if (obj.childNodes[i].nodeType==1) {
	    // if the child node has a value, compute it and 
	    // store in the argument list.
	    var sub= computeValue(obj.childNodes[i]);
	    if (sub!="") {
		sub= "("+sub+")";
		if (value=="") {
		    sub= sub.replace(/\u03c0/,Math.PI);
		    return sub;
		} else {
		    value= value.replace(/#[0-9]/,""+sub);
		}
	    }
	}
    }
    if (value.match(/#/)) throw "incomplete";
    return value;
}

// verify whether the new object satisfies the winning test
function verify(obj, isFinal) {
    if (isFinal && obj.getAttributeNS(topns, "def")!="") {
	var elt_x= document.getElementById("def-x");
	var elt_y= document.getElementById("def-y");
	try {
	    if ((elt_x==null || isValid(elt_x))
		&& isValid(elt_y))
		plot(elt_x, elt_y);
	} catch (e) {
	    if (e!="incomplete") throw e;
	}
    }
}

