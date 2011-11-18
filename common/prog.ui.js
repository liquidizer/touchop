/* Touchop - Touchable operators
 *           programming domain
 *
 * Copyright(C) 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

function runCode(evt) {
    verify(findRoot(evt.target));
}

function hasContent(obj) {
    var ithas= obj.getAttribute("onmousedown")!=null;
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1) {
	    ithas= ithas || hasContent(child);
	}
    }
    return ithas;
}

// expand a dynamic list of arguments
function expand_add(evt) {
    var parent= evt.target;
    while (!parent.getAttribute("onmousedown"))
	parent= parent.parentNode;

    // clone prototype
    var container= parent.firstChild;
    while (container.getAttributeNS(topns, "content")!="true") {
	container= container.nextSibling;
    }
    var obj= container.firstChild.cloneNode(true);
    obj.setAttributeNS(topns, "copy", "true");

    // insert
    parent.insertBefore(obj, parent.lastChild);

    // relayout
    eval(obj.getAttributeNS(topns,"layout"));
    layout(parent);
}

function expand_remove(evt) {
    var parent= evt.target.parentNode.parentNode;
    var child= parent.lastChild;
    while (child) {
	if (child.nodeType==1 &&
	    child.getAttributeNS(topns,"copy")=="true" &&
	    !hasContent(child)) {
	    parent.removeChild(child);
	    break;
	}
	child= child.previousSibling;
    }
    // relayout
    layout(parent);
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

