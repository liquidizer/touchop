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
		    // composite result, toggle layer view
		    var state= result.getAttribute("display");
		    state= state=="none";
		    var ctm=obj.getCTM();
		    var x= obj.getAttribute("img-x");
		    var y= obj.getAttribute("img-y");
		    // clicked, not dragged
		    if (state || Math.abs(x-ctm.e) + Math.abs(y-ctm.f) < 1) {
			state=!state;
			if (state || isValid(obj)) {
			    // set new layer vs. result state
			    setState(obj, state);
			}
			layout(obj);
		    }
		    ctm= obj.getCTM();
		    obj.setAttribute("img-x",ctm.e);
		    obj.setAttribute("img-y",ctm.f);
		    if (state)
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
	if (child.nodeName!="svg:rect") {
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

function findImage(obj, hidden) {
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1) {
	    var role= child.getAttributeNS(topns, "role");
	    // don't traverse into layers and hidden results
	    if ((!hidden && child.getAttribute("display")=="none") || role=="layer")
		continue;
	    // this is a atomic image, or a combined result from layers
	    if (role=="image" || role=="result")
		return child;
	    // recursive search
	    var img= findImage(child, hidden);
	    if (img!=null)
		return img;
	}
    }
    return null;
}

function layerLayout(obj) {
    var img= findImage(obj, true);
    if (img==null) {
	// obj is undefined
	obj.setAttribute("transform","matrix(1, 0, 0.5 ,0.5, 0, 0)");
    } else {
	var role= img.getAttributeNS(topns, "role");
	var disp= img.getAttribute("display");
	if (role=="image")
	    // obj is a base image
	    obj.setAttribute("transform","matrix(1, 0, 0.5 ,0.5, 0, 0)");
	else if (role="result" && disp!="none")
	    // obj is filter with displayed sub layers, do not sheer
	    obj.setAttribute("transform","matrix(1, 0, 0.5 ,0.5, 0, 0)");
	else
	    // if result is atomic or result image display sheered
	    obj.setAttribute("transform","scale(1, 0.8)");
    }
}