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
	var range= [0,128,1];
	var fx= null
	var fy= function(t) { return computeValue(elt_y, "x", t); }
    } else {
	var fx= function(t) { return computeValue(elt_x, "t", t); }
	var fy= function(t) { return computeValue(elt_y, "t", t); }
    }

    // check if all objective nodes are traversed
    for (var i=0; i<canvas.childNodes.length; i) {
	var child= canvas.childNodes[i];
	i= i+1;
	var x= child.getAttributeNS(topns, "x");
	var y= child.getAttributeNS(topns, "y");
	if (x!="" && y!="") {
	    x= eval(x);
	    y= eval(y);
	    win = win && (Math.abs(y- fy(x)) < 1e-3)
	}
    }
    if (win) smile(1.0); else smile(0.0);

    drawGraph(canvas, fx, fy);
}

function drawGraph(canvas, fx, fy) {
    var size= eval(canvas.getAttributeNS(topns, "size"));
    var xmin= eval(canvas.getAttributeNS(topns, "xmin"));
    var xmax= eval(canvas.getAttributeNS(topns, "xmax"));
    var ymin= eval(canvas.getAttributeNS(topns, "ymin"));
    var ymax= eval(canvas.getAttributeNS(topns, "ymax"));

    var xscale= size/(xmax-xmin);
    var yscale= size/(ymax-ymin);

    // create graph
    var path= document.getElementById("plotpath");
    var delim="M"
    var d= "";
    var yOld=(ymax-ymin)/2.0;

    for (var i=0; i<=128; ++i) {
	if (fx==null) {
	    var t= i/128.0;
	    var x= t*(xmax-xmin)+xmin;
	    var y= fy(x);
	} else {
	    var pi= 3.14159;
	    var t= i/128.0 * 35*pi -3;
	    var x= fx(t);
	    var y= fy(t);
	}
	if (y==undefined || isNaN(y-y) || Math.abs(y-yOld)>(ymax-ymin)) {
	    delim=" M";
	} else {
	    d= d + delim + " " + (x-xmin)*yscale + "," + yscale*(ymax-y);
	    delim= " L";
	}
	yOld= y;
    }
    path.setAttribute("d", d);
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
	if (value.match(/#/)) return undefined
	return eval(value);
    }
    return null;
}

// check if the expression is syntactically complete
function checkIsValid(obj) {
    var elt_x= document.getElementById("def-x");
    if (elt_x==null)
	var y= computeValue(obj, "x", 0);
    else 
	var y= computeValue(obj, "t", 0);
    return y!=undefined;
}

// verify whether the new object satisfies the winning test
function verify(obj, isFinal) {
    var elt_x= document.getElementById("def-x");
    var elt_y= document.getElementById("def-y");
    plot(elt_x, elt_y);
}

