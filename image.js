/* Touchop - Touchable operators
 *           image processing domain
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

function verify(obj, isFinal) {
    if (isFinal) {
	while (obj!=null) {
	    if (obj.nodeType==1) {
		var result= obj.lastChild;
		if (result.getAttributeNS(topns, "role")=="result") {
		    var state= result.getAttribute("display");
		    state= state!="none";
		    if (state || checkIsValid(obj)) {
			setState(obj, state);
		    }
		    layout(result);
		    return;
		}
	    }
	    obj= obj.parentNode;
	}
    }
}

function setState(obj, state) {
    var result= obj.lastChild;
    setDisplay(result, !state);
    for (var i=obj.childNodes.length-2; i>=0; --i) {
	var child= obj.childNodes[i];
	if (child.nodeName=="svg:g") {
	    if (state)
		setDisplay(child, true);
	    if (child.getAttributeNS(topns, "role")=="layer") {
		var img= findImage(child);
		if (state) {
		    img.appendChild(result.lastChild.childNodes[0]);
		} else {
		    result.lastChild.appendChild(img.lastChild);
		}
	    }
	    if (!state)
		setDisplay(child, false);
	}
    }
}

function setDisplay(obj, state) {
    if (state)
	obj.removeAttribute("display");
    else
	obj.setAttribute("display","none");
}

function checkIsValid(obj) {
    if (obj.getAttributeNS(topns, "role")=="layer") {
	return findImage(obj)!=null;
    } else {
	var valid= true;
	for (var i=0; i<obj.childNodes.length; ++i) {
	    var child= obj.childNodes[i];
	    if (child.nodeType==1) {
		valid = valid && checkIsValid(child);
	    }
	}
	return valid;
    }
}

function findImage(obj) {
    if (obj.getAttribute("display")=="none")
	return null;
    var role= obj.getAttributeNS(topns, "role");
    if (role=="image" || role=="result")
	return obj;
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1) {
	    var img= findImage(child);
	    if (img!=null)
		return img;
	}
    }
    return null;
}
