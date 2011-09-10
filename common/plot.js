/* Touchop - Touchable operators
 *           function plotting
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

function plot(elt_x, elt_y) {
    var canvasId= "canvas";
    var canvas= document.getElementById(canvasId);

    // remove old plot
    var win = true;
    var path= document.getElementById("plotpath");
    path.setAttribute("d","");

    // build plot function
    if (elt_x==null) {
	var samples= 240;
	var fx= null
	var fy= eval("function(x) { return "+computeValue(elt_y)+" };" )
    } else {
	var samples= 16*9*25;
	var init= "function(t) { t= (t-0.5)*48*3.14159; return"
	var fx= eval(init + computeValue(elt_x)+" };" )
	var fy= eval(init + computeValue(elt_y)+" };" )
    }

    win= drawGraph(canvas, samples, fx, fy);
}

function drawGraph(canvas, samples, fx, fy) {
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
	    for (var j=0; j<canvas.childNodes.length; j++) {
		var child= canvas.childNodes[j];
		if (child.nodeName=="svg:circle") {
		    var cx= child.getAttribute("cx");
		    var cy= child.getAttribute("cy");
		    if (isBetween(xOld, yOld, x, y, cx, cy)) {
			winList[j]= true;
		    }
		    win= win && winList[j];
		}
	    }

	    // store old coordinates
	    yOld= y;
	    xOld= x;
	}
    }
    path.setAttribute("d", d);
    if (win) smile(1.0); else smile(0.0);
}

function isBetween(ax, ay, bx, by, cx, cy) {
    if (Math.abs(ax-bx)+Math.abs(ay-by)>0.1) {
	var crossproduct = (cy - ay) * (bx - ax) - (cx - ax) * (by - ay);
	if (Math.abs(crossproduct) < 2) {
	    var dotproduct = (cx - ax) * (bx - ax) + (cy - ay)*(by - ay);
	    if (dotproduct > -2) {
		var squaredlengthba = (bx - ax)*(bx - ax) + (by - ay)*(by - ay);
		if (dotproduct < squaredlengthba + 2) {
		    return true;
		}
	    }
	}
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

