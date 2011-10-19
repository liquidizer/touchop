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

function expandLayout(obj) {
}