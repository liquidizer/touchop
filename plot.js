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
    var scale= canvas.getAttributeNS(topns, "scale");
    var target= canvas.getAttributeNS(topns, "plot");
    var def= obj.getAttributeNS(topns, "def");
    if (target!=def)
	return;

    // create graph
    var path= document.createElementNS(obj.namespaceURI, "path");
    var delim="M"
    var d= "";
    for (var i=0; i<20; ++i) {
	var x= i/10.0 - 1.0;
	var y= computeValue(obj, x);
	if (isNaN(y-y)) {
	    delim=" M";
	} else {
	    d= d + delim + " " + scale*x + "," + scale*y;
	    delim= " L";
	}
    }
    path.setAttribute("d", d);
    path.setAttribute("class","usergraph");

    // add graph onto the canvas
    while (canvas.childNodes.length>0)
	canvas.removeChild(canvas.childNodes[0]);
    canvas.appendChild(path);
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
	return eval(value);
    }
    return null;
}

// check if the expression is syntactically complete
function checkIsValid(obj) {
    try {
	computeValue(obj, 0);
	plot(obj);
	return true;
    } catch(e) {
	return false;
    }
}

// verify whether the new object satisfies the winning test
function verify(obj, isFinal) {
    return false
}

