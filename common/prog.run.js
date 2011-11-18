/* Touchop - Touchable operators
 *           programming domain
 *
 * Copyright(C) 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

function verify(obj) {
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1 && 
	    child.getAttributeNS(topns, "runnable")=="true") {
	    compileToSVG(child);
	    layout(child);
	}
    }
}

function compileToSVG(obj) {
    var child= obj.firstChild;
    var prog= null;
    var canvas= null;
    // find program and canvas
    while (child!=null) {
	var type= child.getAttribute("class");
	if (type=="program")
	    prog= child;
	if (type=="canvas")
	    canvas= child;
	child= child.nextSibling;
    }
    // clear canvas
    if (prog && canvas) {
	while (canvas.firstChild) 
	    canvas.removeChild(canvas.firstChild);

	// process result
	//    var xsl= document.getElementById('template').firstChild;
	var xsl= extractXSL(obj);
	serializeXML(xsl[0]);
	var xml= document.createElement("none");
	xsltProcessor=new XSLTProcessor();
	xsltProcessor.importStylesheet(xsl[0]);
	var result= xsltProcessor.transformToFragment(xml,document);

	// draw result
	var g= document.createElementNS(obj.namespaceURI, "g");
	if (result)
	    g.appendChild(result);
	canvas.appendChild(g);
    }
}

function extractXSL(obj) {
    var xsl= [];
    var args= [];
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1) {
	    var code= getCode(child);
	    if (code==null) {
		var sub=extractXSL(child);
		args= args.concat(sub);
	    } else {
		xsl.push(code);
	    }
	}
    }
    if (args.length>0) {
	if (xsl.length==0)
	    return args[0];
	for (var i=0; i<xsl.length; ++i) {
	    fillArgs(xsl[i], args);
	}
    }
    return xsl;
}

// Extract the XSL template associated with this element
function getCode(obj) {
    var cmd= obj.getAttributeNS(topns,"run");
    if (cmd!="") {
	// dynamically generate XSL
	return eval(cmd);
    } else {
	var type= obj.getAttribute("class");
	if (type=="top:run")
	    return obj.firstChild.cloneNode(true);
    }
    return null;
}

// dynamic XSL generation callback
function progOp(obj) {
    var xsl= extractXSL(obj);
    if (xsl.length==0) {
	return getInput(obj);
    }
    return xsl;
}

// get the text from an input field
function getInput(obj) {
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1) {
	    if (child.nodeName=="html:input")
		{
		    X=child;
		return child.value
	    }
	    var text= getInput(child);
	    if (text!=null)
		return text;
	}
    }
    return null;
}

function fillArgs(obj, args) {
    if (obj.getAttribute("name")=="top:arg") {
	var value= args.shift();
	obj.setAttribute("name", value);
    } else if (obj.nodeName=="top:arg") {
	var arg= args.shift();
	if (arg!=undefined) {
	    obj.parentNode.replaceChild(arg, obj);
	}
    } else {
	for (var i=0; i<obj.childNodes.length; ++i) {
	    var child= obj.childNodes[i];
	    if (child.nodeType==1) {
		fillArgs(child, args);
	    }
	}
    }
}
