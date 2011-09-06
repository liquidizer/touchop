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
	var samples= 384;
	var fx= null
	var fy= function(t) { return computeValue(elt_y, "x", t); }
    } else {
	var samples= 1024;
	var ft= function(t) { return (t-0.5)*48*3.14159; }
	var fx= function(t) { return computeValue(elt_x, "t", ft(t)); }
	var fy= function(t) { return computeValue(elt_y, "t", ft(t)); }
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
	    var t= i/samples;
	if (fx==null) {
	    var x= t*(xmax-xmin)+xmin;
	    var y= fy(x);
	} else {
	    var x= fx(t);
	    var y= fy(t);
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
	    d= d + delim + " " + x + "," + y;
	    delim= " L";

	    // check if all objective nodes are traversed
	    win= true;
	    for (var j=0; j<canvas.childNodes.length; j++) {
		var child= canvas.childNodes[j];
		if (child.nodeName=="svg:circle") {
		    var cx= child.getAttribute("cx");
		    var cy= child.getAttribute("cy");
		    if (Math.abs((xOld-x)*(cy-y)-(cx-x)*(yOld-y))<1) {
			//		    if (Math.abs(cx-x) + Math.abs(cy-y) < 1) {
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


// Exactract the formula for the user created value.
function computeValue(obj, varname, x) {
    // check for redirections
    var use= obj.getAttributeNS(topns, "use");
    if (use!="") {
	obj= document.getElementById("def-"+use);
	if (isCyclicDef(obj, use)) 
	    return null;
    }

    // The top:value attribute contains the formula
    var value= obj.getAttributeNS(topns, "value");
    value= value.replace(/\u03c0/, "(3.14159)");
    if (value==varname) {
	return x;
    } else {
	// recurse through child elements to find open arguments
	var args= [];
	for (var i=0; i<obj.childNodes.length; ++i) {
	    if (obj.childNodes[i].nodeType==1) {
		// if the child node has a value, compute it and 
		// store in the argument list.
		var sub= computeValue(obj.childNodes[i], varname, x);
		if (sub!=null) {
		    if (value=="") {
			return sub;
		    } else {
			value= value.replace(/#[0-9]/,""+sub);
		    }
		}
	    }
	}
	if (value.match(/#/)) throw "incomplete";
	return eval(value);
    }
    return null;
}

// check if the expression is syntactically complete
function checkIsValid(obj) {
    var elt_x= document.getElementById("def-x");
    try {
	if (elt_x==null)
	    var y= computeValue(obj, "x", 0);
	else 
	    var y= computeValue(obj, "t", 0);
	return y!=undefined;
    } catch (e) {
	if (e=="incomplet") return false;
	throw e;
    }
}

// verify whether the new object satisfies the winning test
function verify(obj, isFinal) {
    if (isFinal && obj.getAttributeNS(topns, "def")!="") {
	var elt_x= document.getElementById("def-x");
	var elt_y= document.getElementById("def-y");
	try {
	    plot(elt_x, elt_y);
	} catch (e) {
	    if (e!="incomplete") throw e;
	}
    }
}

