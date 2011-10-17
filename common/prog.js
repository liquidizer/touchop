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
	    if (hide!="") {
		var state= child.getAttribute("display");
		if (hide=="ontop" && isTop) {
		    child.setAttribute("display","none");
		} else { 
		    child.removeAttribute("display");
		}
	    }
	}
    }
}