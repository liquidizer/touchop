/* Touchop - Touchable operators
 *           programming domain
 *
 * Copyright(C) 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

function verify() {
}

// A layout function that hides certain elements dynamically
// ontop: element is hidden if container is not embedded in another object
// notontop: todo
function hideChildren(obj) {
    var isTop= obj == findRoot(obj);
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child=obj.childNodes[i];
	if (child.nodeType==1) {
	    var hide= child.getAttributeNS(topns, "hide");
	    var isBlocked= child.lastChild;
	    if (isBlocked) {
		isBlocked= isBlocked.getAttribute("blocked");
		isBlocked= isBlocked!=null && eval(isBlocked);
	    }
	    if (hide!="") {
		var state= child.getAttribute("display");
		if (hide=="ontop" && isTop && !isBlocked) {
		    child.setAttribute("display","none");
		} else { 
		    child.removeAttribute("display");
		}
	    }
	}
    }
}

// layout an expandable list of arguments
function expandLayout(obj) {
    var operand= null;
    var arrow= null;
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1 && child.getAttribute("class")=="operand")
	    operand= child;
    }
    if (operand==null || hasContent(operand)) {
	obj.lastChild.removeAttribute("transform");
    } else {
	obj.lastChild.setAttribute("transform", "rotate(180)");
    }
}

function hasContent(obj) {
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1 && 
	    child.getAttribute("onmousedown"))
	    return true;
    }
    return false;
}

// expand a dynamic list of arguments
function expand(evt) {
    var obj= evt.target.parentNode;
    // rotate arrow
    var button= obj.lastChild;
    if (button.getCTM().d<0) {
	// remove object
	obj.removeChild(button.previousSibling);
    } else {
	// insert cloned node
	var container= evt.target;
	while (container.getAttributeNS(topns, "content")!="true")
	    container= container.previousSibling;
	var copy= container.firstChild.cloneNode(true);
	container= evt.target.parentNode;
	container.insertBefore(copy, evt.target);
    }
    // relayout
    layout(obj);
}

// a key is pressed
function checkTab(evt) {
    if (evt.which==9 || evt.which==0 || evt.which==13) {
	focusNext(evt);
	evt.preventDefault();
    }
}

function focusNext(evt) {
    var focus= null;
    var obj= document.activeElement;
    var root= findRoot(obj);
    while (obj!=root) {
	var child= obj.firstChild;
	// skip invisible operand elements
	// find traverse axis
	if (child!=null && isVisible(obj)) {
	    // traverse down
	    obj= child;
	} else {
	    // traverse to sibling, or up if not existent
	    if (evt.shiftKey!=1) {
		while (obj!=root && obj.nextSibling==null)
		    obj= obj.parentNode;
		if (obj!=root)
		    obj= obj.nextSibling;
	    } else {
		while (obj!=root && obj.previousSibling==null)
		    obj= obj.parentNode;
		if (obj!=root)
		    obj= obj.previousSibling;
	    }

	}
	if (obj.nodeType==1) {
	    var canFocus= obj!=root && obj.getAttributeNS(topns, "focus");
	    if (canFocus=="true") {
		obj.focus();
		return;
	    }
	}
    }
    msBlur(evt);
}
