/* Touchop - Touchable operators
 *           algebra domain
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

// Exactract the formula for the user created value.
function computeValue(obj) {
    // check for redirections
    var use= obj.getAttributeNS(topns, "use");
    if (use!="") {
	obj= document.getElementById("def-"+use);
	if (isCyclicDef(obj, use)) 
	    return null;
    }

    // The top:value attribute contains the formula
    var value= obj.getAttributeNS(topns, "value");

    // recurse through child elements to find open arguments
    var args= [];
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
            value= value.replace("#"+(i+1), args[i]);
        }
    } else {
        // By default return the one input argument
        if (args.length == 1)
            value= "("+args[0]+")";
    }
    return value;
}

// check if the expression is syntactically complete
function checkIsValid(obj) {
    var value= computeValue(obj);
    return value.length>0 && value.indexOf("#") < 0;
}

// verify whether the new object satisfies the winning test
function verify(obj, isFinal) {
    // extract the user created formula in json
    var value= computeValue(obj);
    var win= true;

    // construct the objective function
    var goal= document.getElementById("test").getAttribute("win");
    goal= "("+value+") - ("+goal+")";
    goal= goal.replace(/([0-9]) ([a-zA-Z])/g, '$1*($2)');

    // check for free variables
    var vars= goal.match(/[a-zA-Z]+([) ])/g);
    if (vars==null) vars=[];

    try {
	var tries= 1 + 10*vars.length;
	for (var i=0; win && i<tries; ++i) {
	    var eps= goal;
	    for (var j=0; j<vars.length; ++j) {
		var no= "("+(Math.random()*6-3)+")";
		var name= vars[j].substring(0,vars[j].length-1);
		var term= vars[j].charAt(vars[j].length-1);
		eps= eps.replace(new RegExp(name+"([ )])","g"), no + "$1");
	    }
	    // compare with the objective value
	    win= win && Math.abs(eval(eps))<1e-12;
	}
    } catch(e) {
	win= false;
    }
    if (win) {
	smile(1.0);
    } else {
	smile(0.0);
    }
}
