/* Touchop - Touchable operators
 *           function plotting
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

function plot(obj) {
    var canvasId= "canvas";
    var canvas= document.getElementById(canvasId);
    var target= canvas.getAttributeNS(topns, "plot");
    var def= obj.getAttributeNS(topns, "def");
    if (target==def) {
	var f= function(x) { return computeValue(obj,x); }
	
	var win = true;
	// remove old plot
	var path= document.getElementById("plotpath");
	path.setAttribute("d","");
	// check if all objective nodes are traversed
	for (var i=0; i<canvas.childNodes.length; i) {
	    var child= canvas.childNodes[i];
	    i= i+1;
	    var x= child.getAttributeNS(topns, "x");
	    var y= child.getAttributeNS(topns, "y");
	    if (x!="" && y!="") {
		x= eval(x);
		y= eval(y);
		win = win && (Math.abs(y- f(x)) < 1e-3)
	    }
	}
	if (win) smile(1.0); else smile(0.0);

	drawGraph(canvas,f);
    }
}

function drawGraph(canvas, f) {
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
	var xf= i/128.0;
	var x= xf*(xmax-xmin)+xmin;
	var y= f(x);
	if (y==undefined || isNaN(y-y) || Math.abs(y-yOld)>(ymax-ymin)) {
	    delim=" M";
	} else {
	    d= d + delim + " " + size*xf + "," + yscale*(ymax-y);
	    delim= " L";
	}
	yOld= y;
    }
    path.setAttribute("d", d);
}

// Exactract the formula for the user created value.
function computeValue(obj, x) {
    // check for redirections
    var use= obj.getAttributeNS(topns, "use");
    if (use!="") {
	obj= document.getElementById("def-"+use);
	if (isCyclicDef(obj, use)) 
	    return null;
    }

    // The top:value attribute contains the formula
    var value= obj.getAttributeNS(topns, "value");
    if (value=="x") {
	return x;
    } else {
	// recurse through child elements to find open arguments
	var args= [];
	for (var i=0; i<obj.childNodes.length; ++i) {
	    if (obj.childNodes[i].nodeType==1) {
		// if the child node has a value, compute it and 
		// store in the argument list.
		var sub= computeValue(obj.childNodes[i], x);
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
    var y= computeValue(obj, 0);
    return y!=undefined;
}

// verify whether the new object satisfies the winning test
function verify(obj, isFinal) {
    var test= document.getElementById("def-y");
    plot(test);
}

