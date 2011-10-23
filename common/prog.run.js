/* Touchop - Touchable operators
 *           programming domain
 *
 * Copyright(C) 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

function compileToSVG(obj) {
    var child= obj.firstChild;
    // find program and canvas
    while (child!=null) {
	var type= child.getAttribute("class");
	if (type=="program")
	    var prog= child;
	if (type=="canvas")
	    var canvas= child;
	child= child.nextSibling;
    }
    // clear canvas
    while (canvas.firstChild) 
	canvas.removeChild(canvas.firstChild);
    // draw result
    var command= prog.lastChild.lastChild.getAttributeNS(topns, "run");
    try {
	var result= eval(command);
	var g= document.createElementNS(obj.namespaceURI, "g");
	g.setAttributeNS(topns, "drop", "none");
	g.setAttribute("onmousedown", "msDown(evt)");
	g.appendChild(result);
	canvas.appendChild(g);
    } catch (e) {
	console.log(e);
	// exception handling is missing
    }
}

function createXmlNode(prog) {
    var rect= document.createElementNS(document.firstChild.namespaceURI, "rect");
    rect.setAttribute("width",100);
    rect.setAttribute("height",100);
    rect.setAttribute("fill","purple");
   rect.setAttribute("opacity",0.7);
    return rect;
}