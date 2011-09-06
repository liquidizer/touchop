/* Touchop - Touchable operators
 *           variable definition and usage
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

// this function checks if a block is complete and free of cycles
function isValid(obj) {
    try {
	// check if the definition is complete
	if (checkIsValid(obj, []) > 0)
	    return true;
    } catch(e) {
	// definition is cyclic
	if (e!="cycle")
	    throw e;
    }
    return false;
}

// check a variable definition and set its validity
function validateDef(obj) {
    var name= obj.getAttributeNS(topns, "def");
    if (name!=null) {
	// find variable name to be defined
	var flag= "invalid";
	if (isValid(obj))
	    flag= "valid";

	// set the flag on all uases of that variable
	var oldFlag= obj.getAttribute("class");
	if (flag!=oldFlag) {
	    obj.setAttribute("class",flag);
	    setValidDef(document.childNodes[0], name, flag);
	}
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
function checkIsValid(obj, list) {

    // if element is operand validate if movable content is found
    var value= 0;
    if (obj.getAttribute("onmousedown")!=null)
	value= value + 1;
    if (obj.getAttribute("class")=="operand")
	value= value - 1;

    // check cyclic definition
    var use= obj.getAttributeNS(topns, "use");
    if (use!="") {
	for (i=0; i<list.length; ++i) {
	    if (use==list[i]) {
		throw "cycle";
	    } else {
		var def= document.getElementById("def-"+use);
		value= value && checkIsValid(def, list);
	    }
	}
    }

    // check definitions for cycles
    var name= obj.getAttributeNS(topns, "def");
    if (name!="")
	list= list.concat([name]);

    // recurse over child elements
    for (var i=0; i<obj.childNodes.length; ++i) {
        var child= obj.childNodes[i];
        if (child.nodeType==1) {
	    value= value + checkIsValid(child, list);
	}
    }
    return value;
}