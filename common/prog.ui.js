/* Touchop - Touchable operators
 *           programming domain
 *
 * Copyright(C) 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

function verify() {
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
function navigation(evt) {
    var obj= document.activeElement;
    var key= evt.keyCode;
    if (key==13 || key==40 || !evt.shiftKey && key==9) {
	focusNext(obj, true);
	evt.preventDefault();
    } 
    else if (key==38 || key==9) {
	focusNext(obj, false);
	evt.preventDefault();
    }
}

function focusNext(obj, dir) {
    var focus= null;
    var root= findRoot(obj);
    while (obj!=root) {
	var child= obj.firstChild;
	if (!dir)
	    child= obj.lastChild;
	// skip invisible operand elements
	// find traverse axis
	if (child!=null && isVisible(obj)) {
	    // traverse down
	    obj= child;
	} else {
	    // traverse to sibling, or up if not existent
	    if (dir) {
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
	    var canFocus= obj!=root && obj.nodeName=="html:input"
	    if (canFocus) {
		obj.focus();
		return;
	    }
	}
    }
    if (document.activeElement && document.activeElement.blur)
	document.activeElement.blur();
}
