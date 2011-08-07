/* Touchop - Touchable operators
 *           turtle graphics domain
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

var current=null;
var start=null;
var turtle;
var win= false;
var winList= [];

function verify(obj, isFinal) {
    if (isFinal) {
	start= null;
	// find the top most group for playing
	while (obj.nodeType==1) {
	    if (obj.getAttributeNS(topns, "layout")!="")
		start= obj;
	    obj= obj.parentNode;
	}
	// if this is a program, execute
	if (start!=null) {
	    // reset tutle
	    turtle= document.getElementById("turtle");
	    turtle.setAttribute("transform","");
	    winList= [];
	    // remove old plot
	    var path= document.getElementById("plotpath");
	    path.setAttribute("d","");
	    checkPosition();
	    // check, if something is already executed
	    if (current==null) {
		current= start;
		setTimeout("executeNext()", 500);
	    } else {
		if (current.nodeType==1)
		    current.setAttribute("class","");
		current= start;
	    }
	} else {
	    current= null;
	}
    }
}

// execute the next command
function executeNext() {
    if (current!=null && current.nodeType==1) {
	var value= current.getAttributeNS(topns, "value");
	if (value!="") {
	    if (current.getAttribute("class")=="playback") {
		// already executed
		current.setAttribute("class","")
	    } else {
		// execute the next command and pause
		current.setAttribute("class","playback");
		m= turtle.getTransformToElement(turtle.parentNode);
		if (value=="F") {
		    m= m.translate(30,0);
		}
		else if (value=="R") {
		    m= m.rotate(-90);
		}
		else if (value=="B") {
		    m= m.rotate(90);
		}
		setTransform(turtle,m);
		checkPosition();
		setTimeout("executeNext()", 500);
		return;
	    }
	}
    }
    if (current.childNodes.length > 0) {
	var init= current.getAttributeNS(topns, "init");
	if (init!="")
	    current.setAttribute("state", init);
	current= current.firstChild;
	executeNext();
    } else {
	if (current.nextSibling!=null) {
	    current= current.nextSibling;
	    executeNext();
	} else {
	    while (current!=null && current.nextSibling==null) {
		current= current.parentNode;
		if (current!=null && current.nodeType==1) {
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
		if (current==start) {
		    current=null;
		    if (!win)
			smile(0.0);
		    return;
		}
	    }
	    if (current!=null) {
		current= current.nextSibling;
		executeNext();
	    }
	}
    }
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
