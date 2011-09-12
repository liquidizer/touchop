/* Touchop - Touchable operators
 *           image processing domain
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

function verify(obj, isFinal) {
    var filter= null;
    if (isFinal && isValid(obj)) {
	for (var i=0; i<obj.childNodes.length; ++i) {
	    var child= obj.childNodes[i];
	    if (child.nodeType==1) {
		if (child.nodeName=="svg:filter") {
		    filter= child;
		    break;
		}
	    }
	}
	if (filter!=null) {
	    // evaluate the winning pattern
	    var test= document.getElementById("test");
	    var exp= test.getAttributeNS(topns, "test");
	    exp= exp.replace(/ /g,".*");
	    var serializer = new XMLSerializer ();
	    var str = serializer.serializeToString (filter);
	    if (str.match(new RegExp(exp)))
		smile(1.0);
	    else
		smile(0.0);
	}
    }
}


function updateFilter(obj) {
    var filter= null;
    var isvalid= isValid(obj);
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1) {
	    // search for filter components recursively
	    fillFilter(child, filter, true);
	    // reset the filter root
	    if (child.nodeName=="svg:filter") {
		if (isvalid) {
		    filter= child;
		    filter.setAttribute("arg_no",1);
		    for (var j=0; j<child.childNodes.length; ++j) {
			var layer= child.childNodes[j];
			var result= layer.getAttribute("result");
			if (result!=null && result.match(/^arg.*/)) {
			    child.removeChild(layer);
			    j= j-1;
			}
		    }
		}
	    }
	    // control visibility of the result
	    if (child.getAttribute("filter")!=null) {
		if (isvalid && obj==findRoot(obj))
		    child.removeAttribute("display");
		else
		    child.setAttribute("display","none");
	    }
	}
    }
 }

function fillFilter(obj, filter, hide) {
    if (filter!=null) {
	var use= obj.getAttributeNS(topns,"use");
	if (use!="") {
	    obj= document.getElementById("def-"+use);
	    if (isValid(obj))
		fillFilter(obj, filter, false);
	    return;
	}
    }
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1) {
	    // hide recursive results
	    if (hide && child.getAttribute("filter")!=null) {
		if (child.getAttribute("display")!="none") {
		    var ctm= obj.getCTM();
		    if (Math.abs(ctm.c)<0.1) {
			child.setAttribute("display","none");
			layout(obj);
		    }
		}
	    }
	    // copy filter elements to root filter
	    if (filter!=null && child.nodeName=="svg:filter") {
		var arg_no= filter.getAttribute("arg_no");
		var argId= "arg" + arg_no;
		var insAt= filter.firstChild;
		for (var j=0; j<child.childNodes.length; ++j) {
		    var layer= child.childNodes[j];
		    if (layer.nodeType==1) {
			layer= layer.cloneNode(true);
			updateFeId(layer, "in", argId);
			updateFeId(layer, "in2", argId);
			updateFeId(layer, "result", argId);
			filter.insertBefore(layer, insAt);
		    }
		}
		filter.setAttribute("arg_no", eval(arg_no) + 1);
		filter= null;
	    } else {
		fillFilter(child, filter, hide);
	    }
	}
    }
}

function updateFeId(obj, name, argId) {
    var result= obj.getAttribute(name);
    if (result!=null)
	obj.setAttribute(name, argId+"_"+result);
    else
	if (name=="result")
	    obj.setAttribute(name, argId);
}

function layerLayout(obj) {
    if (isSheered(obj)) {
	obj.setAttribute("transform","scale(1, 0.9)");
    } else {
	obj.setAttribute("transform","matrix(1, 0, -0.3 ,0.5, 0, 0)");
    }
}

function isSheered(obj) {
    var result= false;
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1 && child.getAttribute("display")!="none" &&
	    child.transform!=undefined) {
	    var ctm= child.getTransformToElement(obj);
	    result= result || Math.abs(ctm.c) > 0.1;
	    result= result || isSheered(child);
	}
    }
    return result;
}
