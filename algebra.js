/* Touchop - Touchable operators
 *           algebra domain
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

// Exactract the formula for the user created value.
function computeValue(obj) {
    // The top:value attribute contains the formula
    var value= obj.getAttributeNS(topns, "value");
    var args= [];

    // recurse through child elements to find open arguments
    for (var i=0; i<obj.childNodes.length; ++i) {
	if (obj.childNodes[i].nodeType==1) {
	    // if the child node has a value, compute it and 
	    // store in the argument list.
	    var sub= computeValue(obj.childNodes[i]);
	    if (sub!="") {
		args[args.length]= sub;
	    }
	}
    }

    // if value is a formula of child values
    if (value.indexOf("#")>=0) {
        // replace #n substrings with appropriate sub values
        for (var i=0; i<args.length; ++i) {
            var myex= new RegExp("#"+(i+1));
            value= value.replace(myex, args[i]);
        }
    } else {
        // By default return the one input argument
        if (args.length == 1)
            value= "("+args[0]+")";
    }
    return value;
}

// verify whether the new object satisfies the winning test
function verify(obj, isFinal) {
    var test= obj;
    while (obj.nodeType==1) {
	if (obj.getAttributeNS(topns,"value")!="")
	    test= obj;
	obj= obj.parentNode;
    }
    // extract the user created formula in json
    var value= computeValue(test);
    var win= false;
    try {
	// evalue the user created formula
	value= eval(value);
	// compare with the objective value
	var goal= document.getElementById("test").getAttribute("win");
        win= Math.abs(value-goal)<1e-12;
    } catch(e) {
    }
    if (win) {
	smile(1.0);

	// store the success persitently
	var key= document.getElementById("test").getAttribute("key");
	window.localStorage.setItem(key,"PASSED");
    } else {
	smile(0.0);
    }
}
