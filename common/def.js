/* Touchop - Touchable operators
 *           variable definition and usage
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

// check a variable definition and set its validity
function validateDef(obj) {
    // find variable name to be defined
    var name= obj.getAttributeNS(topns, "def");
    var flag= "invalid";
    try {
	// check if the definition is complete
	if (!isCyclicDef(obj,name) && checkIsValid(obj))
	    flag= "valid";
    } catch(e) {
	// definition is invalid
    }
    // set the flag on all uases of that variable
    var oldFlag= obj.getAttribute("class");
    if (flag!=oldFlag) {
	obj.setAttribute("class",flag);
	setValidDef(document.childNodes[0], name, flag);
    }
}

// find all variable uses by name and set the validity flag
function setValidDef(obj, name, flag) {
    var use= obj.getAttributeNS(topns, "use");
    if (use==name)
	obj.setAttribute("class", flag);
    // recurse over all child elements
    for (var i=0; i<obj.childNodes.length; ++i) {
        var child= obj.childNodes[i];
        if (child.nodeType==1) {
	    setValidDef(child, name, flag);
	}
    }
}

// check if the definition for named variable is cyclic
function isCyclicDef(obj, name) {
    var use= obj.getAttributeNS(topns, "use");
    var cycle= (use==name);
    // recurse over child elements
    for (var i=0; i<obj.childNodes.length; ++i) {
        var child= obj.childNodes[i];
        if (child.nodeType==1) {
	    cycle = cycle || isCyclicDef(child, name);
	}
    }
    return cycle;
}
