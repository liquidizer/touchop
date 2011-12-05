/* Touchop - Touchable operators
 *           programming domain
 *
 * Copyright(C) 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */
var xslns= "http://www.w3.org/1999/XSL/Transform";

function verify(obj, isFinal) {
    if (isFinal) {
	for (var i=0; i<obj.childNodes.length; ++i) {
	    var child= obj.childNodes[i];
	    if (child.nodeType==1 && 
		child.getAttributeNS(topns, "runnable")=="true") {
		compileToSVG(child);
		layout(child);
	    }
	}
    }
}

function compileToSVG(obj) {
    console.log("compile");
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
	try {
	xsltProcessor.importStylesheet(xsl[0]);
	} catch (e) {
	    E=e;
	}
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
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1 && 
	    child.getAttribute("visibility")!="hidden" &&
	    child.getAttribute("display")!="none") {
	    var code= getCode(child);
	    if (code==null) {
		var sub=extractXSL(child);
		xsl= xsl.concat(sub);
	    } else {
		xsl.push(code);
	    }
	}
    }
    var target= [];
    while (xsl.length>0) {
	var head= xsl.shift();
	if (xsl.length>0) {
	    fillArgs(head, xsl);
	}
	target.push(head);
    }
    return target;
}

// Extract the XSL template associated with this element
function getCode(obj) {
    var code= null;
    var cmd= obj.getAttributeNS(topns,"run");
    if (cmd!="") {
	// dynamically generate XSL
	code= eval(cmd);
    } else {
	var type= obj.getAttribute("class");
	if (type=="top:run") {
	    code= obj.firstChild.cloneNode(true);
	}
    }
    return code;
}

// dynamic XSL generation callback
function progOp(obj) {
    var xsl= extractXSL(obj);
    if (xsl.length==0) {
	xsl= getInput(obj);
    } else {
	if (xsl.length==1)
	    xsl=xsl[0];
	else {
	    var block= document.createElementNS(xslns, "if");
	    block.setAttribute("test","1=1");
	    for (var i=0; i<xsl.length; ++i)
		block.appendChild(toNode(xsl[i]));
	    xsl= block;
	}
    }
    return xsl;
}

// get the text from an input field
function getInput(obj) {
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1) {
	    if (child.nodeName=="html:input")
		return child.value
	    var text= getInput(child);
	    if (text!=null)
		return text;
	}
    }
    return null;
}

function toNode(obj) {
    if (!obj.nodeType) {
	if (obj=="") obj="''";
	var vo= document.createElementNS(xslns, "value-of");
	vo.setAttribute("select",obj);
	return vo;
    }
    return obj;
}

function fillArgs(obj, args) {
    if (!obj.nodeType) return;
    if (obj.getAttribute("name")=="top:arg") {
	var value= args.shift();
	obj.setAttribute("name", value);
    }
    if (obj.nodeName=="top:arg") {
	if (args.length>0) {
	    var arg= toNode(args.shift());
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
