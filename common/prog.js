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
    var container= obj.firstChild;
    while (container.getAttributeNS(topns, "filled")=="")
	container= container.nextSibling;
    if (container.getAttributeNS(topns, "filled")=="false") {
	obj.parentNode.insertBefore(document.createComment("dynamic content"), obj);
	container.appendChild(obj.nextSibling);
	container.setAttributeNS(topns, "filled", "true");
    }
    var lastInsert= obj.previousSibling;
    //if (lastInsert.nodeType==1) {
    container= container.nextSibling;
    container.setAttribute("transform","");
    //}
 }

// expand a dynamic list of arguments
function expand(evt) {
    var container= evt.target.previousSibling;
    if (container.getAttributeNS(topns, "filled")!="true")
	throw "expand without prototype";
    // rotate arrow
    //container.nextSibling.setAttribute("transform","rotate(180)");
    // insert cloned node
    var copy= container.firstChild.cloneNode(true);
    container= container.parentNode;
    container.parentNode.insertBefore(copy, container);
    // relayout
    layout(container.parentNode);
}

// a key is pressed
function checkTab(evt) {
    if (evt.which==9 || evt.which==0 || evt.which==13) {
	focusNext(evt);
	evt.preventDefault();
    }
}

// check if element is visible
function isVisible(obj) {
    var opacity= obj.getAttribute("opacity");
    var display= obj.getAttribute("display");
    return opacity!="0.0" && display!="none";
}

function focusNext(evt) {
    var focus= null;
    var obj= document.activeElement;
    var root= findRoot(obj);
    while (obj!=root) {
	var child= obj.firstChild;
	// skip invisible operand elements
	// find traverse axis
	if (child!=null && child.nodeType==1 && isVisible(obj)) {
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
