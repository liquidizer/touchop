/* Touchop - Touchable operators
 *           programming domain
 *
 * Copyright(C) 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

function verify() {
}

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
	var opacity= obj.getAttribute("opacity");
	var display= obj.getAttribute("display");
	var visible= opacity!="0.0" && display!="none";
	// find traverse axis
	if (child!=null && child.nodeType==1 && visible) {
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
	var canFocus= obj!=root && obj.getAttributeNS(topns, "focus");
	if (canFocus=="true") {
	    obj.focus();
	    return;
	}
    }
    msBlur(evt);
}


