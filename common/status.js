
var statusNo= 0;
var statusLen= 12;

function status(msg) {
    var root= document.firstChild;
    var old= document.getElementById("status-"+(statusNo-statusLen));
    if (old!=null)
	root.removeChild(old);
    for (var i=statusNo-statusLen; i<=statusNo; ++i) {
	var elt= document.getElementById("status-"+i);
	if (elt!=null) {
	    var y= elt.getAttribute("y");
	    elt.setAttribute("y", eval(y)-20);
	}
    }
    var txt= document.createElementNS(root.namespaceURI, "text");
    txt.appendChild(document.createTextNode(msg));
    txt.setAttribute("x", "20");
    txt.setAttribute("y", "350");
    txt.setAttribute("id", "status-"+statusNo);
    txt.setAttribute("style", "font-size:10pt;");
    root.appendChild(txt);
    statusNo= statusNo+1;

}

function path(obj) {
    if (obj==null || obj.nodeType!=1) {
	return "";
    } else {
	var str= obj.nodeName;
	str= str.replace(/^svg:/,"");
	if (obj.getAttribute("class")!=null)
	    str=str+"."+obj.getAttribute("class");
	return path(obj.parentNode)+"/"+str;
    }
}

