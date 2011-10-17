
/* Touchop - Touchable operators
 *           turtle graphics domain
 *
 * Copyright(C) 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

var current=null;
var turtle= null;
var path= null;
var win= false;
var winList= [];

function verify(obj, isFinal) {
    if (isFinal && isValid(obj)) {
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
    path= document.getElementById("plotpath");
    path.setAttribute("d","");
    checkPosition();
}

// removes all playback styles and clears the implicit command stack
function resetPlaybackStyle(obj) {
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1) {
	    if (child.classList!=null &&
		child.classList.contains("playback"))
		child.classList.remove("playback");
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
		    current.classList.remove("playback");
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
	    if (current.classList.contains("playback")) {
		move(value);
		current.classList.remove("playback")
	    } else {
		// execute the next command and pause
		current.classList.add("playback");
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
	    current.classList.add("playback");
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

// push the current position on a stack
function push() {
    var m= turtle.getAttribute("transform");
    current.parentNode.setAttribute("stack", m);
}

// pop the turtle position from the stack
function pop() {
    var canvas= document.getElementById("canvas");
    var m= current.parentNode.getAttribute("stack");
    turtle.setAttribute("transform", m);
    var m= turtle.getTransformToElement(canvas);
    var d= path.getAttribute("d");
    d=d +" M "+m.e.toFixed(1)+","+m.f.toFixed(1);
    path.setAttribute("d",d);
}

// move the turtle according to the current command
function move(value) {
    var m= turtle.getTransformToElement(turtle.parentNode);
    eval(value);
    if (/^m=/.test(value)) {
	setTransform(turtle,m);
    }
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
    var d= path.getAttribute("d");
    if (d=="")
	d="M ";
    else
	d= d+ " L ";
    d= d + m1.e.toFixed(1) + "," + m1.f.toFixed(1);
    path.setAttribute("d", d);
}
