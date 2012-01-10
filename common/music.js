/* Touchop - Touchable operators
 *           Musical score setting
 *
 * Copyright(C) 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

function verify(obj, isFinal) {
}

function snapNote(obj) {
    var back= null;
    var blocked= false;
    for (var i=0; i<obj.childNodes.length; ++i) {
        child= obj.childNodes[i];
        if (child.nodeType==1) {
	    if (child.getAttribute("class")=="background") {
		// The first element is the reference position
		back= child;
	    }
	    else if (back!=null) {
		var m= child.getTransformToElement(obj);
		var box1= back.getBBox();
		var box2= child.getBBox();

		m.e = 0.5*box1.width;
		m.f = 0.5*box1.height;
		setTransform(child, m);

		if (child.getAttribute("onmousedown")!=null)
		    blocked= true;
	    }
	}
    }
    if (blocked) {
	obj.setAttribute("blocked","true");
	obj.parentNode.parentNode.appendChild(obj.parentNode);
    } else {
	obj.removeAttribute("blocked");
    }
}
