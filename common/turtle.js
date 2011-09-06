
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
	    current= obj;
	    executeNext();
	} else {
	    current= obj;
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
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1) {
	    if (child.getAttribute("class")=="playback")
		child.setAttribute("class","");
	    child.removeAttribute("next");
	    child.removeAttribute("state");
	    resetPlaybackStyle(child);
	}
    }
}

// execute the next command
function executeNext() {
    if (current==null) {
	if (!win) smile(0.0);
	return;
    }
    if (current.nodeType==1) {
	var state= current.getAttribute("state");
	if (state=="0") {
	    var id= current.getAttribute("next");
	    if (id!=null) {
		current= document.getElementById(id);
		if (current!=null)
		    current.removeAttribute("class");
	    } else {
 		if (current.nextSibling!=null) {
		    current= current.nextSibling;
		} else {
		    current= current.parentNode;
		}
	    }
	    executeNext();
	    return;
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
	// repetition
	var rep= current.getAttributeNS(topns,"repeat");
	if (state==null) {
	    if (rep=="")
		state= 1;
	    else
		state= rep;
	}
	current.setAttribute("state",state -1);

	// function call
	var use= current.getAttributeNS(topns, "use");
	if (use!="") {
	    var target= document.getElementById("def-"+use);
	    current.setAttribute("class","playback");
	    resetPlaybackStyle(target);
	    target.removeAttribute("state");
	    target.setAttribute("next",getId(current));
	    current= target;
	    executeNext();
	    return;
	}
    }
    // recurse through child nodes
    if (current.childNodes.length > 0) {
	resetPlaybackStyle(current);
	current= current.firstChild;
    } else {
 	if (current.nextSibling!=null) {
	    current= current.nextSibling;
	} else {
	    current= current.parentNode;
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
