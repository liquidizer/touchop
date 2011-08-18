
/* Touchop - Touchable operators
 *           turtle graphics domain
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

var current=null;
var turtle;
var win= false;
var winList= [];

function verify(obj, isFinal) {
    if (isFinal) {
	resetTurtle();
	obj.setAttribute("next", "STOP");
	// check, if something is already executed
	if (current==null) {
	    current= obj.firstChild;
	    executeNext();
	} else {
	    current= obj.firstChild;
	}
    } else {
	resetTurtle();
	current=null;
    }
}

// reset the turtle animation to its initial position
function resetTurtle() {
    // reset coloring
    resetPlaybackStyle(document.firstChild);
    // reset tutle
    turtle= document.getElementById("turtle");
    turtle.setAttribute("transform","");
    winList= [];
    // remove old path
    var path= document.getElementById("plotpath");
    path.setAttribute("d","");
    checkPosition();
}

// removes all playback styles and clears the implicit command stack
function resetPlaybackStyle(obj) {
    if (obj.getAttribute("class")=="playback")
	obj.setAttribute("class","");
    if (obj.getAttribute("next")!=null)
	obj.removeAttribute("next");
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1)
	    resetPlaybackStyle(child);
    }
}

// execute the next command
function executeNext() {
    if (current==null) return;
    if (current.nodeType==1) {
	alert("recurse "+current.nodeName);
	var id= current.getAttribute("next");
	if (id!=null) {
	    current.removeAttribute("next");
	    current= document.getElementById(id);
	    if (current==null) {
		if (!win)
		    smile(0.0);
		return;
	    }
	}
	var value= current.getAttributeNS(topns, "value");
	if (value!="") {
	    if (current.getAttribute("class")=="playback") {
		move(value);
		current.setAttribute("class","")
	    } else {
		// execute the next command and pause
		current.setAttribute("class","playback");
		setTimeout("executeNext()", 500);
		return;
	    }
	}
    }
    // recurse through child nodes
    if (current.childNodes.length > 0) {
	current.setAttribute("next", getId(current.parentNode));
	var init= current.getAttributeNS(topns, "init");
	if (init!="")
	    current.setAttribute("state", init);
	current= current.firstChild;
    } else {
	if (current.nextSibling!=null) {
	    current= current.nextSibling;
	    executeNext();
	} else {
	    current= current.parentNode;
	    var state= current.getAttribute("state");
	    var update= current.getAttributeNS(topns,"update");
	    if (update!="") {
		state= eval(update.replace(/#/g, state));
		current.setAttribute("state", state);
	    }
	    var stop= current.getAttributeNS(topns,"stop");
	    if (stop!="") {
		stop= eval(stop.replace(/#/g, state));
		if (!stop) {
		    current= current.firstChild;
		    executeNext();
		    return;
		}
	    }
	}
    }
    executeNext();
}

function move(value) {
    var m= turtle.getTransformToElement(turtle.parentNode);
    m= eval("m."+value);
    setTransform(turtle,m);
    checkPosition();
}

// check if the position matches the level objective
function checkPosition() {
    var canvas= document.getElementById("canvas");
    var	m1= turtle.getTransformToElement(canvas);
    win= true;
    for (var i=0; i<canvas.childNodes.length; i++) {
	var child= canvas.childNodes[i];
	if (child.nodeName=="svg:circle") {
	    var m2= child.getTransformToElement(canvas);
	    var x= child.getAttribute("cx");
	    var y= child.getAttribute("cy");
	    if (Math.abs(m1.e-x) + Math.abs(m1.f-y) < 1) {
		winList[i]= true;
	    }
	    win= win && winList[i];
	}
    }
    if (win)
	smile(1.0);
    // draw trail
    var path= document.getElementById("plotpath");
    var d= path.getAttribute("d");
    if (d=="") {
	d= "M "+m1.e+","+m1.f;
    } else {
	d= d+" L "+m1.e+","+m1.f;
    }
    path.setAttribute("d", d);
}

// check if the expression is syntactically complete
function checkIsValid(obj) {
    return true;
}
